import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { GraphProvider } from "./context/GraphContext";
import Gallery from "./pages/Gallery/Gallery";
import Header from "./components/header/Header";
import Home from "./pages/Home/Home";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";
import QueryTool from "./pages/QueryTool/QueryTool";

const Main = ({ searchQuery }) => {
  return <Home className="home" searchQuery={searchQuery} />;
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <GraphProvider>
      <Router>
        <Header onSearchChange={handleSearchChange} />
        <Routes>
          <Route path="/" element={<Navigate to="/REPRINT" replace />} />
          <Route path="/REPRINT" element={<Main searchQuery={searchQuery} />} />
          <Route path="/REPRINT/gallery" element={<Gallery searchQuery={searchQuery} />} />
          <Route path="/REPRINT/query-tool" element={<QueryTool />} />
          <Route path="/REPRINT/*" element={<Home />} />
        </Routes>
      </Router>
    </GraphProvider>
  );
};

export default App;
