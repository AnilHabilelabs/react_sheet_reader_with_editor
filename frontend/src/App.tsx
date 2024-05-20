import { useState, useEffect } from "react";
import "./App.css";
import { read, utils } from "xlsx";
import { Link } from "react-router-dom";

function App() {
  const [data, setData] = useState<any[]>(() => {
    // Initialize data state from local storage on first mount
    const storedData = localStorage.getItem("data");
    return storedData ? JSON.parse(storedData) : [];
  });
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileUpload = (e: any) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      if (e?.target !== null) {
        const data = e.target.result;
        const workbook = read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = utils.sheet_to_json(sheet, { raw: false });
        setData(parsedData);
        setFileUploaded(true);
      }
    };
  };

  useEffect(() => {
    if (fileUploaded) {
      localStorage.setItem("data", JSON.stringify(data));
    }
  }, [data, fileUploaded]);
  return (
    <>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => handleFileUpload(e)}
      />

      {data.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value: any, index) => (
                  <td key={index}>{value}</td>
                ))}
                <td>
                  <Link to={`/editPDF/${row.filename}`}>
                    <button
                      style={{ padding: "5px" }}
                      onClick={() => console.log(row)}
                    >
                      Edit
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default App;
