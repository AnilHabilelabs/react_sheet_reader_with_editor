import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PDFEditor from "./PDFEditor";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/editPDF/:index" element={<PDFEditor />} />
    </Routes>
  </Router>
);
