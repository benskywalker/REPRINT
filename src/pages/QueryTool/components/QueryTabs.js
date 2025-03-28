import React, { useEffect, useRef, useState } from 'react';
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import QuerySection from './QuerySection';
import ResultsTable from './ResultsTable';
import QueryGraph from '../../../components/querytool/QueryGraph';
import { views } from '../Constants';
import '../styles/QueryTabs.css';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Sidecar from '../../../components/sidecar/Sidecar';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { v4 as uuidv4 } from 'uuid';
import { ProgressSpinner } from 'primereact/progressspinner';
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
  removeSection,
  hasValidQuery
}) => {
  const { graph, setGraph, originalGraph, setOriginalGraph } = useGraph();
  const mapIframeRef = useRef(null);
  const [selectedNodes, setSelectedNodes] = useState([])

  const [dialogs, setDialogs] = useState([]);
  const [mapIsReady, setMapIsReady] = useState(false);
  const dragHandleRef = useRef(null);
  const containerRef = useRef(null);
  const [panelSize, setPanelSize] = useState(30); // in percentage, for example
  const [isDragging, setIsDragging] = useState(false);

  // For
  useEffect(() => {
    const handlePointerMove = (e) => {
      // Calculate the new panel size based on mouse x position relative to container width.
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        let newSize = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        newSize = Math.min(100, Math.max(0, newSize));
        setPanelSize(newSize);
      }
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    // Optionally capture pointer events on the drag handle
    if (e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
    e.preventDefault(); 
  };

  const toggleAccordion = (nodeId) => {
    const nodeToToggle = selectedNodes.find((node) => node.idNode === nodeId);
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.map((node) =>
        node.idNode === nodeId ? { ...node, isOpen: !node.isOpen } : node
      )
    );
  };

  const edgeFilters = hasValidQuery
    ? {
      Sender: true,
      Receiver: true,
      Mentioned: true,
      Author: true,
      Waypoint: true,
      document: true,
      organization: true,
      religion: true,
      relationship: true,
      Unknown: true,
    }
    : {
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
    };


  console.log("Edge filters: ", edgeFilters);
  console.log(graph);

  // Render header for each accordion—shows the full name and action buttons
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
          handleCloseNode(node.idNode);
        }}
      />
    </div>
  );

  // Updated renderAccordion function
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
            <Sidecar
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

  // Remove a person from the selectedPersons list
  // const handleClosePerson = (idNode) => {
  //   setSelectedPersons(prev => prev.filter(person => person.idNode !== idNode));
  // };

  // // Open a popout dialog for the person sidecar; triggered by the external-link button
  // const handlePopoutPerson = (idNode) => {
  //   const personData = selectedPersons.find(p => p.idNode === idNode);
  //   if (personData) {
  //     const id = uuidv4();
  //     setDialogs(prev => [...prev, { id, nodeData: personData, activeTabIndex: personData.activeTabIndex || 0 }]);
  //   }
  // };

  // // Remove a person from the selectedPersons list
  // const handleCloseDocument = (idNode) => {
  //   setSelectedDocument(prev => prev.filter(document => document.idNode !== idNode));
  // };

  // // Open a popout dialog for the document sidecar; triggered by the external-link button
  // const handlePopoutDocument = (idNode) => {
  //   const documentData = selectedDocument.find(p => p.idNode === idNode);
  //   if (documentData) {
  //     const id = uuidv4();
  //     setDialogs(prev => [...prev, { id, nodeData: documentData, activeTabIndex: documentData.activeTabIndex || 0 }]);
  //   }
  // };

  // const handleCloseNode = (rowIndex) => {
  //   setSelectedNodes((prevSelectedNodes) => {
  //     const updatedNodes = prevSelectedNodes.filter(
  //       (_, index) => index !== rowIndex.rowIndex
  //     );
  //     return [...updatedNodes];
  //   });
  // };

  const handleOpenClick = (rowData) => {
    const id = uuidv4();
    setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData: rowData }]);
  };

  const handleCloseNode = (idNode) => {
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.filter(node => node.idNode !== idNode)
    );
  };


  const handleNodeClick = (data) => {
    let nodeData = null;
    console.log("Data!!", data);
  
    if (data.documentID != null) {
      nodeData = graph.nodes.find(node => node.documentID === data.documentID);
      console.log("I'm a document!!!!", nodeData);
    }
    if (data.personID != null) {
      nodeData = graph.nodes.find(node => node.personID === data.personID);
    }
  
    console.log("Fetched NODE data", nodeData);
    if (!nodeData) 
      return;
  
    setSelectedNodes((prevSelectedNodes) => {
      // Check if the clicked node already exists (to prevent duplicate sidecars)
      const duplicateIndex = prevSelectedNodes.findIndex((node) => {
        if (nodeData.documentID != null) {
          return node.documentID === nodeData.documentID;
        }
        if (nodeData.personID != null) {
          return node.personID === nodeData.personID;
        }
        return false;
      });
    
      if (duplicateIndex !== -1) {
        console.log("Sidecar for this node already exists. Bringing it to the top.");
        // Remove the duplicate and then add it at the start.
        const duplicateNode = prevSelectedNodes[duplicateIndex];
        // Filter out the duplicate from its previous position.
        const filteredNodes = prevSelectedNodes.filter((_, index) => index !== duplicateIndex);
        return [duplicateNode, ...filteredNodes];
      };
    
      // If no duplicate exists then add the new node.
      return [
        { ...nodeData, isOpen: false, activeTabIndex: 0, idNode: uuidv4() },
        ...prevSelectedNodes,
      ];
    });
  };

  // Send query data to the iframe (e.g. map) when loaded
  const sendQueryDataToIframe = () => {
    if (mapIframeRef.current) {
      
      const queryDataObj = {
        tables: [selectedView],
        fields: sections.map(section => section.selectedField ? section.selectedField.field : null),
        operators: sections.map(section => section.selectedParameter ? {
          equals: "=",
          not_equals: "!=",
          like: "LIKE",
          not_like: "NOT LIKE",
          greater_than: ">",
          less_than: "<",
          greater_than_or_equal: ">=",
          less_than_or_equal: "<=",
        }[section.selectedParameter] : null),
        values: sections.map(section => section.selectedValue),
        dependentFields: sections.map(section => section.selectedAction),
      };

      // Post query data to the map iframe
      //mapIframeRef.current.contentWindow.postMessage(queryDataObj, process.env.REACT_APP_PRINT_MAPPING_URL);
      console.log("Query Data: ", queryDataObj);
      console.log("Sending to ", process.env.REACT_APP_PRINT_MAPPING_URL);
      mapIframeRef.current.contentWindow.postMessage(queryDataObj, process.env.REACT_APP_PRINT_MAPPING_URL);
    }
  };

  // Open a dialog with full details via the Sidecar component
  const handleOpenDialog = (nodeData) => {
    const id = uuidv4();
    setDialogs(prev => [...prev, { id, nodeData, activeTabIndex: 0 }]);
  };

  // Remove a dialog from state
  const handleCloseDialog = (id) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id));
  };

  // Listen for messages from the map iframe and trigger person detail fetch as needed
  useEffect(() => {
    const handleMessage = (event) => {
      const rootMapUrl = window.location.protocol + "//" + window.location.hostname;
      if (event.origin !== process.env.REACT_APP_PRINT_MAPPING_URL && event.origin != rootMapUrl) return;
      console.log("MESSAGE RECEIVED: ", event.data);

      if (event.data.mappingReady) {
        setMapIsReady(true);
      }

      if (event.data.personID || event.data.documentID)
        handleNodeClick(event.data);
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (activeIndex !== 2) {
      setMapIsReady(false);
    }
  }, [activeIndex]);

  const renderMap = () => {
    return (
      <div style={{ position: 'relative', width: '100%', height: '80vh' }}>
        <iframe
          ref={mapIframeRef}
          title="Map"
          style={{
            width: "100%",
            height: "80vh",
            opacity: mapIsReady ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          src={process.env.REACT_APP_PRINT_MAPPING_URL}
          allowFullScreen
          loading="lazy"
          onLoad={sendQueryDataToIframe}
        />

        {!mapIsReady && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            <p style={{ marginTop: '1rem' }}>Loading map data...</p>
          </div>
        )}
      </div>
    );
  };


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
            nodesUrl={hasValidQuery ?
              `${process.env.REACT_APP_BASEEXPRESSURL}nodes-query` :
              `${process.env.REACT_APP_BASEEXPRESSURL}nodes`}
            edgesUrl={hasValidQuery ?
              `${process.env.REACT_APP_BASEEXPRESSURL}edges-query` :
              `${process.env.REACT_APP_BASEEXPRESSURL}edges`}
            edgeFilters={edgeFilters}

            {...(hasValidQuery && {
              body: {
                tables: [selectedView],
                fields: sections.map(section => section.selectedField ? section.selectedField.field : null),
                operators: sections.map(section => section.selectedParameter ? {
                  equals: "=",
                  not_equals: "!=",
                  like: "LIKE",
                  not_like: "NOT LIKE",
                  greater_than: ">",
                  less_than: "<",
                  greater_than_or_equal: ">=",
                  less_than_or_equal: "<=",
                }[section.selectedParameter] : null),
                values: sections.map(section => section.selectedValue),
                dependentFields: sections.map(section => section.selectedAction),
              }
            })}
          />
        </TabPanel>

        <TabPanel header="Map" leftIcon="pi pi-map-marker mr-2">
          <div ref={containerRef} style={{ display: "flex", height: "90vh", overflow: "hidden" }}>
            <div
              style={{
                width: `${panelSize}%`,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Left Panel Content */}
              <DataTable
                className="Home-DataTable"
                value={selectedNodes}
                emptyMessage="Select a name to view its details"
              >
                <Column body={(rowData, index) => renderAccordion(rowData, index)} header={"Sidecars"} />
              </DataTable>
            </div>
            <div
              ref={dragHandleRef}
              onPointerDown={handlePointerDown}
              style={{
                width: "5px",
                cursor: "col-resize",
                backgroundColor: "#ccc"
              }}
            />
            <div style={{ flexGrow: 1 }}>
              {renderMap()}
            </div>
          </div>
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

      {dialogs.map(dialog => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data?.person?.fullName || dialog.nodeData.label || 'Details'}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          draggable={true}
          modal={false}
          maximizable
          // Add mouse events to disable/enable pointer events on the iframe.
          onMouseDown={() => {
            if (mapIframeRef.current) {
              mapIframeRef.current.style.pointerEvents = 'none';
            }
          }}
          onMouseUp={() => {
            if (mapIframeRef.current) {
              mapIframeRef.current.style.pointerEvents = 'auto';
            }
          }}
          style={{ width: '35vw', height: '70vh', minWidth: '15vw', minHeight: '15vw' }}
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
          <Sidecar
            nodeData={dialog.nodeData}
            handleNodeClick={() => { }}
            activeTabIndex={dialog.activeTabIndex || 0}
            setActiveTabIndex={(index) => {
              const updatedDialogs = dialogs.map(dlg =>
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

export default QueryTabs;