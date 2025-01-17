import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFields = (toast) => {
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [selectedView, setSelectedView] = useState(null);
  const [currentTable, setCurrentTable] = useState("person");

  const updateFilteredFields = () => {
    let filtered = fields.filter((view) => view.view === selectedView);
    setFilteredFields(filtered);
  };

  const updateFields = (e) => {
    setSelectedView(e.value);
    setCurrentTable(e.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
        const response = await axios.get(`${baseExpressUrl}query-tool-fields`);
        setFields(response.data);
      } catch (error) {
        console.log(error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch fields.",
          life: 3000,
        });
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    updateFilteredFields();
  }, [selectedView, fields]);

  return {
    fields,
    filteredFields,
    selectedView,
    currentTable,
    updateFields,
    setSelectedView,
    setCurrentTable
  };
};