import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sigma, RandomizeNodePositions, RelativeSize, ForceAtlas2, NOverlap } from 'react-sigma';
import ClipLoader from 'react-spinners/ClipLoader';
import NodeDialog from './NodeDialog'; // Assuming you have a NodeDialog component
import { Checkbox } from 'primereact/checkbox'; // Import Checkbox from PrimeReact
import { Accordion, AccordionTab } from 'primereact/accordion'; // Import Accordion components from PrimeReact
import styles from './Sigmagraph.module.css';
import { Slider } from '@mui/material';

const SigmaGraph = ({ onNodeClick, searchQuery, onNodeHover }) => {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDialogVisible, setNodeDialogVisible] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [forceAtlasActive, setForceAtlasActive] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({}); // State for selected filters
  // State for time range slider from the 15th century to today's date
  const [timeRange, setTimeRange] = useState([1600, 1700]);
  const [minDate, setMinDate] = useState(1600);
  const [maxDate, setMaxDate] = useState(1500);

  const sigmaRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/relations');
        const data = response.data;
        const nodes = [];
        const edges = [];
        const nodeIds = new Set();
        const edgeIds = new Set(); // To track unique edges

        // Define color mapping for edge types
        const edgeColors = {
          document: '#5d94eb', // Example color for document edges   
          organization: '#33FF57', // Example color for organization edges
          religion: '#3357FF', // Example color for religion edges
          relationship: '#FF33A1', // Example color for relationship edges
        };

        // Process nodes
        data.nodes.forEach((node) => {
          const newNode = {
            id: node.id,
            label: node.personStdName || node.organizationName || node.religionDesc,
            size: 3,
            color: '#fffff0',
            data: node,
          };

          if (!nodeIds.has(newNode.id)) {
            nodes.push(newNode);
            nodeIds.add(newNode.id);
          }
        });

        // Process edges
        data.edges.forEach((edge) => {
          if (edge.from !== edge.to) { // Ensure nodes aren't connected to themselves
            const edgeId = `edge-${edge.from}-${edge.to}`;

            if (!edgeIds.has(edgeId)) { // Ensure no duplicate edges
              const newEdge = {
                id: edgeId,
                source: edge.from,
                target: edge.to,
                color: edgeColors[edge.type] || '#ccc', // Use color mapping
                size: 2,
                ...edge,
              };

              //set the min and max date
              if (newEdge.date) {
                const date = new Date(newEdge.date);
                if (date.getFullYear() < minDate) {
                  setMinDate(date.getFullYear());
                }
                if (date.getFullYear() > maxDate) {
                  setMaxDate(date.getFullYear());
                }
              }


              edges.push(newEdge);
              edgeIds.add(edgeId);
            }
          }
        });

        // Populate the nodes' documents array
        nodes.forEach((node) => {
          node.data.documents = edges.filter((edge) => edge.source === node.id || edge.target === node.id);
        });

        setGraph({ nodes, edges });
        setOriginalGraph({ nodes, edges });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNodeClick = (event) => {
    const nodeId = event.data.node.id;
    console.log('Node clicked:', nodeId);
    const nodeData = graph.nodes.find((node) => node.id === nodeId);
    setSelectedNode(nodeData);
    setNodeDialogVisible(true);
    onNodeClick(nodeData); // Pass the node data to the parent component
  };

  const handleNodeHover = (event) => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    const nodeId = event.data.node.id;
    const node = graphInstance.nodes(nodeId);

    //get all info about the hovered node and store it in the state
    const hoveredNodeData = graph.nodes.find((node) => node.id === nodeId);
    onNodeHover(hoveredNodeData); // Pass the hovered node data to the parent component

    // Store the original color of the hovered node
    setHoveredNode({ id: nodeId, color: node.color });

    // Change the color of the hovered node to pruple
    node.color = '#3aa2f4';
    
    //show the nodes label
    node.label = node.data.personStdName || node.data.organizationName || node.data.religionDesc;

    // Access and modify connected edges
    graphInstance.edges().forEach((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        // If the edge is connected to the hovered node
        // color the edge light blue and increase its size
        graphInstance.edges(edge.id).color = '#add8e6';
        graphInstance.edges(edge.id).size = 3;
      } else {
        //make edge and node invisible
        graphInstance.edges(edge.id).hidden = true; 
        
      }
    });

    sigmaInstance.refresh(); // Refresh the graph to apply changes
  };

  const handleNodeOut = (event) => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    //set the hovered node data to null
    onNodeHover(null); // Clear the hovered node data in the parent component

    //get the hovered node
    const hoveredNode = graphInstance.nodes(event.data.node.id);
    // Restore the color of the previously hovered node to '#fffff0'

    // Restore the color of the previously hovered node to '#fffff0'
    if (hoveredNode) {
      const node = graphInstance.nodes(hoveredNode.id);
      if (node) {
        //make the edge and node visible
        graphInstance.edges().forEach((edge) => {
          graphInstance.edges(edge.id).hidden = false;
          
        });
        node.color = '#fffff0';
      }
      setHoveredNode(null);
    }

    // Restore original colors of edges
    originalGraph.edges.forEach((edge) => {
      const graphEdge = graphInstance.edges(edge.id);
      if (graphEdge) {
        graphEdge.color = edge.color;
        graphEdge.size = edge.size;
      }
    });

    sigmaInstance.refresh(); // Refresh the graph to apply changes
  };

  const filterOptions = [
    { label: 'Document', value: 'document', type: 'Relations' },
    { label: 'Religion', value: 'religion', type: 'Relations' },
    { label: 'Organization', value: 'organization', type: 'Relations' },
    { label: 'Person', value: 'person', type: 'Relations' },
  ];

  const groupedOptions = filterOptions.reduce((acc, option) => {
    if (!acc[option.type]) {
      acc[option.type] = [];
    }
    acc[option.type].push(option);
    return acc;
  }, {});

  const handleFilterChange = (e) => {
    const selectedValue = e.value;

    let updatedFilters = { ...selectedFilters };

    if (updatedFilters[selectedValue]) {
      delete updatedFilters[selectedValue];
    } else {
      updatedFilters[selectedValue] = true;
    }

    setSelectedFilters(updatedFilters);
  };

  useEffect(() => {
    if (Object.keys(selectedFilters).length === 0 && !searchQuery) {
      setGraph(originalGraph);
    } else {
      if (originalGraph.edges && originalGraph.nodes) {
        const filteredEdges = originalGraph.edges.filter((edge) => {
          return selectedFilters[edge.type];
        });

        const filteredNodes = originalGraph.nodes.filter((node) => {
          const matchesSearchQuery = searchQuery ? node.data.fullName.toLowerCase().includes(searchQuery.toLowerCase()) : true;
          return filteredEdges.some((edge) => edge.source === node.id || edge.target === node.id) || matchesSearchQuery;
        });
        

        setGraph({ nodes: filteredNodes, edges: filteredEdges });
      } else {
        console.error('Original graph nodes or edges are undefined');
      }
    }
  }, [selectedFilters, originalGraph, searchQuery]);

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  
    const parseDate = (dateStr) => {
      if (typeof dateStr === 'number') {
        // If the date is a number, treat it as a year
        return new Date(dateStr, 0); // January 1st of the given year
      }
  
      if (typeof dateStr !== 'string') {
        return null;
      }
  
      const parsedDate = Date.parse(dateStr);
      if (!isNaN(parsedDate)) {
        return new Date(parsedDate);
      }
  
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      } else if (parts.length === 2) {
        return new Date(parts[0], parts[1] - 1);
      } else if (parts.length === 1) {
        return new Date(parts[0]);
      }
  
      return null;
    };
  
    const startDate = parseDate(newValue[0]);
    const endDate = parseDate(newValue[1]);
  
    if (startDate === null && endDate === null) {
      // Reset to the original graph data
      setGraph(originalGraph);
      return;
    }
  
    const filteredEdges = originalGraph.edges.filter((edge) => {
      const edgeDate = parseDate(edge.date);
      return edgeDate >= startDate && edgeDate <= endDate;
    });
  
    // Filter the nodes by node.data.birthDate and node.data.deathDate
    const filteredNodes = originalGraph.nodes.filter((node) => {
      const birthDate = parseDate(node.data.birthDate);
      const deathDate = parseDate(node.data.deathDate);
      // If birthDate or deathDate is null, don't filter them out
      if (
        birthDate === null ||
        deathDate === null ||
        birthDate === '' ||
        deathDate === '' ||
        isNaN(birthDate) ||
        isNaN(deathDate) ||
        birthDate === undefined ||
        deathDate === undefined
      ) {
        return true;
      }
  
      return birthDate >= startDate && deathDate <= endDate;
    });
  
    // Calculate the degree of each node
    const nodeDegrees = {};
    filteredEdges.forEach((edge) => {
      nodeDegrees[edge.source] = (nodeDegrees[edge.source] || 0) + 1;
      nodeDegrees[edge.target] = (nodeDegrees[edge.target] || 0) + 1;
    });
  
    // Update node sizes based on their degrees
    const updatedNodes = filteredNodes.map((node) => {
      const degree = nodeDegrees[node.id] || 0;
      return {
        ...node,
        size: degree + 1, // Adjust the size formula as needed
      };
    });
  
    setGraph({ nodes: updatedNodes, edges: filteredEdges });
  };

  
  
  return (
    <div className={styles.content}>
      {loading ? (
        <div className={styles.loaderContainer}>
          <ClipLoader size={50} color={'#123abc'} loading={loading} />
        </div>
      ) : (
        <>
          <Sigma
            key={JSON.stringify(graph)}
            graph={graph}
            style={{ width: '100%', height: '100vh' }}
            onClickNode={handleNodeClick}
            onOverNode={handleNodeHover}
            onOutNode={handleNodeOut}
            ref={sigmaRef}
          >
            <RandomizeNodePositions />
            <NOverlap gridSize={10} maxIterations={100} maxNodeOverlap={0.5} />
            <RandomizeNodePositions />
            <RelativeSize initialSize={15} />
            {forceAtlasActive ? (
              <ForceAtlas2
                iterationsPerRender={1}
                timeout={3000}
                barnesHutOptimize={false}
                gravity={1}
                scalingRatio={2}
              />
            ) : (
              <></>
            )}
          </Sigma>
          <div className={styles.time}>
            <Slider
              value={timeRange}
              onChange={(event, newValue) => setTimeRange(newValue)} // Update the state as the slider moves
              onChangeCommitted={handleTimeRangeChange} // Apply the filtering logic only when the user releases the handle
              valueLabelDisplay="auto"
              min={minDate}
              max={maxDate}
              step={1}
              className={styles.slider}
            />
          </div>
          {/* display the time period */}
          <div className={styles.timePeriod}>
            <span>{timeRange[0]}</span> -
            <span>{timeRange[1]}</span>
          </div>
          <br />
          <br />
          <br />
          <br />
        </>
      )}
    </div>
  );
};

export default SigmaGraph;