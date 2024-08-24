import React from 'react';
import { Image } from 'primereact/image';

const Biography = (nodeData) => (
  <div className="sidecarBody">
    <div className="sidecarTitle">
      <p>Francis Bacon</p>
    </div>
    <div className="biographyContent">
        {nodeData?.data?.image ? <Image src={nodeData.data.image} className='bioImage'/> : null}
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