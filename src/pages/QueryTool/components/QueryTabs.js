import React, { useEffect, useRef, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Accordion, AccordionTab } from "primereact/accordion";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { v4 as uuidv4 } from "uuid";
import QuerySection from "./QuerySection";
import ResultsTable from "./ResultsTable";
import QueryGraph from "../../../components/querytool/QueryGraph";
import Sidecar from "../../../components/sidecar/Sidecar";
import { views } from "../Constants";
import "../styles/QueryTabs.css";
import { useGraph } from "../../../context/GraphContext";

const QueryTabs = ({
  activeIndex,
  onTabChange,
  selectedView,
  currentTable,
  updateFields,
  sections,
  setSections,
  filteredFields,
  queryData,
  loading,
  graphData,
  globalFilter,
  filters,
  onFilter,
  handleButtonClick,
  truncateText,
  header,
  visibleColumns,
  addNewSection,
  removeSection
}) => {
  const { graph } = useGraph();
  const mapIframeRef = useRef(null);
  const querySentRef = useRef(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [dialogs, setDialogs] = useState([]);
  const [mapIsReady, setMapIsReady] = useState(false);

  // Toggle accordion expanded state for a given node
  const toggleAccordion = (nodeId) => {
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.map((node) =>
        node.idNode === nodeId ? { ...node, isOpen: !node.isOpen } : node
      )
    );
  };

  // Render header for each accordion with person's fullName or fallback label
  const renderHeader = (node, index) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{node?.data?.person?.fullName || node.label}</span>
      <div>
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
            handleCloseNode(node.idNode);
          }}
        />
      </div>
    </div>
  );

  // Render an accordion item containing a Sidecar for a given rowData node
  const renderAccordion = (rowData, index) => {
    const id = rowData.idNode;
    const activeTabIndex = selectedNodes.find((node) => node.idNode === id)?.activeTabIndex || 0;

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
        activeIndex={selectedNodes.find((node) => node.idNode === id)?.isOpen ? 0 : null}
        onTabChange={() => toggleAccordion(id)}
        style={{ width: "100%", flexGrow: 1 }}
      >
        <AccordionTab header={renderHeader(rowData, index)}>
          <div style={{ overflow: "auto", height: "100%", maxHeight: "45vh" }}>
            <Sidecar
              key={id}
              nodeData={rowData}
              activeTabIndex={activeTabIndex}
              setActiveTabIndex={setActiveTabIndex}
              handleNodeClick={handleButtonClick}
            />
          </div>
        </AccordionTab>
      </Accordion>
    );
  };

  // Open a new dialog for node details using Sidecar
  const handleOpenClick = (rowData) => {
    const id = uuidv4();
    setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData: rowData, activeTabIndex: 0 }]);
  };

  // Remove a node accordion from selectedNodes
  const handleCloseNode = (idNode) => {
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.filter((node) => node.idNode !== idNode)
    );
  };

  // Handle node lookup based on personID or documentID from iframe message
  const handleNodeClick = (data) => {
    let nodeData = null;
    console.log("Data received:", data);

    if (data.documentID != null) {
      nodeData = graph.nodes.find((node) => node.documentID === data.documentID);
      console.log("Document node found:", nodeData);
    } else if (data.personID != null) {
      nodeData = graph.nodes.find((node) => node.personID === data.personID);
    }

    console.log("Fetched NODE data:", nodeData);
    if (!nodeData) {
      console.error("NODE LOOKUP FAILED");
      return;
    }

    setSelectedNodes((prev) => [
      { ...nodeData, isOpen: false, activeTabIndex: 0, idNode: uuidv4() },
      ...prev,
    ]);
  };

  // Send query data to the iframe if not already sent for current filters/state
  const sendQueryDataToIframe = () => {
    if (mapIframeRef.current && mapIsReady && !querySentRef.current) {
      const queryDataObj = {
        tables: [selectedView],
        fields: sections.map((section) => (section.selectedField ? section.selectedField.field : null)),
        operators: sections.map((section) =>
          section.selectedParameter
            ? {
                equals: "=",
                not_equals: "!=",
                like: "LIKE",
                not_like: "NOT LIKE",
                greater_than: ">",
                less_than: "<",
                greater_than_or_equal: ">=",
                less_than_or_equal: "<=",
              }[section.selectedParameter]
            : null
        ),
        values: sections.map((section) => section.selectedValue),
        dependentFields: sections.map((section) => section.selectedAction),
      };
      console.log("Sending to", process.env.REACT_APP_PRINT_MAPPING_URL, queryDataObj);
      mapIframeRef.current.contentWindow.postMessage(queryDataObj, process.env.REACT_APP_PRINT_MAPPING_URL);
      querySentRef.current = true;
    }
  };

  // Reset the querySent flag whenever filtering changes
  useEffect(() => {
    querySentRef.current = false;
  }, [sections, selectedView]);

  // Listen for window messages (e.g. map iframe ready and node data messages)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== process.env.REACT_APP_PRINT_MAPPING_URL) return;
      console.log("MESSAGE RECEIVED:", event.data);

      if (event.data.mappingReady) {
        setMapIsReady(true);
      }
      if (event.data.personID || event.data.documentID) {
        handleNodeClick(event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Reset map readiness if active tab is not "Map" (assumed index 2)
  useEffect(() => {
    if (activeIndex !== 2) {
      setMapIsReady(false);
    }
  }, [activeIndex]);

  // When map is ready, send query data once
  useEffect(() => {
    if (mapIsReady) sendQueryDataToIframe();
  }, [mapIsReady]);

  // Render the iframe map
  const renderMap = () => (
    <div style={{ position: "relative", width: "100%", height: "80vh" }}>
      <iframe
        ref={mapIframeRef}
        title="Map"
        style={{
          width: "100%",
          height: "80vh",
          opacity: mapIsReady ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        src={process.env.REACT_APP_PRINT_MAPPING_URL}
        allowFullScreen
        loading="lazy"
        onLoad={sendQueryDataToIframe}
      />
      {!mapIsReady && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
          }}
        >
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p style={{ marginTop: "1rem" }}>Loading map data...</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <TabView className="query-tool" activeIndex={activeIndex} onTabChange={onTabChange}>
        <TabPanel header="Query" leftIcon="pi pi-search mr-2" className="query-tab-panel">
          <div className="query-section">
            <h3>Search for:</h3>
            <Dropdown
              tooltip="Select a table to search for"
              value={selectedView}
              onChange={updateFields}
              options={views}
              optionLabel="label"
              placeholder="Parameters"
              filter
              className="w-full md:w-14rem"
            />
          </div>
          {sections.map((section, index) => (
            <QuerySection
              key={section.id}
              section={section}
              index={index}
              filteredFields={filteredFields}
              sections={sections}
              setSections={setSections}
              addNewSection={addNewSection}
              removeSection={removeSection}
            />
          ))}
        </TabPanel>

        <TabPanel header="Network" leftIcon="pi pi-user mr-2">
          <QueryGraph
            nodesUrl={`${process.env.REACT_APP_BASEEXPRESSURL}nodes-query`}
            edgesUrl={`${process.env.REACT_APP_BASEEXPRESSURL}edges-query`}
            body={{
              tables: [selectedView],
              fields: sections.map((section) => (section.selectedField ? section.selectedField.field : null)),
              operators: sections.map((section) =>
                section.selectedParameter
                  ? {
                      equals: "=",
                      not_equals: "!=",
                      like: "LIKE",
                      not_like: "NOT LIKE",
                      greater_than: ">",
                      less_than: "<",
                      greater_than_or_equal: ">=",
                      less_than_or_equal: "<=",
                    }[section.selectedParameter]
                  : null
              ),
              values: sections.map((section) => section.selectedValue),
              dependentFields: sections.map((section) => section.selectedAction),
            }}
          />
        </TabPanel>

        <TabPanel header="Map" leftIcon="pi pi-map-marker mr-2">
          <Splitter style={{ overflowY: "auto" }}>
            <SplitterPanel
              size={30}
              minSize={0}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "90vh",
                overflowY: "auto",
                width: "1vw",
              }}
            >
              <DataTable
                className="Home-DataTable"
                value={selectedNodes}
                emptyMessage="Select a name to view its details"
              >
                <Column body={(rowData, index) => renderAccordion(rowData, index)} header="Sidecars" />
              </DataTable>
            </SplitterPanel>
            <SplitterPanel>{renderMap()}</SplitterPanel>
          </Splitter>
        </TabPanel>

        <TabPanel header="Table" leftIcon="pi pi-table mr-2">
          <ResultsTable
            loading={loading}
            queryData={queryData}
            visibleColumns={visibleColumns}
            globalFilter={globalFilter}
            filters={filters}
            onFilter={onFilter}
            selectedView={selectedView}
            currentTable={currentTable}
            handleButtonClick={handleButtonClick}
            truncateText={truncateText}
            header={header}
          />
        </TabPanel>
      </TabView>

      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data?.person?.fullName || dialog.nodeData.label || "Details"}
          visible={true}
          onHide={() => setDialogs((prev) => prev.filter((d) => d.id !== dialog.id))}
          draggable={true}
          modal={false}
          maximizable
          style={{ width: "35vw", height: "70vh", minWidth: "15vw", minHeight: "15vw" }}
          breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        >
          <Sidecar
            nodeData={dialog.nodeData}
            handleNodeClick={() => {}}
            activeTabIndex={dialog.activeTabIndex || 0}
            setActiveTabIndex={(index) => {
              setDialogs((prevDialogs) =>
                prevDialogs.map((dlg) =>
                  dlg.id === dialog.id ? { ...dlg, activeTabIndex: index } : dlg
                )
              );
            }}
          />
        </Dialog>
      ))}
    </>
  );
};

export default QueryTabs;