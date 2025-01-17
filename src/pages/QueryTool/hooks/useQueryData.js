import { useState } from 'react';
import axios from 'axios';
import fetchGraphData from "../../../components/graph/GraphData";

export const useQueryData = (toast) => {
  const [queryData, setQueryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);

  const fetchData = async (body, baseExpressUrl) => {
    try {
      setLoading(true);
      const [response, graphResults] = await Promise.all([
        axios.post(`${baseExpressUrl}knex-query`, body),
        fetchGraphData(`${baseExpressUrl}knex-query`, 2000, 0, body)
      ]);

      return { response, graphResults };
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while fetching data.",
        life: 3000,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    queryData,
    setQueryData,
    loading,
    setLoading,
    graphData, 
    setGraphData,
    fetchData
  };
};