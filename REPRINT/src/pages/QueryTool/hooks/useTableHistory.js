import { useState } from 'react';

export const useTableHistory = () => {
  const [tableHistory, setTableHistory] = useState([]);

  const pushToHistory = (currentState) => {
    setTableHistory((prev) => {
      const newHistory = [...prev, currentState];
      if (newHistory.length > 10) {
        newHistory.shift();
      }
      return newHistory;
    });
  };

  const goBack = () => {
    if (tableHistory.length === 0) return null;
    
    const lastState = tableHistory[tableHistory.length - 1];
    setTableHistory((prev) => prev.slice(0, -1));
    return lastState;
  };

  return {
    tableHistory,
    pushToHistory,
    goBack
  };
};