import React from 'react';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { TabView, TabPanel } from 'primereact/tabview'; // Import TabView and TabPanel components from PrimeReact
import './NodeDetails.module.css'; // Custom CSS file

const NodeDetails = ({ nodeData }) => {
  return (
    <div className="node-details">
      {nodeData && (
        <TabView>
          {Object.entries(nodeData.data).map(([key, value]) => (
            <TabPanel key={key} header={key}>
              <div>
                <strong>{key}:</strong>
                {key === 'image' ? (
                  value ? (
                    <img src={value} alt={nodeData.data.name} style={{ width: '100px', height: '100px' }} />
                  ) : (
                    <i className={`pi pi-image`} style={{ fontSize: '100px' }}></i>
                  )
                ) : (
                  typeof value === 'object' ? JSON.stringify(value) : value
                )}
              </div>
            </TabPanel>
          ))}
        </TabView>
      )}
    </div>
  );
};

export default NodeDetails;