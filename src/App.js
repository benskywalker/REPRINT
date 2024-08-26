// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";

const Main = () => {
  return <Home />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/query-tool" element={<QueryTool />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
