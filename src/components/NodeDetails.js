import React from 'react';
// import 'primereact/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';
import { TabView, TabPanel } from 'primereact/tabview';
import './NodeDetails.module.css'; // Import CSS module
import LettersTable from './SidecarContent/LetterTable';
import Relationships from './SidecarContent/Relationships';
import OpenData from './SidecarContent/OpenData';
import Biography from './SidecarContent/Biography';

const NodeDetails = ({ nodeData, handleNodeClick }) => {
  return (
    <div className={"sidecar"}>
      <TabView>
        <TabPanel key={"Biography"} header={"Biography"}>
            <Biography nodeData={nodeData} />
        </TabPanel>
        <TabPanel key={"Letters"} header={"Letters"}>
            <LettersTable nodeData={nodeData} />
        </TabPanel>
        <TabPanel key={"Relationships"} header={"Relationships"}>
            <Relationships nodeData={nodeData} handleNodeClick={handleNodeClick} />
        </TabPanel>
        <TabPanel key={"Open Data"} header={"Open Data"}>
            <OpenData nodeData={nodeData} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default NodeDetails;