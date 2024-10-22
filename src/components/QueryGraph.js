import React, { useState, useEffect } from 'react'
import { Sigma } from 'react-sigma';
import SigmaGraph from './Sigmagraph';
import axios from 'axios';
import fetchGraphData from './GraphData';

const QueryGraph = ({ data, type }) => {
    const [people, setPeople] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [places, setPlaces] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [religion, setReligion] = useState([]);
    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(true);

    const getGraphData = async () => {
        const baseExpressUrl = process.env.BASEEXPRESSURL || "http://localhost:4000/";
        const graphData = await fetchGraphData(
          `${baseExpressUrl}graph`,
          2000,
          0
        );
        setGraph(graphData.originalGraph || { nodes: [], edges: [] });
        setLoading(false);
      };
       
        useEffect(() => {
            const parseData = () => {
                if(type === 'person_all_view'){
                    const people = new Set();
                    for(let i = 0; i < data.length; i++){
                        people.add(data[i].personStdName);
                    }
        
                    setPeople(Array.from(people));
                } else if(type === 'organization_all_view'){
                    const organizations = new Set();
                    for(let i = 0; i < data.length; i++){
                        organizations.add(data[i].organizationDesc);
                    }
                    setOrganizations(Array.from(organizations));
                } else if(type === 'place_all_view'){
                    const places = new Set();
                    for(let i = 0; i < data.length; i++){
                        places.add(data[i].placeDesc);
                    }
                    setPlaces(Array.from(places));
                } else if(type === 'document_all_view'){
                    const documents = new Set();
                    for(let i = 0; i < data.length; i++){
                        documents.add(data[i].documentTitle);
                    }
                    setDocuments(Array.from(documents));
                } else if(type === 'religion_all_view'){
                    const religion = new Set();
                    for(let i = 0; i < data.length; i++){
                        religion.add(data[i].religionDesc);
                    }
                    setReligion(Array.from(religion));
                }
            }

            getGraphData();
            parseData();
        }, [data, type, graph, people]);
  return (
    <div>Hello World</div>
  )
}

export default QueryGraph