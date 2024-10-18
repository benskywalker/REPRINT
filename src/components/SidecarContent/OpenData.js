import React from 'react';
import { Button } from 'primereact/button';

const OpenData = (nodeData) => {
  const { LODLOC, LODVIAF, LODwikiData } = nodeData.nodeData.data.person;

  const openDataLinks = [
    { label: "LODLOC", url: LODLOC, customName: "link123" },
    { label: "LODVIAF", url: LODVIAF, customName: "link1234" },
    { label: "LODwikiData", url: LODwikiData, customName: "WikiData" }
  ].filter(link => link.url !== null);

  return (
    <div className="sidecarBody">
      {openDataLinks.length > 0 ? (
        openDataLinks.map((item, index) => (
          <div key={index} className="d-flex justify-content-start">
            <strong>{item.customName}:</strong>&nbsp;
            <Button label={item.customName} onClick={() => window.open(item.url, '_blank')} />
          </div>
        ))
      ) : (
        <p>No open data found for {nodeData.nodeData.data.person.fullName} yet.</p>
      )}
    </div>
  );
};

export default OpenData;