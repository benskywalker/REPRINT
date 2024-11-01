import React, { useState, useEffect } from 'react'
import SigmaGraph from '../graph/Sigmagraph';
import styles from "../../pages/Home/Home.module.css";
import fetchGraphData from '../graph/GraphData';
import { ProgressSpinner } from 'primereact/progressspinner';

const QueryGraph = ({ data, type }) => {
    const [people, setPeople] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [places, setPlaces] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [religion, setReligion] = useState([]);
    const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] });
    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(true);
    const [hoveredNodeData, setHoveredNodeData] = useState(null);

  const handleNodeHover = nodeData => {
    setHoveredNodeData(nodeData);
  };

  const handleNodeOut = () => {
    setHoveredNodeData(null);
  };

  const handleNodeClick = (nodeData) => {
    console.log(nodeData);
    };

    const handleGraphUpdate = (graph) => {
        setOriginalGraph(graph || { nodes: [], edges: [] });
        };

        const searchQuery = (query) => {
            console.log(query);
            };

        const showEdges = true;

        const getGraphData = async () => {
            const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
            const graphData = await fetchGraphData(
              `${baseExpressUrl}graph`,
              2000,
              0
            );
            setOriginalGraph(graphData.originalGraph || { nodes: [], edges: [] });
          };
      useEffect(() => {

        getGraphData();
    }, []);

        useEffect(() => {
            const parseData = () => {
                if(type === 'person'){
                    const people = new Set();
                    for(let i = 0; i < data.length; i++){
                        people.add(data[i].firstName + ' ' + data[i].lastName);
                    }
        
                    setPeople(Array.from(people));
                } else if(type === 'organization'){
                    const organizations = new Set();
                    for(let i = 0; i < data.length; i++){
                        organizations.add(data[i].organizationDesc);
                    }
                    setOrganizations(Array.from(organizations));
                } else if(type === 'place'){
                    const places = new Set();
                    for(let i = 0; i < data.length; i++){
                        places.add(data[i].placeDesc);
                    }
                    setPlaces(Array.from(places));
                } else if(type === 'document'){
                    const documents = new Set();
                    for(let i = 0; i < data.length; i++){
                        documents.add(data[i].documentID);
                    }
                    setDocuments(Array.from(documents));
                } else if(type === 'religion'){
                    const religion = new Set();
                    for(let i = 0; i < data.length; i++){
                        religion.add(data[i].religionDesc);
                    }
                    setReligion(Array.from(religion));
                }
            }
            if(data){
                parseData();
            }
        }, [data, type]);

        useEffect(() => {
        const createGraph = () => {
            const nodes = [];
            const edges = [];
            if(type === 'person'){
            originalGraph.nodes.forEach(node => {
             if(people.includes(node.label)){
                    if(!(nodes.find(n => n.id === node.id))){
                        node.color = "#FFFFFF";
                        nodes.push(node);
                    } 
                }
            });
            originalGraph.edges.forEach(edge => {
                if(!(edges.find(e => e.id === edge.id))){
                    const source = originalGraph.nodes.find(n => n.id === edge.source);
                    const target = originalGraph.nodes.find(n => n.id === edge.target);
                    if(people.includes(source.label) || people.includes(target.label)){
                        edges.push(edge);
                        if(!(nodes.find(n => n.id === source.id))){
                            nodes.push(source);
                        }
                        if(!(nodes.find(n => n.id === target.id))){
                            nodes.push(target);
                        }
                    }
                }
            });
            } else if(type === 'organization'){
            originalGraph.nodes.forEach(node => {
                if(organizations.includes(node.label)){
                    if(!(nodes.find(n => n.id === node.id))){
                        node.color = "#FFFFFF";
                        nodes.push(node);
                    }
                }
            });
            originalGraph.edges.forEach(edge => {
                if(!(edges.find(e => e.id === edge.id))){
                    const source = originalGraph.nodes.find(n => n.id === edge.source);
                    const target = originalGraph.nodes.find(n => n.id === edge.target);
                    if(organizations.includes(source.label) || organizations.includes(target.label)){
                        edges.push(edge);
                        if(!(nodes.find(n => n.id === source.id))){
                            nodes.push(source);
                        }
                        if(!(nodes.find(n => n.id === target.id))){
                            nodes.push(target);
                        }
                    }
                }
            });
            } else if(type === 'place'){
            originalGraph.nodes.forEach(node => {
                if(places.includes(node.label)){
                    if(!(nodes.find(n => n.id === node.id))){
                        node.color = "#FFFFFF";
                        nodes.push(node);
                    }
                }
            });
            originalGraph.edges.forEach(edge => {
                if(!(edges.find(e => e.id === edge.id))){
                    const source = originalGraph.nodes.find(n => n.id === edge.source);
                    const target = originalGraph.nodes.find(n => n.id === edge.target);
                    if(places.includes(source.label) || places.includes(target.label)){
                        edges.push(edge);
                        if(!(nodes.find(n => n.id === source.id))){
                            nodes.push(source);
                        }
                        if(!(nodes.find(n => n.id === target.id))){
                            nodes.push(target);
                        }
                    }
                }
            });
            } else if(type === 'document'){
            originalGraph.edges.forEach(edge => {
                if(edge.document && documents.find(doc => doc === edge.document.documentID)){
                if(!(edges.find(e => e.id === edge.id))){
                    edge.color = "#FFFFFF";
                    edges.push(edge);
                    const source = originalGraph.nodes.find(n => n.id === edge.source);
                    const target = originalGraph.nodes.find(n => n.id === edge.target);
                    if(!(nodes.find(n => n.id === source.id))){
                        nodes.push(source);
                    }
                    if(!(nodes.find(n => n.id === target.id))){
                        nodes.push(target);
                    }
                }
                }
            });
            } else if(type === 'religion'){
            originalGraph.nodes.forEach(node => {
                if(religion.includes(node.label)){
                    if(!(nodes.find(n => n.id === node.id))){
                        nodes.color = "#FFFFFF";
                        nodes.push(node);
                    }
                }
            });
            originalGraph.edges.forEach(edge => {
                if(!(edges.find(e => e.id === edge.id))){
                    const source = originalGraph.nodes.find(n => n.id === edge.source);
                    const target = originalGraph.nodes.find(n => n.id === edge.target);
                    if(religion.includes(source.label) || religion.includes(target.label)){
                        edges.push(edge);
                        if(!(nodes.find(n => n.id === source.id))){
                            nodes.push(source);
                        }
                        if(!(nodes.find(n => n.id === target.id))){
                            nodes.push(target);
                        }
                    }
                }
            });
        }
            setLoading(false);
            setGraph({ nodes, edges });
        }
        if(originalGraph.nodes.length > 0){
            createGraph();
        }
    }, [originalGraph, people, organizations, places, documents, religion, type]);

  if(loading){
    return (
        <div className={styles.loading}>
            <ProgressSpinner />
        </div>
    );
  }

  if(graph.nodes.length === 0){
    return (
        <div className={styles.noData}>
            <h2>No data available</h2>
        </div>
    );
}

  return (
    <div className={styles.graphContainer}>
      <SigmaGraph
          graph={graph}
          onNodeHover={handleNodeHover}
          className={styles.sigma}
          onNodeClick={handleNodeClick}
          searchQuery={searchQuery}
          handleNodeunHover={handleNodeOut}
          handleGraphUpdate={handleGraphUpdate}
          showEdges={showEdges}
        />
    </div>
  );
}

export default QueryGraph;