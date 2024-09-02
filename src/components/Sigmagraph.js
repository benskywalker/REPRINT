import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sigma, RandomizeNodePositions, RelativeSize, ForceAtlas2, NOverlap } from 'react-sigma';
import ClipLoader from 'react-spinners/ClipLoader';
import NodeDialog from './NodeDialog';
import { Checkbox } from 'primereact/checkbox';
import { Accordion, AccordionTab } from 'primereact/accordion';
import styles from './Sigmagraph.module.css';
import { Slider } from '@mui/material';
import Graph from 'graphology';
import { centrality } from 'graphology-metrics';
import pagerank from 'graphology-pagerank';
import modularity from 'graphology-communities-louvain';


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
  const [selectedFilters, setSelectedFilters] = useState({});
  const [timeRange, setTimeRange] = useState([1600, 1700]);
  const [minDate, setMinDate] = useState(1600);
  const [maxDate, setMaxDate] = useState(1500);
  const [metrics, setMetrics] = useState(null);

  const sigmaRef = useRef(null);

  const buildGraphologyGraph = (nodes, edges) => {
    const graph = new Graph();

    nodes.forEach(node => {
      graph.addNode(node.id, { label: node.label, data: node.data });
    });

    edges.forEach(edge => {
      graph.addEdge(edge.source, edge.target, { data: edge });
    });

    return graph;
  };

  const computeMetrics = (graph) => {
    const metrics = {};
  
    metrics.degreeCentrality = centrality.degree(graph);
    metrics.betweennessCentrality = centrality.betweenness(graph);
    metrics.closenessCentrality = centrality.closeness(graph);
    metrics.eigenvectorCentrality = centrality.eigenvector(graph);
    metrics.pageRank = pagerank(graph); // Use pagerank from graphology-pagerank
    metrics.modularity = modularity(graph);
  
    return metrics;
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/relations');
        const data = response.data;

        const nodes = [];
        const edges = [];
        const nodeIds = new Set();
        const edgeIds = new Set();

        const edgeColors = {
          document: '#5d94eb',
          organization: '#33FF57',
          religion: '#3357FF',
          relationship: '#FF33A1',
        };

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

        data.edges.forEach((edge) => {
          if (edge.from !== edge.to) {
            const edgeId = `edge-${edge.from}-${edge.to}`;

            if (!edgeIds.has(edgeId)) {
              const newEdge = {
                id: edgeId,
                source: edge.from,
                target: edge.to,
                color: edgeColors[edge.type] || '#ccc',
                size: 2,
                ...edge,
              };

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

        nodes.forEach((node) => {
          node.data.documents = edges.filter((edge) => edge.source === node.id || edge.target === node.id);
        });

        const graphologyGraph = buildGraphologyGraph(nodes, edges);
        const calculatedMetrics = computeMetrics(graphologyGraph);
        setMetrics(calculatedMetrics);
        console.log('Metrics:', calculatedMetrics);

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
    const nodeData = graph.nodes.find((node) => node.id === nodeId);

    const nodeMetrics = {
      degree: metrics.degreeCentrality[nodeId],
      betweenness: metrics.betweennessCentrality[nodeId],
      closeness: metrics.closenessCentrality[nodeId],
      eigenvector: metrics.eigenvectorCentrality[nodeId],
      pagerank: metrics.pageRank[nodeId],
    };

    setSelectedNode({ ...nodeData, metrics: nodeMetrics });
    setNodeDialogVisible(true);
    onNodeClick(nodeData);
  };

  const handleNodeHover = (event) => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    const nodeId = event.data.node.id;
    const node = graphInstance.nodes(nodeId);

    const hoveredNodeData = graph.nodes.find((node) => node.id === nodeId);
    onNodeHover(hoveredNodeData);

    setHoveredNode({ id: nodeId, color: node.color });

    node.color = '#3aa2f4';

    node.label = node.data.personStdName || node.data.organizationName || node.data.religionDesc;

    graphInstance.edges().forEach((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        graphInstance.edges(edge.id).color = '#add8e6';
        graphInstance.edges(edge.id).size = 3;
      } else {
        graphInstance.edges(edge.id).hidden = true;
      }
    });

    sigmaInstance.refresh();
  };

  const handleNodeOut = (event) => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    onNodeHover(null);

    const hoveredNode = graphInstance.nodes(event.data.node.id);

    if (hoveredNode) {
      const node = graphInstance.nodes(hoveredNode.id);
      if (node) {
        graphInstance.edges().forEach((edge) => {
          graphInstance.edges(edge.id).hidden = false;
        });
        node.color = '#fffff0';
      }
      setHoveredNode(null);
    }

    originalGraph.edges.forEach((edge) => {
      const graphEdge = graphInstance.edges(edge.id);
      if (graphEdge) {
        graphEdge.color = edge.color;
        graphEdge.size = edge.size;
      }
    });

    sigmaInstance.refresh();
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
        return new Date(dateStr, 0);
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
      setGraph(originalGraph);
      return;
    }

    const filteredEdges = originalGraph.edges.filter((edge) => {
      const edgeDate = parseDate(edge.date);
      return edgeDate >= startDate && edgeDate <= endDate;
    });

    const filteredNodes = originalGraph.nodes.filter((node) => {
      const birthDate = parseDate(node.data.birthDate);
      const deathDate = parseDate(node.data.deathDate);
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

    const nodeDegrees = {};
    filteredEdges.forEach((edge) => {
      nodeDegrees[edge.source] = (nodeDegrees[edge.source] || 0) + 1;
      nodeDegrees[edge.target] = (nodeDegrees[edge.target] || 0) + 1;
    });

    const updatedNodes = filteredNodes.map((node) => {
      const degree = nodeDegrees[node.id] || 0;
      return {
        ...node,
        size: degree + 1,
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
              onChange={(event, newValue) => setTimeRange(newValue)}
              onChangeCommitted={handleTimeRangeChange}
              valueLabelDisplay="auto"
              min={minDate}
              max={maxDate}
              step={1}
              className={styles.slider}
            />
          </div>
          <div className={styles.timePeriod}>
            <span>{timeRange[0]}</span> -
            <span>{timeRange[1]}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default SigmaGraph;
