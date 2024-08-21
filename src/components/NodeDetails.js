import React from 'react';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './NodeDetails.module.css'; // Custom CSS file

const NodeDetails = ({ nodeData}) => {
  return (
    <div className="node-details">
      {nodeData && (
        <div>
          {Object.entries(nodeData.data).map(([key, value]) => (
            <h3 key={key}>
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
            </h3>
          ))}
        </div>
      )}
    
    </div>
  );
};

export default NodeDetails;