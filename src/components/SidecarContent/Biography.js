import React from 'react';
import { Image } from 'primereact/image';
import Logo from '../images/logo.png'; // Import the logo image

const Biography = (nodeData) => (
  <div>
    <div className="biographyContent">
        {nodeData?.data?.image ? <Image src={nodeData.data.image} className='bioImage'/> :         <Image src={Logo} alt='Logo' />
      }
    </div>
    <p>Detailed biography content goes here... Detailed biography content goes here...Detailed biography content goes here...Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
    <p>Detailed biography content goes here...</p>
  </div>
);

export default Biography;