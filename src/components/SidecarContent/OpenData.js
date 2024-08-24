const OpenData = (nodeData) => {
    const numberOfTimes = 5;
    const items = Array.from({ length: numberOfTimes }, (v, i) => i);
  
    return (
      <div className='sidecarBody'>
        <div className="sidecarTitle">
        </div>        
        {items.map((item, index) => (
          <a key={index} href="https://www.wikipedia.org/">
            <div className='d-flex justify-content-start'>
              <p>OpenData CONTENT</p>
            </div>
          </a>
        ))}
      </div>
    );
  };
  export default OpenData;