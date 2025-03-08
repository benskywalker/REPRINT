import React, { createContext, useState, useContext, useEffect } from "react";

const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [graph, setGraph] = useState(() => {
    const savedGraph = localStorage.getItem("graph");
    return savedGraph ? JSON.parse(savedGraph) : { nodes: [], edges: [] };
  });
  const [originalGraph, setOriginalGraph] = useState(() => {
    const savedOriginal = localStorage.getItem("originalGraph");
    return savedOriginal ? JSON.parse(savedOriginal) : { nodes: [], edges: [] };
  });
  
  useEffect(() => {
    localStorage.setItem("graph", JSON.stringify(graph));
  }, [graph]);

  useEffect(() => {
    localStorage.setItem("originalGraph", JSON.stringify(originalGraph));
  }, [originalGraph]);

  return (
    <GraphContext.Provider value={{ graph, setGraph, originalGraph, setOriginalGraph }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => useContext(GraphContext);