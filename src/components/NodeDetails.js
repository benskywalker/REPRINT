
import React, { useState, useEffect } from 'react';
import 'primeicons/primeicons.css'; // Ensure PrimeIcons are imported
import { TabView, TabPanel } from 'primereact/tabview';
import './NodeDetails.module.css';
import LetterTable from './SidecarContent/LetterTable';
import Relationships from './SidecarContent/Relationships';
import OpenData from './SidecarContent/OpenData';
import Biography from './SidecarContent/Biography';
import Letter from './SidecarContent/Letter'; // Adjust the import path as necessary

const NodeDetails = ({ nodeData, handleNodeClick, activeTabIndex, setActiveTabIndex}) => {
  useEffect(() => {
    console.log(nodeData);
  }, [nodeData]);



const handleRowClick = (rowData) => {
  console.log(rowData);
  const newTabKey = `Letter-${rowData.document.documentID}`;
  setTabs((prevTabs) => {
    const existingTab = prevTabs.find(tab => tab.key === newTabKey);

    if (!existingTab) {
      const newTab = {
        key: newTabKey,
        header: `Letter ${rowData.document.documentID}`,
        content: <Letter id={rowData.document.documentID} className="tab-content-container" />
      };
      const newTabs = [...prevTabs, newTab];
      setActiveIndex(newTabs.length - 1); // Set the new tab as active
      return newTabs;
    } else {
      setActiveIndex(prevTabs.indexOf(existingTab)); // Focus on the existing tab
      return prevTabs;
    }
  });
};
  const [firstRender, setFirstRender] = useState(true);
  const [tabClosed, setTabClosed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tabs, setTabs] = useState([
    { key: "Biography", header: "Biography", content: <Biography nodeData={nodeData} className="tab-content-container"/> },
    { key: "Letters", header: "Letters", content: <LetterTable nodeData={nodeData} onRowClick={handleRowClick}  className="tab-content-container"/> },
    { key: "Relationships", header: "Relationships", content: <Relationships nodeData={nodeData} handleNodeClick={handleNodeClick}  className="tab-content-container" /> },
    { key: "Open Data", header: "Open Data", content: <OpenData nodeData={nodeData} className="tab-content-container" /> }
  ]);
  const handleTabChange = (e) => {
    setActiveIndex(e.index);
    if (setActiveTabIndex) setActiveTabIndex(e.index); // Update parent component's activeTabIndex
  };

  useEffect(() => {
    if (activeTabIndex) setActiveIndex(activeTabIndex);
  }, [activeIndex]);

  const handleTabClose = (key) => {
    setTabs((prevTabs) => {
        const newTabs = prevTabs.filter(tab => tab.key !== key);
        
        // Only update the active index if the closed tab was the active one
        // if (tabs[activeIndex].key === key) {
        //     // Adjust the activeIndex if the active tab was the one closed
        //     if (activeIndex >= newTabs.length) {
        //     }
        // }
            console.log(activeIndex);
            setTabClosed(true);
            return newTabs;
    });
};

useEffect(() => {
  if (firstRender){
    setFirstRender(false);
    return;
  }
  if(tabs.length === 4)
  setActiveIndex(3);
else
setActiveIndex(tabs.length - 1);
  setTabClosed(false);
}
, [tabClosed]);

  return (
    <div className="sidecar">
      {nodeData?.data?.person?.fullName ? (

      <TabView activeIndex={activeIndex ? activeIndex : 0} onTabChange={handleTabChange} scrollable              >
        {tabs.map((tab, index) => (
          <TabPanel
            key={tab.key}
            header={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {tab.header}
                {index >= 4 && ( // Only show close icon for dynamically added tabs
                  <span
                    className="pi pi-times" // PrimeIcons close icon class
                    onClick={() => handleTabClose(tab.key)}
                    style={{
                      marginLeft: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: 'red', // Color of the close icon
                      padding: '0.25rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  />
                )}
              </div>
            }
          >
            {tab.content}
          </TabPanel>
        ))}
      </TabView>
    ) : (
        <p>Hello World</p>
      )}
    </div>
  );
};

export default NodeDetails;