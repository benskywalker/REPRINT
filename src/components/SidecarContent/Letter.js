import React, { useState, useEffect } from 'react';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import './Letter.css'; // Ensure this CSS is used for proper layout

const Letter = ({ name }) => {
  const [isClosed, setIsClosed] = useState(false);
  const [pdfURL, setPdfURL] = useState('');
  const [letterExists, setLetterExists] = useState(false);
  const [transcriptExists, setTranscriptExists] = useState(false);

  useEffect(() => {
    // Fetch the letter (or transcript) by id
    const fetchPDF = async () => {
      try {
        const url = `http://localhost:4000/pdf/${name}`; // Corrected URL path
        console.log('fetching PDF:', url);
        const letterResponse = await fetch(url);
        console.log('letterResponse', letterResponse);
        if (letterResponse.ok) {
          setPdfURL(url);  // No need to hardcode again, just reuse the same url
          setLetterExists(true);
        } else {
          console.error('PDF not found or server returned an error.');
        }
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };

    fetchPDF();
  }, []);  // No need for `[id]` if you're hardcoding the URL


  const handleResizeEnd = (e) => {
    if (e.sizes[0] === 0 || e.sizes[1] === 0) {
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
  };

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
                src={pdfURL}
                width="100%"
                height="100%"
                title={`Letter ${name}`}
              ></iframe>
            </SplitterPanel>
            <SplitterPanel
              className={`flex align-items-center justify-content-center letterSplitterPanel ${isClosed ? 'closed' : ''}`}
              style={{ flexDirection: 'column' }}
              minSize={0}
            >
              <iframe
                src={pdfURL}
                width="100%"
                height="100%"
                title={`Transcription ${name}`}
              ></iframe>
            </SplitterPanel>
          </Splitter>
        ) : (
          <div style={{ height: '100%', width: '100%' }} className="flex align-items-center justify-content-center">
            {letterExists ? (
              <iframe
                src={pdfURL}
                width="100%"
                height="100%"
                style={{ flex: 1 }}
                title={`Letter ${name}`}
              ></iframe>
            ) : (
              transcriptExists && (
                <iframe
                  src={pdfURL}
                  width="100%"
                  height="100%"
                  style={{ flex: 1 }}
                  title={`Transcription ${name}`}
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
