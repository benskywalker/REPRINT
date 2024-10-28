import SigmaGraph from "../components/Sigmagraph";
import { useState, useEffect } from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import styles from "./Home.module.css";
import NodeDetails from "../components/NodeDetails";
import FilterTool from "../components/FilterTool";
import { Dialog } from "primereact/dialog";
import { v4 as uuidv4 } from "uuid";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ClipLoader from "react-spinners/ClipLoader";
import fetchGraphData from "../components/GraphData";
import { Slider } from "@mui/material";
import { ToggleButton } from "primereact/togglebutton";
import { MultiSelect } from "primereact/multiselect";
import EdgeTypeFilter from "../components/EdgeTypeFilter"; // Import the new EdgeTypeFilter component

const Home = ({ searchQuery }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [timeRange, setTimeRange] = useState([1600, 1700]);
  const [dialogs, setDialogs] = useState([]);
  const [hoveredNodeData, setHoveredNodeData] = useState(null);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [minDate, setMinDate] = useState(1650);
  const [maxDate, setMaxDate] = useState(1800);
  const [metrics, setMetrics] = useState(null);
  const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] });
  const [showEdges, setShowEdges] = useState(true);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [selectedEdgeTypes, setSelectedEdgeTypes] = useState(['document', 'organization', 'religion', 'relationship']); // Default selected edge types

  const getGraphData = async () => {
    const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
    const graphData = await fetchGraphData(`${baseExpressUrl}graph`, 2000, 0);
    setGraph(graphData.graph || { nodes: [], edges: [] });
    setMetrics(graphData.metrics);
    setMinDate(graphData.minDate);
    setMaxDate(graphData.maxDate);
    setTimeRange([graphData.minDate, graphData.maxDate]);
    setOriginalGraph(graphData.graph || { nodes: [], edges: [] });
    setLoading(false);
    console.log("Graph Data:", graphData);
  };

  useEffect(() => {
    getGraphData();
  }, []);

  const handleOpenClick = (rowData) => {
    const id = uuidv4();
    setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData: rowData }]);
  };

  const handleCloseDialog = (id) => {
    setDialogs((prevDialogs) =>
      prevDialogs.filter((dialog) => dialog.id !== id)
    );
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
    console.log(node);
    setSelectedNodes((prevSelectedNodes) => [
      {
        ...node,
        isOpen: false,
        activeTabIndex: 0,
        idNode: uuidv4(),
      },
      ...prevSelectedNodes,
    ]);
  };

  const handleCloseNode = (rowIndex) => {
    setSelectedNodes((prevSelectedNodes) => {
      const updatedNodes = prevSelectedNodes.filter(
        (_, index) => index !== rowIndex.rowIndex
      );
      return [...updatedNodes];
    });
  };

  const onRowReorder = (event) => {
    setSelectedNodes(event.value);
  };

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
    applyFilters(newValue, selectedTerms, selectedEdgeTypes);
  };

  const applyFilters = (timeRange, terms, edgeTypes = selectedEdgeTypes) => {
    const newEdges = originalGraph.edges.filter((edge) => {
      const parseDate = (dateStr) => {
        if (typeof dateStr === "number") {
          return new Date(dateStr, 0);
        }

        if (typeof dateStr !== "string") {
          return null;
        }

        const parts = dateStr.split("-");
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        } else if (parts.length === 2) {
          return new Date(parts[0], parts[1] - 1);
        } else if (parts.length === 1) {
          return new Date(parts[0], 0);
        }

        return null;
      };

      // If no edge types are selected, show all edges
      if (edgeTypes.length === 0) {
        return true;
      }

      // Only include edges that match the selected edge types
      if (!edgeTypes.includes(edge.type)) {
        return false;
      }

      if (edge.type === "document") {
        const edgeDate = parseDate(edge.date);
        return (
          edgeDate >= new Date(timeRange[0], 0) &&
          edgeDate <= new Date(timeRange[1], 11, 31)
        );
      } else {
        return true;
      }
    });

    const newNodes = originalGraph.nodes.filter((node) => {
      return newEdges.some(
        (edge) => edge.source === node.id || edge.target === node.id
      );
    });

    const filteredGraph = { nodes: newNodes, edges: newEdges };
    filterGraphWithTerms(filteredGraph, terms);
  };

  const filterGraphWithTerms = (graph, terms) => {
    if (terms.length === 0) {
      setGraph(graph);
      return;
    }

    const filteredNodes = graph.nodes.filter(
      (node) =>
        (node.data?.person?.fullName !== undefined &&
          terms.includes(node.data.person.fullName)) ||
        (node.label !== undefined && terms.includes(node.label))
    );

    const connectedNodeIds = new Set(filteredNodes.map((node) => node.id));
    const immediateConnections = new Set();

    graph.edges.forEach((edge) => {
      if (connectedNodeIds.has(edge.source)) {
        immediateConnections.add(edge.target);
      }
      if (connectedNodeIds.has(edge.target)) {
        immediateConnections.add(edge.source);
      }
    });

    const allFilteredNodes = graph.nodes.filter(
      (node) =>
        connectedNodeIds.has(node.id) || immediateConnections.has(node.id)
    );

    const filteredEdges = graph.edges.filter(
      (edge) =>
        (connectedNodeIds.has(edge.source) &&
          immediateConnections.has(edge.target)) ||
        (connectedNodeIds.has(edge.target) &&
          immediateConnections.has(edge.source))
    );

    setGraph({ nodes: allFilteredNodes, edges: filteredEdges });
  };

  const handleTimeRangeCommit = async (event, newValue) => {
    // Update the graph by pruning nodes and edges that are outside the time range
  };

  const renderHeader = (node, index) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{node?.data?.person?.fullName || node.label}</span>
      <Button
        icon="pi pi-external-link"
        className="p-button-rounded p-button-text"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          handleOpenClick(node);
        }}
      />
      <Button
        icon="pi pi-times"
        className="p-button-rounded p-button-text"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          handleCloseNode(index);
        }}
      />
    </div>
  );

  const toggleAccordion = (nodeId) => {
    const nodeToToggle = selectedNodes.find((node) => node.idNode === nodeId);
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.map((node) =>
        node.idNode === nodeId ? { ...node, isOpen: !node.isOpen } : node
      )
    );
  };

  const renderAccordion = (rowData, index) => {
    const id = rowData.idNode;
    const activeTabIndex =
      selectedNodes.find((node) => node.idNode === id)?.activeTabIndex || 0;

    const setActiveTabIndex = (newIndex) => {
      setSelectedNodes((prevSelectedNodes) =>
        prevSelectedNodes.map((node) =>
          node.idNode === id ? { ...node, activeTabIndex: newIndex } : node
        )
      );
    };

    return (
      <Accordion
        key={id}
        activeIndex={
          selectedNodes.find((node) => node.idNode === id)?.isOpen ? 0 : null
        }
        onTabChange={() => toggleAccordion(id)}
        style={{ width: "100%", flexGrow: 1 }}
      >
        <AccordionTab header={renderHeader(rowData, index)}>
          <div style={{ overflow: "auto", height: "100%", maxHeight: "45vh" }}>
            <NodeDetails
              key={id}
              nodeData={rowData}
              activeTabIndex={activeTabIndex}
              setActiveTabIndex={setActiveTabIndex}
              handleNodeClick={handleNodeClick}
            />
          </div>
        </AccordionTab>
      </Accordion>
    );
  };

  const onFilterChange = (filteredGraph, terms) => {
    setSelectedTerms(terms);
    applyFilters(timeRange, terms, selectedEdgeTypes);
  };

  const handleEdgeTypeChange = (newEdgeTypes) => {
    console.log("Selected Edge Types:", newEdgeTypes);
    setSelectedEdgeTypes(newEdgeTypes);
    applyFilters(timeRange, selectedTerms, newEdgeTypes);
  };

  return (
    <>
      <div className={styles.content}>
        <Splitter style={{ overflowY: "auto" }}>
          <SplitterPanel
            size={30}
            minSize={0}
            style={{
              display: "flex",
              flexDirection: "column",
              height: "90vh",
              overflowY: "auto",
            }}
          >
            <ToggleButton
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              checked={showEdges}
              onChange={(e) => setShowEdges(e.value)}
              onLabel="Show Edges"
              offLabel="Hide Edges"
              severity={showEdges ? "success" : "danger"}
            />
            <DataTable
              className="Home-DataTable"
              value={selectedNodes}
              reorderableRows
              onRowReorder={onRowReorder}
              key={selectedNodes.length}
              emptyMessage="Select a node to view its details"
            >
              <Column
                body={(rowData, index) => renderAccordion(rowData, index)}
                header={"Sidecars"}
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
                <div className={styles.filterToolContainer}>
                  <FilterTool
                    graph={graph}
                    setGraph={setGraph}
                    originalGraph={originalGraph}
                    onFilterChange={onFilterChange}
                  />
                </div>
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

      {/* Add the EdgeTypeFilter component in the bottom-right corner */}
      <EdgeTypeFilter
        selectedEdgeTypes={selectedEdgeTypes}
        onChange={handleEdgeTypeChange}
      />

      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          header={
            dialog.nodeData.data?.person?.fullName || dialog?.nodeData?.label
          }
          maximizable
          modal={false}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          style={{
            width: "35vw",
            height: "70vh",
            minWidth: "15vw",
            minHeight: "15vw",
          }}
          breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        >
          <NodeDetails
            nodeData={dialog.nodeData}
            handleNodeClick={handleNodeClick}
            activeTabIndex={dialog.activeTabIndex}
            setActiveTabIndex={(index) => {
              const updatedDialogs = dialogs.map((dlg) =>
                dlg.id === dialog.id ? { ...dlg, activeTabIndex: index } : dlg
              );
              setDialogs(updatedDialogs);
            }}
          />
        </Dialog>
      ))}
    </>
  );
};

export default Home;
