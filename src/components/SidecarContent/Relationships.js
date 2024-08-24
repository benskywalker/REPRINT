import React, { useState} from 'react';

const Relationships = ({nodeData, handleNodeClick}) => {
  
    const handleItemClick = () => {
        handleNodeClick(nodeData);
    };
  
    // Hard coded to get a list
    const numberOfTimes = 5;
    const items = Array.from({ length: numberOfTimes }, (v, i) => i);
  
    return (
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
    );
  };

  export default Relationships;