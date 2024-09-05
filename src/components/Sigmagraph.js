import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const SigmaGraph = React.memo(({ onNodeClick, searchQuery, onNodeHover, graph, handleGraphUpdate }) => {
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

  const handleNodeClick = useCallback((event) => {
    const nodeId = event.data.node.id;
    const nodeData = graph.nodes.find((node) => node.id === nodeId);
    onNodeClick(nodeData);
  }, [graph, onNodeClick]);

  const handleNodeHover = useCallback((event) => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    // Get the edges of the current node
    const edges = graphInstance.edges().filter((edge) => edge.source === event.data.node.id || edge.target === event.data.node.id);
    // Show the edges
    edges.forEach((edge) => {
      graphInstance.edges(edge.id).hidden = false;
    });

    // Refresh the graph
    sigmaInstance.refresh();
  }, []);

  const handleNodeOut = useCallback((event) => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    // Hide the edges
    graphInstance.edges().forEach((edge) => {
      graphInstance.edges(edge.id).hidden = true;
    });

    // Refresh the graph
    sigmaInstance.refresh();
  }, []);

  const handleTimeRangeChange = useCallback((event, newValue) => {
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
      // handleGraphUpdate(originalGraph);
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

    // handleGraphUpdate({ nodes: updatedNodes, edges: filteredEdges });
  }, [originalGraph]);

  return (
    <div className={styles.content}>
      <>
        <Sigma
          key="sigma-graph"
          graph={graph}
          style={{ width: '100%', height: '100vh' }}
          onClickNode={handleNodeClick}
          onOverNode={handleNodeHover}
          onOutNode={handleNodeOut}
          ref={sigmaRef}
        >
          <NOverlap gridSize={1} maxIterations={1} maxNodeOverlap={0.5} />
          <RandomizeNodePositions />
          <RelativeSize initialSize={1} />
            <ForceAtlas2
              barnesHutOptimize={true}  // Use Barnes-Hut optimization
              barnesHutTheta={0.5}  // Barnes-Hut theta parameter
              linLogMode={false}  // Use LinLog mode
              outboundAttractionDistribution={false}  // Use outbound attraction distribution
              adjustSizes={false}  // Adjust node sizes
              edgeWeightInfluence={0}  // Edge weight influence
              scalingRatio={2}  // Scaling ratio
              strongGravityMode={false}  // Strong gravity mode
              gravity={.01}  // Gravity
              slowDown={5}  // Slow down
              startingIterations={1}  // Starting iterations
              worker={true}  // Use worker
            />
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
    </div>
  );
});

export default SigmaGraph;