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

  const sendQueryDataToIframe = () => {
    if (mapIframeRef.current) {
      console.log("Iframe has loaded, sending query data...");
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

  // Opens a dialog (sidecar) using the provided nodeData (which should be fully enriched)
  const handleOpenDialog = (nodeData) => {
    const id = uuidv4();
    setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData, activeTabIndex: 0 }]);
  };

  const handleCloseDialog = (id) => {
    setDialogs((prevDialogs) => prevDialogs.filter((dialog) => dialog.id !== id));
  };

  // Fetch extra person details using the personID, enrich the data and open a sidecar
  const handlePersonClick = async (person) => {
    try {
      const baseUrl = process.env.REACT_APP_BASEEXPRESSURL;
      const response = await fetch(`${baseUrl}person/${person.personID}`);
      if (!response.ok) {
        throw new Error("Failed fetching person details.");
      }
      const fullPersonData = await response.json();
      const enrichedPerson = { ...person, data: { person: fullPersonData[0] } };
      console.log("Added enriched person data", enrichedPerson);
      setSelectedPersons(prevSelected => [
        {
          ...enrichedPerson,
          isOpen: false,
          activeTabIndex: 0,
          idNode: uuidv4(),
        },
        ...prevSelected,
      ]);
      // Open the sidecar dialog after enrichment
      handleOpenDialog(enrichedPerson);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for messages from the map iframe and possibly open a sidecar
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:4001') return;
      console.log("MESSAGE RECEIVED: ", event.data);
      // If event.data has a personID then fetch additional details
      if (event.data.personID) {
        handlePersonClick(event.data);
      } else {
        // If the data already has full details, simply open the dialog
        handleOpenDialog(event.data);
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
        <TabPanel
          header="Query"
          leftIcon="pi pi-search mr-2"
          className="query-tab-panel"
        >
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
                width: "1vw",
              }}
            >
              <DataTable
                className="Home-DataTable"
                value={selectedPersons}
                emptyMessage="Select a name to view its details"
              >
                <Column
                  body={(rowData, index) => (
                    <Accordion key={index} activeIndex={0}>
                      <AccordionTab header={rowData.data.person.fullName}>
                        <Sidecar
                          nodeData={rowData}
                          handleNodeClick={() => {}}
                          activeTabIndex={rowData.activeTabIndex || 0}
                          setActiveTabIndex={(index) => {
                            // Optionally update the selected sidecar's active tab index
                            setSelectedPersons(prev =>
                              prev.map(person =>
                                person.idNode === rowData.idNode ? { ...person, activeTabIndex: index } : person
                              )
                            );
                          }}
                        />
                      </AccordionTab>
                    </Accordion>
                  )}
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

      {/* Render sidecar dialogs as Dialog components */}
      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data?.person?.fullName || 'Details'}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          style={{ width: '35vw', height: '70vh', minWidth: '15vw', minHeight: '15vw' }}
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
          <Sidecar
            nodeData={dialog.nodeData}
            handleNodeClick={() => {}}
            activeTabIndex={dialog.activeTabIndex || 0}
            setActiveTabIndex={(index) => {
              // Update the dialog object's active tab index
              setDialogs(prevDialogs =>
                prevDialogs.map(d =>
                  d.id === dialog.id ? { ...d, activeTabIndex: index } : d
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