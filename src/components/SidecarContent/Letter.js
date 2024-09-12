import React, { useState } from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import "./Letter.css"; // Make sure to import the CSS file
import MyDocument from "./pdf";
import ReactDOM from "react-dom";
import { PDFViewer } from "@react-pdf/renderer";

const Letter = ({ id }) => {
  const [isClosed, setIsClosed] = useState(false);

  const handleResizeEnd = (e) => {
    if (e.sizes[0] === 0 || e.sizes[1] === 0) {
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
  };

  return (
    <div>
      <Splitter onResizeEnd={handleResizeEnd}>
        <SplitterPanel>{/* Your other components */}</SplitterPanel>
        <SplitterPanel>{/* Your other components */}</SplitterPanel>
      </Splitter>
      <PDFViewer>
        <MyDocument />
      </PDFViewer>
    </div>
  );
};

export default Letter;
