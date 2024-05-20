import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "./Spinner";

// Configure the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

// Define a constant array of available colors
const COLORS = ["black", "red", "green", "blue", "white"];

// Define CSS classes for background colors
const backgroundColors: any = {
  black: "bg-black",
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  white: "bg-white",
};

// Define the PDFEditor component
const PDFEditor: React.FC = () => {
  const [pdfNumPages, setPdfNumPages] = useState<number>(0);
  const [pdfPageWidth, setPdfPageWidth] = useState<number>(0);
  const [pdfPageHeight, setPdfPageHeight] = useState<number>(0);
  const [isPaintEnabled, setPaintEnabled] = useState<boolean>(true);
  const [tempPageArray, setTempPageArray] = useState<number[]>([]);
  const [brushSize, setBrushSize] = useState<number>(5);
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const [key, setKey] = useState(0);
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [isHeader, setIsHeader] = useState<boolean>(false);
  const [isOpenSave, setIsOpenSave] = useState<boolean>(false);
  const isFirefox = /Firefox\//.test(navigator.userAgent);
  const marginTop = isFirefox ? "90px" : "1px";
  const [isSingleTouch, setIsSingleTouch] = useState<boolean>(true);
  const { index } = useParams();
  const pdfUrl = `/pdfs/${index}`;
  const navigate = useNavigate();

  // const { index } = useParams();
  const [filesData, setFilesData] = useState<any[]>(
    JSON.parse(localStorage.getItem("data") as any)
  );
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);

  useEffect(() => {
    // Get filesData from localStorage or an API call
    const storedFilesData = JSON.parse(localStorage.getItem("data") || "[]");
    setFilesData(storedFilesData);

    // Find the index of the current filename in filesData
    const foundIndex = storedFilesData.findIndex(
      (file: any) => file.filename === index
    );
    setCurrentFileIndex(foundIndex !== -1 ? foundIndex : 0);
  }, [index]);

  const handlePrev = () => {
    if (currentFileIndex > 0) {
      // setCurrentFileIndex(currentFileIndex - 1);
      navigate(`/editPDF/${filesData[currentFileIndex - 1].filename}`);
    }
  };

  const handleNext = () => {
    if (currentFileIndex < filesData.length - 1) {
      // setCurrentFileIndex(currentFileIndex + 1);
      navigate(`/editPDF/${filesData[currentFileIndex + 1].filename}`);
    }
  };

  const currentFile = filesData[currentFileIndex];

  // Variables for drawing functionality
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Toggle paint functionality
  const togglePaint = () => {
    setPaintEnabled(!isPaintEnabled);
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // Function to update the brush size
  const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setBrushSize(Math.min(50, Math.max(0, newSize)));
  };

  // Get cursor class based on paint state
  const getCursorClassName = () => {
    return isPaintEnabled ? "cursor-crosshair" : "cursor-pointer";
  };

  // Start drawing on canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintEnabled) return;
    isDrawing = true;
    [lastX, lastY] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
  };

  // Start drawing on canvas for touch events
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPaintEnabled) return;
    isDrawing = true;
    const touch = e.touches[0];
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    // Get the device's pixel ratio
    const dpi = window.devicePixelRatio;

    // Adjust touch coordinates for DPI
    [lastX, lastY] = [
      (touch.clientX - rect.left) * dpi,
      (touch.clientY - rect.top) * dpi,
    ];
  };

  // Draw on canvas
  const drawOnCanvas = (
    e: React.MouseEvent<HTMLCanvasElement>,
    ctx: CanvasRenderingContext2D
  ) => {
    if (!isDrawing || !isPaintEnabled) return;

    // Get the device's pixel ratio
    const dpi = window.devicePixelRatio;

    ctx.strokeStyle = selectedColor;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(lastX * dpi, lastY * dpi);
    ctx.lineTo(e.nativeEvent.offsetX * dpi, e.nativeEvent.offsetY * dpi);
    ctx.stroke();
    [lastX, lastY] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
  };

  const drawOnCanvasTouch = (
    e: React.TouchEvent<HTMLCanvasElement>,
    ctx: CanvasRenderingContext2D,
    target: HTMLCanvasElement
  ) => {
    ctx.strokeStyle = selectedColor;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = brushSize;
    // Get the device's pixel ratio
    const dpi = window.devicePixelRatio;

    // Adjust touch coordinates for DPI
    const touch = e.touches[0];
    const rect = target.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(
      (touch.clientX - rect.left) * dpi,
      (touch.clientY - rect.top) * dpi
    );
    ctx.stroke();
    [lastX, lastY] = [
      (touch.clientX - rect.left) * dpi,
      (touch.clientY - rect.top) * dpi,
    ];
  };

  // Handle drawing
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      if (!isDrawing || !isPaintEnabled) return;
      const ctx = (e.target as any)?.getContext("2d");
      if (ctx) {
        drawOnCanvas(e, ctx);
      }
    } catch (e) {
      console.log(e, "error");
    }
  };

  // Handle touch events for drawing
  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    try {
      if (e.touches.length > 1) {
        setIsSingleTouch(false);
        return;
      } else {
        setIsSingleTouch(true);
      }
      if (!isDrawing || !isPaintEnabled) return;
      const target = e.target as HTMLCanvasElement;
      const ctx = target.getContext("2d");
      if (ctx) {
        drawOnCanvasTouch(e, ctx, target);
      }
    } catch (e) {
      console.log(e, "error");
    }
  };

  // End drawing
  const endDrawing = () => {
    isDrawing = false;
  };

  // Initialize canvas dimensions when PDF dimensions change
  useEffect(() => {
    canvasRefs.current.forEach((canvas, pageIndex) => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = pdfPageWidth;
        canvas.height = pdfPageHeight;
        // Clear the overlay canvas initially
        if (ctx) ctx.clearRect(0, 0, pdfPageWidth, pdfPageHeight);
      }
    });
  }, [pdfPageWidth, pdfPageHeight]);

  useEffect(() => {
    setTempPageArray(Array.from({ length: pdfNumPages }, (_, i) => i + 1));
  }, [pdfNumPages]);

  // Function to save the edited PDF
  const saveEditedPdf = async () => {
    try {
      setIsHeader(false);
      setIsLoader(true);
      setIsOpenSave(false);
      const existingPdfBytes = await fetch(pdfUrl).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      for (let i = 0; i < pdfNumPages; i++) {
        const canvas = document.querySelectorAll("canvas")[i];
        if (!canvas) continue;

        const overlayCtx = canvas.getContext("2d");
        if (!overlayCtx) continue;

        const overlayUrl = canvas.toDataURL(); // Get the data URL of the canvas
        const overlayImage = await pdfDoc.embedPng(overlayUrl); // Embed the canvas as an image in the PDF
        const pages = pdfDoc.getPages();
        const page = pages[i];
        page.drawImage(overlayImage, {
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
        });
      }

      const editedPdfBytes = await pdfDoc.save();
      const editedPdfBlob = new Blob([editedPdfBytes], {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("pdfFile", editedPdfBlob, currentFile.filename);

      // Send the file to the Node.js server
      const response = await fetch("http://localhost:5399/upload", {
        method: "POST",
        body: formData,
      });

      console.log(response, "response");

      if (response.ok) {
        // File uploaded successfully
        setIsLoader(false);
        setIsHeader(true);
        toast.success("File saved successfully");
      } else {
        throw new Error("Failed to upload file.");
      }
      setIsLoader(false);
      setIsHeader(true);
      toast.success("file saved successfullyditPDF/sample.pdf");
    } catch (error) {
      console.error("Error while saving edited PDF:", error);
    }
  };

  // Function to clear the paint on pages
  const clearPage = () => {
    setKey((prevKey) => prevKey + 1);
  };

  // Handle clear page button click
  const handleClearPage = () => {
    clearPage();
  };

  return (
    <div className="flex justify-center">
      <div
        className=""
        style={{
          height: "-webkit-fill-available",
          marginTop: `${marginTop}`,
          width: "820px",
        }}
      >
        <div
          className={!isHeader ? "hidden" : "flex justify-around bg-slate-300"}
        >
          <div className="flex">
            <button
              className="mx-1 rounded-md px-2 my-1 text-white bg-gray-500"
              onClick={handlePrev}
            >
              prev
            </button>
            <button
              className="mx-1 rounded-md px-2 my-1 text-white bg-gray-500"
              onClick={() => setIsOpenSave(true)}
            >
              Save
            </button>
            <button
              className="mx-1 rounded-md px-2 my-1 text-white bg-gray-500"
              onClick={handleClearPage}
            >
              Clear Page
            </button>
          </div>
          <div>
            <span className="pr-2">Brush Size</span>
            <input
              type="number"
              min={1}
              max={50}
              value={brushSize}
              onChange={handleBrushSizeChange}
              className="appearance-none my-2 w-14 bg-white border border-gray-300 rounded-md text-center pl-2 leading-tight focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            {COLORS.map((color) => (
              <div
                key={color}
                className={`w-6 h-6 rounded-full ${backgroundColors[color]} ${
                  color === selectedColor ? "border-black" : "border-gray-300"
                } border cursor-pointer`}
                onClick={() => handleColorSelect(color)}
                onKeyDown={() => handleColorSelect(color)}
              ></div>
            ))}
          </div>
          <button
            onClick={togglePaint}
            className={`rounded-md px-2 my-1 w-32 text-white ${
              isPaintEnabled ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {isPaintEnabled ? "Disable Paint" : "Enable Paint"}
          </button>
          <button
            className="mx-1 rounded-md px-2 my-1 text-white bg-gray-500"
            onClick={handleNext}
          >
            Next
          </button>
          <div></div>
        </div>

        <ToastContainer />
        <div
          className={
            isHeader ? `overflow-y-scroll h-screen ${getCursorClassName()}` : ""
          }
        >
          <Document
            className={isLoader ? "hidden" : ""}
            key={key}
            file={`/pdfs/${currentFile.filename}`}
            loading={<Spinner />}
            onLoadSuccess={({ numPages }) => {
              setPdfNumPages(numPages);
              setIsHeader(true);
            }}
          >
            {tempPageArray.map((page: number) => (
              <div
                key={page}
                style={{
                  touchAction:
                    isPaintEnabled && isSingleTouch ? "none" : "auto",
                }}
              >
                <Page
                  canvasRef={canvasRefs.current[page - 1] as any}
                  pageNumber={page}
                  width={800}
                  renderTextLayer={false}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseOut={endDrawing}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={endDrawing}
                  renderAnnotationLayer={false}
                />
                {"page : " + page}
              </div>
            ))}
          </Document>
          {isLoader ? <Spinner /> : null}
        </div>
        {isOpenSave && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black bg-opacity-50 fixed inset-0">
              <div
                className="relative mx-auto w-2/3 lg:w-1/3"
                style={{ height: "199px", marginTop: "243px" }}
              >
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <div className="text-lg font-medium text-center leading-6 text-gray-900">
                    Are you sure you want to save this edited PDF?
                  </div>

                  <div className="mt-4 flex w-full justify-end pt-4">
                    <button
                      type="button"
                      className="inline-flex mr-2 items-center justify-center rounded-md border border-transparent bg-gray-200 px-2 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        setIsOpenSave(false);
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-yellowGray-500 px-4 py-2 ml-4 font-normal text-base text-aavasPrimary-white"
                      onClick={saveEditedPdf}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFEditor;
