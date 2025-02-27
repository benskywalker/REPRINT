import React, { createContext, useState, useContext } from "react";

const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] });

  return (
    <GraphContext.Provider value={{ graph, setGraph, originalGraph, setOriginalGraph }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => useContext(GraphContext);
export const setGraph = () => useContext(GraphContext);
