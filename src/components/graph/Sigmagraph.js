// SigmaGraph.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sigma,
  RelativeSize,
  ForceAtlas2,
  RandomizeNodePositions,
} from "react-sigma";
import LoadingBar from "react-top-loading-bar";
import fetchAndBuildGraph from "./fetchAndBuildGraph";
import "./sigma.css";
import { AutoComplete } from "primereact/autocomplete";
import { Slider } from '@mui/material';
import { debounce } from 'lodash'; // Install lodash if not already
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function SigmaGraph({
  onNodeClick,
  onNodeHover,
  handleNodeunHover,
  showEdges,
  nodesUrl, 
  edgesUrl,
  body
}) {
  const [filters, setFilters] = useState({
    person: true,
    organization: true,
    religion: true,
    document: true,
  });
  const [edgeTypeFilters, setEdgeTypeFilters] = useState({
    Sender: true,
    Receiver: true,
    Mentioned: true,
    Author: true,
    Waypoint: true,
    document: true,
    organization: false,
    religion: false,
    relationship: false,
    Unknown: false,
  });
  const [selectedElement, setSelectedElement] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const sigmaRef = useRef(null);
  const showEdgesRef = useRef(showEdges);
  const [layoutKey, setLayoutKey] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [hasSuggestions, setHasSuggestions] = useState(false);
  const [minDate, setMinDate] = useState(1600);
  const [maxDate, setMaxDate] = useState(1800);
  const [dateValue, setDateValue] = useState([1680, 1800]); // [startDate, endDate]
  const [commitedDateValue, setCommitedDateValue] = useState([1680, 1700]);

  useEffect(() => {
    showEdgesRef.current = showEdges;
  }, [showEdges]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProgress(30); // Start loading

        // Define your endpoints
        // const nodesUrl = "http://localhost:4000/nodes";
        // const edgesUrl = "http://localhost:4000/edges";

        // Fetch and build the graph with filters and date range
        const { graph, metrics: computedMetrics } = await fetchAndBuildGraph(
          nodesUrl,
          edgesUrl,
          filters,
          edgeTypeFilters,
          body,               // 'body' parameter
          selectedTerms,    // 'selectedTerms' parameter
          commitedDateValue // 'dateRange' parameter
        );

        // Convert Graphology graph to plain object with nodes and edges arrays
        const nodes = graph.nodes().map((nodeId) => ({
          id: nodeId,
          ...graph.getNodeAttributes(nodeId),
        }));

        const edges = graph.edges().map((edgeId) => ({
          id: edgeId,
          source: graph.source(edgeId),
          target: graph.target(edgeId),
          ...graph.getEdgeAttributes(edgeId),
        }));

        // Reset node positions
        nodes.forEach((node) => {
          node.x = Math.random();
          node.y = Math.random();
        });

        setGraphData({ nodes, edges });
        setMetrics(computedMetrics);

        // Set suggestions after data is fetched
        if (!hasSuggestions) {
          const allNodeLabels = nodes
            .map((node) => node.label)
            .filter((label) => label !== undefined);

          // Extract keywords from document nodes
          const documentKeywords = nodes
            .filter((node) => node.group === 'document' && Array.isArray(node.keywords))
            .flatMap((node) => node.keywords)
            .filter((keyword) => keyword !== undefined);

          // Combine labels and keywords, removing duplicates
          const combinedSuggestions = Array.from(
            new Set([...allNodeLabels, ...documentKeywords])
          );

          setSuggestions(combinedSuggestions);
          setHasSuggestions(true);
        }

        setLayoutKey((prevKey) => prevKey + 1); // Force re-render to apply layout
        setLoadingProgress(70); // Data fetched
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        setLoadingProgress(100); // Loading complete
      }
    };

    fetchData();
  }, [filters, edgeTypeFilters, selectedTerms, commitedDateValue]);

  const handleNodeClick = useCallback(
    (event) => {
      const nodeId = event.data.node.id;
      const nodeData = graphData.nodes.find((node) => node.id === nodeId);

      onNodeClick(nodeData);
    },
    [graphData, onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (event) => {
      const edgeId = event.data.edge.id;
      const edgeData = graphData.edges.find((edge) => edge.id === edgeId);
      setSelectedElement({
        type: "edge",
        data: edgeData,
      });
    },
    [graphData]
  );

  const handleNodeHover = useCallback(
    (event) => {
      const sigmaInstance = sigmaRef.current.sigma;
      const graphInstance = sigmaInstance.graph;

      const connectedEdges = graphInstance
        .edges()
        .filter(
          (edge) =>
            edge.source === event.data.node.id ||
            edge.target === event.data.node.id
        );

      // Show all edges connected to the node
      connectedEdges.forEach((edge) => {
        graphInstance.edges(edge.id).hidden = false;
      });

      // Hide all edges not connected to the node
      graphInstance.edges().forEach((edge) => {
        if (
          edge.source !== event.data.node.id &&
          edge.target !== event.data.node.id
        ) {
          graphInstance.edges(edge.id).hidden = true;
        }
      });

      onNodeHover(event.data.node);
      sigmaInstance.refresh();
    },
    [onNodeHover]
  );

  const handleNodeOut = useCallback(
    (event) => {
      const sigmaInstance = sigmaRef.current.sigma;
      const graphInstance = sigmaInstance.graph;

      if (showEdgesRef.current) {
        // Show all edges
        graphInstance.edges().forEach((edge) => {
          graphInstance.edges(edge.id).hidden = false;
        });
      } else {
        // Hide all edges
        graphInstance.edges().forEach((edge) => {
          graphInstance.edges(edge.id).hidden = true;
        });
      }

      handleNodeunHover();
      sigmaInstance.refresh();
    },
    [handleNodeunHover]
  );

  const handleChange = (e) => {
    setSelectedTerms(e.value);
  };

  const handleSearch = (e) => {
    const query = e.query.toLowerCase();
    const filtered = suggestions.filter(
      (item) =>
        item.toLowerCase().includes(query) && !selectedTerms.includes(item)
    );
    setFilteredSuggestions(filtered);
  };

  const handleTimeRangeChange = (event, newValue) => {
    setDateValue(newValue);
  };

  const handleTimeRangeChangeCommitted = useCallback(
    debounce((event, newValue) => {
      setCommitedDateValue(newValue);
    }, 300),
    []
  );

  return (
    <div className="container">
      <LoadingBar
        color="#f11946"
        progress={loadingProgress}
        onLoaderFinished={() => setLoadingProgress(0)}
      />

 {/* Filters Container Positioned at Bottom Right */}
 <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 300,
          zIndex: 100,
          maxHeight: '80vh',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Edge Filters */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{color: 'white'}} />}
              aria-controls="edge-filters-content"
              id="edge-filters-header"
              style={{backgroundColor: '#282936', color: 'white'}}
            >
              <Typography variant="h6">Connection Filters</Typography>
            </AccordionSummary>
            <AccordionDetails
            style={{backgroundColor: '#282936', color: 'white'}}
            >
              <FormGroup
              style={{backgroundColor: '#282936', color: 'white'}}
              >
                {Object.keys(edgeTypeFilters).map((edgeType) => (
                  <FormControlLabel

                    key={edgeType}
                    control={
                      <Checkbox
                        checked={edgeTypeFilters[edgeType]}
                        onChange={(e) => {
                          setEdgeTypeFilters({
                            ...edgeTypeFilters,
                            [edgeType]: e.target.checked,
                          });
                        }}
                        name={edgeType}
                      />
                    }
                    label={edgeType}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Node Filters */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{color: 'white'}} />}
              aria-controls="node-filters-content"
              id="node-filters-header"
              style={{backgroundColor: '#282936', color: 'white'}}
            >
              <Typography variant="h6">Node Filters</Typography>
            </AccordionSummary>
            <AccordionDetails
            style={{backgroundColor: '#282936', color: 'white'}}
            >
              <FormGroup>
                {Object.keys(filters).map((nodeType) => (
                  <FormControlLabel
                  style={{backgroundColor: '#282936', color: 'white'}}
                    key={nodeType}
                    control={
                      <Checkbox
                        checked={filters[nodeType]}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            [nodeType]: e.target.checked,
                          });
                        }}
                        name={nodeType}
                      />
                    }
                    label={nodeType}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
  <AccordionSummary
    expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
    aria-controls="legend-content"
    id="legend-header"
    style={{ backgroundColor: '#282936', color: 'white' }}
  >
    <Typography variant="h6">Legend</Typography>
  </AccordionSummary>
  <AccordionDetails style={{ backgroundColor: '#282936', color: 'white' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Nodes Section */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
          aria-controls="nodes-content"
          id="nodes-header"
          style={{ backgroundColor: '#3a3a4f', color: 'white' }}
        >
          <Typography variant="subtitle1">Nodes</Typography>
        </AccordionSummary>
        <AccordionDetails style={{ backgroundColor: '#3a3a4f', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: '#FFD700',
                marginRight: '10px',
              }}
            ></span>
            <span>Default Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: '#FFFFA1',
                marginRight: '10px',
              }}
            ></span>
            <span>Highlighted Node</span>
          </div>
        </AccordionDetails>
      </Accordion>
      
      {/* Edges Section */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
          aria-controls="edges-content"
          id="edges-header"
          style={{ backgroundColor: '#3a3a4f', color: 'white' }}
        >
          <Typography variant="subtitle1">Edges</Typography>
        </AccordionSummary>
        <AccordionDetails style={{ backgroundColor: '#3a3a4f', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '2px',
                backgroundColor: '#718093',
                marginRight: '10px',
              }}
            ></span>
            <span>Default Edge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '2px',
                backgroundColor: '#7F8C8D',
                marginRight: '10px',
              }}
            ></span>
            <span>Highlighted Edge</span>
          </div>
          
          {/* Edge Types */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
              aria-controls="edge-types-content"
              id="edge-types-header"
              style={{ backgroundColor: '#4a4a5f', color: 'white' }}
            >
              <Typography variant="subtitle2">Edge Types</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ backgroundColor: '#4a4a5f', color: 'white' }}>
              {[
                { type: 'document', color: '#3498DB' },
                { type: 'organization', color: '#1ABC9C' },
                { type: 'religion', color: '#8E44AD' },
                { type: 'relationship', color: '#E74C3C' },
                { type: 'sender', color: '#F39C12' },
                { type: 'receiver', color: '#2ECC71' },
                { type: 'mentioned', color: '#9B59B6' },
                { type: 'author', color: '#E67E22' },
                { type: 'waypoint', color: '#16A085' },
                { type: 'Unknown', color: '#7F8C8D' },
              ].map((edgeType, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '2px',
                      backgroundColor: edgeType.color,
                    }}
                  ></span>
                  <span>{edgeType.type}</span>
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>
      
      {/* Communities Section */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
          aria-controls="communities-content"
          id="communities-header"
          style={{ backgroundColor: '#3a3a4f', color: 'white' }}
        >
          <Typography variant="subtitle1">Communities</Typography>
        </AccordionSummary>
        <AccordionDetails style={{ backgroundColor: '#3a3a4f', color: 'white' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              '#FFD700',
              '#8E44AD',
              '#3498DB',
              '#1ABC9C',
              '#E74C3C',
              '#F39C12',
              '#2ECC71',
              '#9B59B6',
              '#E67E22',
              '#16A085',
            ].map((color, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                  }}
                ></span>
                <span>{`Community ${index + 1}`}</span>
              </div>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>
      
    </div>
  </AccordionDetails>
</Accordion>
        </Box>
      </Box>

      <div className="sigma-container">
        <AutoComplete
          value={selectedTerms}
          suggestions={filteredSuggestions}
          completeMethod={handleSearch}
          multiple
          onChange={handleChange}
          placeholder="Search..."
        />
        {graphData.nodes.length > 0 && (
          <Sigma
            key={layoutKey} // Force re-render on layoutKey change
            graph={graphData}
            style={{ width: "100%", height: "calc(92vh - 60px)" }}
            onClickNode={handleNodeClick}
            onClickEdge={handleEdgeClick}
            onOverNode={handleNodeHover}
            onOutNode={handleNodeOut}
            settings={{
              hideEdgesOnMove: false, // Keep edges visible during movements
              drawEdges: true,        // Ensure edges are drawn
              clone: false,           // Prevent cloning the graph
            }}
            ref={sigmaRef}
          >
            <RandomizeNodePositions />
            <ForceAtlas2
              key={layoutKey} // Ensure layout restarts when layoutKey changes
              barnesHutOptimize={true}
              barnesHutTheta={0.5}
              linLogMode={false}
              outboundAttractionDistribution={false}
              adjustSizes={false}
              edgeWeightInfluence={0}
              scalingRatio={3}
              strongGravityMode={false}
              gravity={0.01}
              slowDown={5}
              startingIterations={1}
              worker={true} // Set worker to true
              timeout={8000}
            />
            <RelativeSize initialSize={15} />
          </Sigma>
        )}

        <div className="card flex justify-content-center" style={{ bottom: 20, postion: 'fixed' }}>
          <Slider 
            value={Array.isArray(dateValue) ? dateValue : [minDate, maxDate]}
            onChange={handleTimeRangeChange}
            onChangeCommitted={handleTimeRangeChangeCommitted}
            valueLabelDisplay="auto"
            min={minDate}
            max={maxDate}
            step={5}
            style={{width: "20%"}}
          />
        </div>
      </div>

      {/* Optional: Display selected element and metrics */}
      {/* 
      {selectedElement && (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected {selectedElement.type}</h3>
          <pre>{JSON.stringify(selectedElement.data, null, 2)}</pre>
        </div>
      )}

      {metrics && (
        <div style={{ marginTop: "20px" }}>
          <h3>Graph Metrics</h3>
          <pre>{JSON.stringify(metrics, null, 2)}</pre>
        </div>
      )} 
      */}
    </div>
  );
}