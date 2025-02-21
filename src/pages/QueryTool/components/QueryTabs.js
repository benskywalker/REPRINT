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
  visibleColumns
}) => {
  const mapIframeRef = useRef(null);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [dialogs, setDialogs] = useState([]);

  // Toggle an accordion's open state
  const toggleAccordion = (id) => {
    setSelectedPersons(prev =>
      prev.map(person =>
        person.idNode === id ? { ...person, isOpen: !person.isOpen } : person
      )
    );
  };

  // Render header similar to Home.js
  const renderHeader = (rowData, index) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{rowData.data.person.fullName}</span>
      <div>
        <Button
          icon="pi pi-external-link"
          className="p-button-text"
          onClick={(event) => {
            event.stopPropagation();
            handlePopoutPerson(rowData.idNode);
          }}
        />
        <Button
          icon="pi pi-times"
          className="p-button-text"
          onClick={(event) => {
            event.stopPropagation();
            handleClosePerson(rowData.idNode);
          }}
        />
      </div>
    </div>
  );

  // Render accordion similar to Home.js
  const renderAccordion = (rowData, index) => {
    const id = rowData.idNode;
    const person = selectedPersons.find(p => p.idNode === id);
    const activeTabIndex = person?.activeTabIndex || 0;

    const setActiveTabIndex = (newIndex) => {
      setSelectedPersons(prev =>
        prev.map(p =>
          p.idNode === id ? { ...p, activeTabIndex: newIndex } : p
        )
      );
    };

    return (
      <Accordion
        key={id}
        activeIndex={person?.isOpen ? 0 : null}
        onTabChange={() => toggleAccordion(id)}
        style={{ width: "100%", flexGrow: 1 }}
      >
        <AccordionTab header={renderHeader(rowData, index)}>
          <div style={{ overflow: "auto", height: "100%", maxHeight: "45vh" }}>
            <Sidecar
              nodeData={rowData}
              activeTabIndex={activeTabIndex}
              setActiveTabIndex={setActiveTabIndex}
              handleNodeClick={() => {}}
            />
          </div>
        </AccordionTab>
      </Accordion>
    );
  };

  // Function to remove a person from selectedPersons list
  const handleClosePerson = (idNode) => {
    setSelectedPersons(prev =>
      prev.filter(person => person.idNode !== idNode)
    );
  };

  // Modify popout button to open dialog on demand
  const handlePopoutPerson = (idNode) => {
    const personData = selectedPersons.find(p => p.idNode === idNode);
    if (personData) {
      // Open dialog only when popout button is pressed
      const id = uuidv4();
      setDialogs(prevDialogs => [...prevDialogs, { id, nodeData: personData, activeTabIndex: personData.activeTabIndex || 0 }]);
    }
  };

  const sendQueryDataToIframe = () => {
    if (mapIframeRef.current) {
      const queryDataObj = {
        tables: [selectedView],
        fields: sections.map(section =>
          section.selectedField ? section.selectedField.field : null
        ),
        operators: sections.map(section =>
          section.selectedParameter ? {
            equals: "=",
            not_equals: "!=",
            like: "LIKE",
            not_like: "NOT LIKE",
            greater_than: ">",
            less_than: "<",
            greater_than_or_equal: ">=",
            less_than_or_equal: "<=",
          }[section.selectedParameter] : null
        ),
        values: sections.map(section => section.selectedValue),
        dependentFields: sections.map(section => section.selectedAction),
      };

      mapIframeRef.current.contentWindow.postMessage(queryDataObj, 'http://localhost:4001');
    }
  };

  // Opens a dialog with full details (unused in automatic flow now)
  const handleOpenDialog = (nodeData) => {
    const id = uuidv4();
    setDialogs(prevDialogs => [...prevDialogs, { id, nodeData, activeTabIndex: 0 }]);
  };

  const handleCloseDialog = (id) => {
    setDialogs(prevDialogs => prevDialogs.filter(dialog => dialog.id !== id));
  };

  // Fetch extra person details and update state
  const handlePersonClick = async (person) => {
    try {
      const baseUrl = process.env.REACT_APP_BASEEXPRESSURL;
      const response = await fetch(`${baseUrl}person/${person.personID}`);
      if (!response.ok) {
        throw new Error("Failed fetching person details.");
      }
      const fullPersonData = await response.json();
      const enrichedPerson = {
        ...person,
        data: {
          person: {
            ...fullPersonData[0],
            letters: fullPersonData[0].letters,  // include Letters
            mentions: fullPersonData[0].mentions // include Mentions
          }
        }
      };
      // Ensure the entire enriched data is available for Sidecar components
      if (fullPersonData[0].documents) {
        enrichedPerson.documents = fullPersonData[0].documents;
      }
      console.log("Enriched person data", enrichedPerson);
      setSelectedPersons(prevSelected => [
        {
          ...enrichedPerson,
          isOpen: false,
          activeTabIndex: 0,
          idNode: uuidv4(),
        },
        ...prevSelected,
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for messages from the map iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:4001') return;
      console.log("MESSAGE RECEIVED: ", event.data);
      if (event.data.personID) {
        handlePersonClick(event.data);
      } else {
        // If non-person data, you can do other stuff here if needed.
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      <TabView
        className="query-tool"
        activeIndex={activeIndex}
        onTabChange={onTabChange}
      >
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
            />
          ))}
        </TabPanel>

        <TabPanel header="Network" leftIcon="pi pi-user mr-2">
          <QueryGraph
            nodesUrl={process.env.REACT_APP_BASEEXPRESSURL + "nodes-query"}
            edgesUrl={process.env.REACT_APP_BASEEXPRESSURL + "edges-query"}
            body={{
              tables: [selectedView],
              fields: sections.map(section =>
                section.selectedField ? section.selectedField.field : null
              ),
              operators: sections.map(section =>
                section.selectedParameter ? {
                  equals: "=",
                  not_equals: "!=",
                  like: "LIKE",
                  not_like: "NOT LIKE",
                  greater_than: ">",
                  less_than: "<",
                  greater_than_or_equal: ">=",
                  less_than_or_equal: "<=",
                }[section.selectedParameter] : null
              ),
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
                width: "1vw", // match Home.js left panel ratio
              }}
            >
              <DataTable
                className="Home-DataTable"
                value={selectedPersons}
                emptyMessage="Select a name to view its details"
              >
                <Column
                  body={(rowData, index) => renderAccordion(rowData, index)}
                  header={"Sidecars"}
                />
              </DataTable>
            </SplitterPanel>
            <SplitterPanel>
              <iframe
                ref={mapIframeRef}
                title="Map"
                style={{ width: "100%", height: "80vh" }}
                src="http://localhost:4001"
                allowFullScreen
                loading="lazy"
                onLoad={sendQueryDataToIframe}
              />
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

      {dialogs.map((dialog) => (
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

export default QueryTabs;