import React, { useState } from 'react';
import 'primeicons/primeicons.css';
import { TabView, TabPanel } from 'primereact/tabview';
import './NodeDetails.module.css';
import LetterTable from './SidecarContent/LetterTable';
import Relationships from './SidecarContent/Relationships';
import OpenData from './SidecarContent/OpenData';
import Biography from './SidecarContent/Biography';

const NodeDetails = ({ nodeData, handleNodeClick }) => {
  const handleRowClick = (rowData) => {
    const newTab = { key: `Letter-${rowData.id}`, header: `Letter ${rowData.id}`, content: <div>{JSON.stringify(rowData)}</div> };
    setTabs([...tabs, newTab]);
    setActiveIndex(tabs.length); // Set the new tab as active
  };

    const [activeIndex, setActiveIndex] = useState(0);
    const [tabs, setTabs] = useState([
      { key: "Biography", header: "Biography", content: <Biography nodeData={nodeData} /> },
      { key: "Letters", header: "Letters", content: <LetterTable nodeData={nodeData} onRowClick={handleRowClick} /> },
      { key: "Relationships", header: "Relationships", content: <Relationships nodeData={nodeData} handleNodeClick={handleNodeClick} /> },
      { key: "Open Data", header: "Open Data", content: <OpenData nodeData={nodeData} /> }
  ]);

    return (
        <div className={"sidecar"}>
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} scrollable>
                {tabs.map(tab => (
                    <TabPanel key={tab.key} header={tab.header}>
                        {tab.content}
                    </TabPanel>
                ))}
            </TabView>
        </div>
    );
};

export default NodeDetails;