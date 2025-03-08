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
import { Toast } from "primereact/toast";

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
  const { graph, setGraph, originalGraph, setOriginalGraph } = useGraph();
  const mapIframeRef = useRef(null);
  const [selectedNodes, setSelectedNodes] = useState([])  
  
  const [dialogs, setDialogs] = useState([]);
  const [mapIsReady, setMapIsReady] = useState(false);

  const toast = useRef(null);

  const toggleAccordion = (nodeId) => {
    const nodeToToggle = selectedNodes.find((node) => node.idNode === nodeId);
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.map((node) =>
        node.idNode === nodeId ? { ...node, isOpen: !node.isOpen } : node
      )
    );
  };

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


  const handleNodeClick = (data)=> {

    var nodeData = null

    console.log("Data!!", data);

    if (data.documentID != null) {
      nodeData = graph.nodes.find(node => node.documentID === data.documentID);
      console.log("I'm a document!!!!", nodeData)
    }

    if (data.personID != null) {
      nodeData = graph.nodes.find(node => node.personID === data.personID);
    }

    console.log("Fetched NODE data", nodeData);
    
    if (nodeData == null) {
      console.error("NODE LOOK UP RETURNED NULL");
      toast.current.show({
        severity: "info",
        summary: "Data Not Found",
        detail: `This person or document does not exist in the local database or is not showable.`,
        life: 4500,
      });
    }

    else {
      setSelectedNodes(prev => [
      { ...nodeData, isOpen: false, activeTabIndex: 0, idNode: uuidv4() },
        ...prev,
      ]);
    }

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
      <Toast ref={toast} />
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
                <Column
                  body={(rowData, index) => renderAccordion(rowData, index)}
                  header={"Sidecars"}
                />
              </DataTable>
            </SplitterPanel>
            <SplitterPanel>
              {renderMap()}
            </SplitterPanel>
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

      {dialogs.map(dialog => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data?.person?.fullName || dialog.nodeData.label || 'Details'}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          draggable={true}
          modal={false}
          maximizable
          style={{ width: '35vw', height: '70vh', minWidth: '15vw', minHeight: '15vw' }}
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
          <Sidecar
            nodeData={dialog.nodeData}
            handleNodeClick={() => {}}
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