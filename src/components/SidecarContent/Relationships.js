import React, { useState, useEffect} from 'react';

const Relationships = ({nodeData, handleNodeClick}) => {
  //   useEffect(() => {
  //   console.log('OpenData nodeData', nodeData);
  // }, [nodeData]);

    const handleItemClick = () => {
        handleNodeClick(nodeData);
    };
  
    // Hard coded to get a list
    const numberOfTimes = 5;
    const items = Array.from({ length: numberOfTimes }, (v, i) => i);
  

    return nodeData.data.relations ? (
      <div className='sidecarBody'>
      <div className="sidecarTitle">
      </div>    
        <div>
          {items.map((item, index) => (
            <div key={index} className='d-flex justify-content-start'>
              <p key={index} onClick={handleItemClick}>
                RELATIONS
              </p>
            </div>
          ))}
        </div>

    </div>
    ) : (
      <p>No relations is available for {nodeData.data.fullName} yet.</p>
    );

  };

  export default Relationships;