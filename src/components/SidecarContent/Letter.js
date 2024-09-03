import React, { useState } from 'react';
import { Image } from 'primereact/image';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import './Letter.css'; // Make sure to import the CSS file

const Letter = ({ id }) => {
  const [isClosed, setIsClosed] = useState(false);

  const handleResizeEnd = (e) => {
    if (e.sizes[0] === 0 || e.sizes[1] === 0) {
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
  };

  return (
    <Splitter className='letterSplitter' onResizeEnd={handleResizeEnd}>
      <SplitterPanel className={`flex align-items-center justify-content-center letterSplitterPanel ${isClosed ? 'closed' : ''}`} minSize={0}>
        <p>Letter {id}</p>
      </SplitterPanel>
      <SplitterPanel className={`flex align-items-center dockPanel letterSplitterPanel ${isClosed ? 'closed' : ''}`} style={{ flexDirection: 'column' }} minSize={0}>
        <p>Transcription {id}</p>
      </SplitterPanel>
    </Splitter>
  );
};

export default Letter;