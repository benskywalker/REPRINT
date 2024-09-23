const OpenData = (nodeData) => {
  const { LODLOC, LODVIAF, LODwikiData } = nodeData.nodeData.data;

  const openDataLinks = [
    { label: "LODLOC", url: LODLOC, customName: "link123" },
    { label: "LODVIAF", url: LODVIAF, customName: "link1234" },
    { label: "LODwikiData", url: LODwikiData, customName: "linnkk12222" }
  ].filter(link => link.url !== null);

  return (
    <div className="sidecarBody">
      {openDataLinks.length > 0 ? (
        openDataLinks.map((item, index) => (
          <div key={index} className="d-flex justify-content-start">
            <strong>{item.customName}:</strong>&nbsp;
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.url}
            </a>
          </div>
        ))
      ) : (
        <p>No open data found for {nodeData.nodeData.data.fullName} yet.</p>
      )}
    </div>
  );
};

export default OpenData;
