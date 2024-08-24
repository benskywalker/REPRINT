import React from 'react';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { TabView, TabPanel } from 'primereact/tabview'; // Import TabView and TabPanel components from PrimeReact
import './NodeDetails.module.css'; // Custom CSS file
import LettersTable from './SidecarContent/LetterTable';
import Relationships from './SidecarContent/Relationships';
import OpenData from './SidecarContent/OpenData';
import Biography from './SidecarContent/Biography';

const NodeDetails = ({ nodeData , handleNodeClick}) => {
  return (
    <div className="node-details"> 
        <TabView>
            <TabPanel key={"Biography"} header={"Biography"}>
              <div>
                <Biography nodeData={nodeData}/>
              </div>
            </TabPanel>
            <TabPanel key={"Letters"} header={"Letters"}>
              <div>
                <LettersTable nodeData={nodeData} />
              </div>
            </TabPanel>
            <TabPanel key={"Relationships"} header={"Relationships"}>
              <div>
                <Relationships nodeData={nodeData} handleNodeClick={handleNodeClick}/>
              </div>
            </TabPanel>
            <TabPanel key={"Open Data"} header={"Open Data"}>
              <div>
                <OpenData nodeData={nodeData} />
              </div>
            </TabPanel>
        </TabView>
      
    </div>
  );
};

export default NodeDetails;