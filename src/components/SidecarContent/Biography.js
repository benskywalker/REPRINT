import React, { useEffect } from 'react';
import { Image } from 'primereact/image';
import Logo from '../images/logo.png'; // Import the logo image

const Biography = ({ nodeData }) => {
  // useEffect(() => {
  //   console.log('Biography nodeData', nodeData);
  // }, [nodeData]);

  return nodeData.data.biography ? (
    <div>
      <p>{nodeData.data.biography}</p>
    </div>
  ) : (
    <p>No biography is available for {nodeData.data.fullName} yet.</p>
  );
};

export default Biography;