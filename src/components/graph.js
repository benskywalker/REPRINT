import React, { useEffect } from 'react'

import Graph from "graphology";

import { SigmaContainer, useLoadGraph, ControlsContainer, ZoomControl, FullScreenControl } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";

import axios from 'axios';

import GraphFilter from './graphFilter';
import GraphEvents from './graphEvents';
import LayoutController from './layoutController.js';

const sigmaStyle = { height: "95vh", width: "100%", "background-color": "black" };

export const LoadGraph = () => {
    const loadGraph = useLoadGraph();


    useEffect(() => {

        const graph = new Graph()

        //get data
        const fetchData = async() => {
            try {
                const response = await axios.get('http://localhost:4000/relations');
                const data = response.data;

                // Define color mapping for edge types
                const edgeColors = {
                    document: '#5d94eb', // Example color for document edges   
                    organization: '#33FF57', // Example color for organization edges
                    religion: '#3357FF', // Example color for religion edges
                    relationship: '#FF33A1', // Example color for relationship edges
                };

                // Add nodes
                data.nodes.forEach((node) => {
                    console.log(node);
                    const nodeLabel = node.fullName || node.organizationName || node.religionDesc;
                    graph.mergeNode(node.id, { label: nodeLabel, x: 0, y: 0, color: '#fffff0', size: 5 });
                });

                // Add edges
                data.edges.forEach((edge) => {
                    const edgeId = `edge-${edge.from}-${edge.to}`;
                    //if edge is not a self loop
                    if (edge.from == edge.to) return;
                    graph.mergeEdgeWithKey(edgeId, edge.from, edge.to, { relation: edge.type, color: edgeColors[edge.type] });
                });

                //set sizes
            graph.mapNodes((node) => {
            var degree = graph.degree(node);
            if(degree > 10) degree = 10;
            graph.setNodeAttribute(node, 'size', degree);
        })

        loadGraph(graph)
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
        //fetch graph
        fetchData();
    }, [loadGraph]);
}

export const DisplayGraph = ({ onNodeClick }) => {
    const handleNodeClick = (node) => {
        onNodeClick(node);
    }

    return (
        <SigmaContainer style = {sigmaStyle} display = 'flex' >
            <LoadGraph/>
            <ControlsContainer position={"bottom-left"}>
                <ZoomControl />
                <FullScreenControl />
            </ControlsContainer>
            <ControlsContainer position={"bottom-right"}>
                <GraphFilter/>
            </ControlsContainer>
            <GraphEvents onNodeClick = { handleNodeClick }/>
            <ControlsContainer position={"top-left"}>
                <LayoutController/>
            </ControlsContainer>
        </SigmaContainer>
    )
}