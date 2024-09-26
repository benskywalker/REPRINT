import React, { useState } from 'react';
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
  const letterExists = true;  
  const transcriptExists = false;
  return (
    <div className='letterSplitter'>
      {letterExists || transcriptExists ? (
        letterExists && transcriptExists ? (
          <Splitter className='letterSplitter' onResizeEnd={handleResizeEnd}>
            <SplitterPanel
              className={`flex align-items-center justify-content-center letterSplitterPanel ${isClosed ? 'closed' : ''}`}
              minSize={0}
            >
              <iframe
                src={`https://business.ucf.edu/wp-content/uploads/sites/4/2018/09/UCF-CAMPUS-MAP.pdf`}
                width="100%"
                height="100%"
                title={`Letter ${id}`}
              ></iframe>
            </SplitterPanel>
            <SplitterPanel
              className={`flex align-items-center justify-content-center letterSplitterPanel ${isClosed ? 'closed' : ''}`}
              style={{ flexDirection: 'column' }}
              minSize={0}
            >
              <iframe
                src={`https://business.ucf.edu/wp-content/uploads/sites/4/2018/09/UCF-CAMPUS-MAP.pdf`}
                width="100%"
                height="100%"
                title={`Transcription ${id}`}
              ></iframe>
            </SplitterPanel>
          </Splitter>
        ) : (
          // Only one of the iframes will be shown if either exists
          <div style={{ height: '100%', width: '100%' }} className={`flex align-items-center justify-content-center`}>
          {letterExists ? (
            <iframe
              src={`https://business.ucf.edu/wp-content/uploads/sites/4/2018/09/UCF-CAMPUS-MAP.pdf`}
              width="100%"
              height="100%"
              style={{ flex: 1 }} // Ensures it takes all available space
              title={`Letter ${id}`}
            ></iframe>
          ) : (
            transcriptExists && (
              <iframe
                src={`https://business.ucf.edu/wp-content/uploads/sites/4/2018/09/UCF-CAMPUS-MAP.pdf`}
                width="100%"
                height="100%"
                style={{ flex: 1 }} // Ensures it takes all available space
                title={`Transcription ${id}`}
              ></iframe>
            )
          )}
        </div>
        )
      ) : (
        <p>No letters available.</p>
      )}
    </div>
  );
};

export default Letter;