import SigmaGraph from '../components/Sigmagraph';
import { useState, useEffect } from 'react';
import { Splitter, SplitterPanel } from 'primereact/splitter'; // Import Splitter components from PrimeReact
import { Accordion, AccordionTab } from 'primereact/accordion'; // Import Accordion components from PrimeReact
import { Button } from 'primereact/button'; // Import Button component from PrimeReact
import styles from './Home.module.css';
import NodeDetails from '../components/NodeDetails';
import { Dialog } from 'primereact/dialog'; // Import Dialog component from PrimeReact
import { v4 as uuidv4 } from 'uuid'; // Import uuid function
import { DataTable } from 'primereact/datatable'; // Import DataTable and Column components from PrimeReact
import { Column } from 'primereact/column'; // Import Column component from PrimeReact
import ClipLoader from 'react-spinners/ClipLoader'; // Import ClipLoader from react-spinners
import fetchGraphData from '../components/GraphData';
import { Slider } from '@mui/material';
//css for toggle button
// import 'primereact/resources/themes/saga-blue/theme.css';

import { ToggleButton } from 'primereact/togglebutton';
        

const Home = ({ searchQuery }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [timeRange, setTimeRange] = useState([1600, 1700]); // Initialize with min and max dates
  const [dialogs, setDialogs] = useState([]);
  const [hoveredNodeData, setHoveredNodeData] = useState(null);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [minDate, setMinDate] = useState(1650);
  const [maxDate, setMaxDate] = useState(1800);
  const [metrics, setMetrics] = useState(null);
  const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] });
  const [showEdges, setShowEdges] = useState(true);

  const getGraphData = async () => {
    const graphData = await fetchGraphData('http://localhost:4000/graph', 2000, 0);
    console.log(graphData);
    setGraph(graphData.graph || { nodes: [], edges: [] });
    setMetrics(graphData.metrics);
    setMinDate(graphData.minDate);
    setMaxDate(graphData.maxDate);
    setTimeRange([graphData.minDate, graphData.maxDate]); // Set initial time range
    setOriginalGraph(graphData.graph || { nodes: [], edges: [] });
    setLoading(false);
  };

  useEffect(() => {
    getGraphData();
  }, []);

  const handleOpenClick = (rowData) => {
    const id = uuidv4();
    setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData: rowData }]);
  };

  const handleCloseDialog = (id) => {
    console.log('Closing dialog:', id);
    setDialogs((prevDialogs) => prevDialogs.filter((dialog) => dialog.id !== id));
    console.log(dialogs);
  };

  const handleGraphUpdate = (graph) => {
    setGraph(graph || { nodes: [], edges: [] });
  };



  const handleNodeHover = (nodeData) => {
    setHoveredNodeData(nodeData);
  };

  const handleNodeOut = () => {
    setHoveredNodeData(null);
  };

  const handleNodeClick = (node) => {
    setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes, node]);
  };

  const handleCloseNode = (rowIndex) => {
    console.log(rowIndex.rowIndex);
    setSelectedNodes((prevSelectedNodes) => {
      const updatedNodes = prevSelectedNodes.filter((_, index) => index !== rowIndex.rowIndex);
      return [...updatedNodes]; // Ensure a new array is returned to trigger re-render
    });
  };

  const onRowReorder = (event) => {
    setSelectedNodes(event.value); // Update the state with new row order
  };

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);

    // Loop through the edges and nodes and update the graph
    const newEdges = originalGraph.edges.filter((edge) => {
      
      // Dates can be YYYY, YYYY-MM, YYYY-MM-DD
      const parseDate = (dateStr) => {
        if (typeof dateStr === 'number') {
          return new Date(dateStr, 0); // Treat as YYYY
        }

        if (typeof dateStr !== 'string') {
          return null;
        }

        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
        } else if (parts.length === 2) {
          return new Date(parts[0], parts[1] - 1); // YYYY-MM
        } else if (parts.length === 1) {
          return new Date(parts[0], 0); // YYYY
        }

        return null;
      };

      if(edge.type === 'document') {
      const edgeDate = parseDate(edge.date);
      return edgeDate >= new Date(newValue[0], 0) && edgeDate <= new Date(newValue[1], 11, 31);
      }else if(edge.type === 'organization') {
        const formationDate = parseDate(edge.formationDate);
        const dissolutionDate = parseDate(edge.dissolutionDate);
        return formationDate >= new Date(newValue[0], 0) && dissolutionDate <= new Date(newValue[1], 11, 31);
      }else if(edge.type === 'relationship') {
        return true;
      }else if(edge.type === 'religion') {
        return true;
      }

    });

    const newNodes = originalGraph.nodes.filter((node) => {
      return newEdges.some((edge) => edge.source === node.id || edge.target === node.id);
    });

    setGraph({ nodes: newNodes, edges: newEdges });
  };

  const handleTimeRangeCommit = async (event, newValue) => {
    // // Update the graph by pruning nodes and edges that are outside the time range
    // const graphData = await fetchGraphData('http://localhost:4000/relations', newValue[0], newValue[1]);
    // setGraph(graphData.graph);
    // setMetrics(graphData.metrics);
  };

  const renderHeader = (node, index) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{node.data.fullName}</span>
      <Button
        icon="pi pi-external-link"
        className="p-button-rounded p-button-text"
        onClick={(event) => {
          event.stopPropagation(); // Prevents the accordion from opening
          event.preventDefault(); // Prevent the default behavior (URL change)
          handleOpenClick(node);
        }}
      />
      <Button
        icon="pi pi-times"
        className="p-button-rounded p-button-text"
        onClick={(event) => {
          event.stopPropagation(); // Prevents the accordion from opening
          event.preventDefault(); // Prevent the default behavior (URL change)
          handleCloseNode(index);
        }}
      />
    </div>
  );

  const renderAccordion = (rowData, index) => (
    <Accordion key={rowData.data.id} style={{ width: '100%', flexGrow: 1 }}>
      <AccordionTab header={renderHeader(rowData, index)}>
        <div style={{ overflow: 'auto', height: '100%', maxHeight:'45vh' }}>
          <NodeDetails key={rowData.data.id} nodeData={rowData} handleNodeClick={handleNodeClick} />
        </div>
      </AccordionTab>
    </Accordion>
  );

  return (
    <>
      <div className={styles.content}>
        <Splitter style={{ overflowY: 'auto' }}>
          <SplitterPanel size={30} minSize={0} style={{ display: 'flex', flexDirection: 'column', height: '90vh', overflowY: 'auto' }}>
            {/* DataTable for reordering */}
            <ToggleButton
  onIcon="pi pi-check" 
  offIcon="pi pi-times"
  // className="w-9rem"
  checked={showEdges}
  onChange={(e) => setShowEdges(e.value)}
  onLabel="Show Edges"
  offLabel="Hide Edges"
  severity={showEdges ? "success" : "danger"} // Change severity based on the toggle state
/>
            <DataTable value={selectedNodes} reorderableRows onRowReorder={onRowReorder} key={selectedNodes.length}>
              <Column
                body={(rowData, index) => renderAccordion(rowData, index)}
                header={hoveredNodeData ? hoveredNodeData.data.fullName : 'Sidecars'}
              />
            </DataTable>
          </SplitterPanel>
          <SplitterPanel className={styles.sigmaPanel} size={70} minSize={0}>
            {loading ? (
              <div className={styles.loaderContainer}>
                <ClipLoader color="#36d7b7" loading={loading} size={150} />
              </div>
            ) : (
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
                <div className={styles.sliderContainer}>
                  <Slider
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                    onChangeCommitted={handleTimeRangeCommit}
                    valueLabelDisplay="auto"
                    min={minDate}
                    max={maxDate}
                    step={1}
                    className={styles.slider}
                    marks={[
                      { value: minDate, label: minDate },
                      { value: maxDate, label: maxDate },
                    ]}
                  />
                </div>
              </div>
            )}
          </SplitterPanel>
        </Splitter>
      </div>
      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data.fullName}
          maximizable
          modal={false}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          style={{
            width: '35vw',
            height: '70vh',
            minWidth: '15vw',
            minHeight: '15vw',
          }} /* Set a consistent height */
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
          <NodeDetails nodeData={dialog.nodeData} handleNodeClick={handleNodeClick} />
        </Dialog>
      ))}
    </>
  );
};

export default Home;