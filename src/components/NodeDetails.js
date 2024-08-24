import React from 'react';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { TabView, TabPanel } from 'primereact/tabview'; // Import TabView and TabPanel components from PrimeReact
import './NodeDetails.module.css'; // Custom CSS file

const NodeDetails = ({ nodeData }) => {
  return (
    <div className="node-details"> 
        <TabView>
            <TabPanel key={"Biography"} header={"Biography"}>
              <div>
                <strong>{"Biography"}:</strong>
              </div>
            </TabPanel>
            <TabPanel key={"Letters"} header={"Letters"}>
              <div>
                <strong>{"Letters"}:</strong>
              </div>
            </TabPanel>
            <TabPanel key={"Relationships"} header={"Relationships"}>
              <div>
                <strong>{"Relationships"}:</strong>
              </div>
            </TabPanel>
            <TabPanel key={"Open Data"} header={"Open Data"}>
              <div>
                <strong>{"Open Data"}:</strong>
              </div>
            </TabPanel>
        </TabView>
      
    </div>
  );
};

export default NodeDetails;