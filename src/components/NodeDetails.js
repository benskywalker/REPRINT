import React, { useState } from 'react';
import 'primeicons/primeicons.css'; // Ensure PrimeIcons are imported
import { TabView, TabPanel } from 'primereact/tabview';
import './NodeDetails.module.css';
import LetterTable from './SidecarContent/LetterTable';
import Relationships from './SidecarContent/Relationships';
import OpenData from './SidecarContent/OpenData';
import Biography from './SidecarContent/Biography';

const NodeDetails = ({ nodeData, handleNodeClick }) => {

  const handleRowClick = (rowData) => {
    const newTabKey = `Letter-${rowData.id}`;
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find(tab => tab.key === newTabKey);

      if (!existingTab) {
        const newTab = {
          key: newTabKey,
          header: `Letter ${rowData.id}`,
          content: <div>{JSON.stringify(rowData)}</div>
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

  const [activeIndex, setActiveIndex] = useState(0);
  const [tabs, setTabs] = useState([
    { key: "Biography", header: "Biography", content: <Biography nodeData={nodeData} className="tab-content-container"/> },
    { key: "Letters", header: "Letters", content: <LetterTable nodeData={nodeData} onRowClick={handleRowClick}  className="tab-content-container"/> },
    { key: "Relationships", header: "Relationships", content: <Relationships nodeData={nodeData} handleNodeClick={handleNodeClick}  className="tab-content-container" /> },
    { key: "Open Data", header: "Open Data", content: <OpenData nodeData={nodeData} /> }
  ]);

  const handleTabClose = (key) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter(tab => tab.key !== key);
      if (activeIndex >= newTabs.length) {
        setActiveIndex(newTabs.length - 1);
      }
      return newTabs;
    });
  };

  return (
    <div className={"sidecar"}>
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} scrollable>
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
    </div>
  );
};

export default NodeDetails;
