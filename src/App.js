// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
// import "primereact/resources/themes/saga-blue/theme.css"; 
import "primereact/resources/themes/soho-dark/theme.css"; 
import "./index.css";


const Main = () => {
  return (
   <Home />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
};

export default App;