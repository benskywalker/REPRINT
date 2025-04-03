import SigmaGraph from "../../components/graph/Sigmagraph";
import { useState } from "react";
import styles from "./QueryGraph.module.css";
import Sidecar from "../../components/sidecar/Sidecar";
import { Dialog } from "primereact/dialog";
import { v4 as uuidv4 } from "uuid";

const QueryGraph = ({ nodesUrl, edgesUrl, body, edgeFilters }) => {
  const [dialogs, setDialogs] = useState([]);
  const [hoveredNodeData, setHoveredNodeData] = useState(null);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [showEdges, setShowEdges] = useState(true);

  console.log("nodesUrl", nodesUrl);
  console.log("edgesUrl", edgesUrl);
  console.log("body", body);



  const handleOpenClick = (rowData) => {
    const id = uuidv4();
    setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData: rowData }]);
  };

  const handleCloseDialog = (id) => {
    setDialogs((prevDialogs) =>
      prevDialogs.filter((dialog) => dialog.id !== id)
    );
  };

  const handleGraphUpdate = (graph) => {
    setGraph(graph || { nodes: [], edges: [] });
  };

  const handleNodeHover = (nodeData) => {
    setHoveredNodeData(nodeData);
  };

  const handleNodeOut = () => {
    setHoveredNodeData(null);
  };









  return (
    <>
      <div className={styles.content}>

        <SigmaGraph
          onNodeHover={handleNodeHover}
          onNodeClick={handleOpenClick}
          handleNodeunHover={handleNodeOut}
          handleGraphUpdate={handleGraphUpdate}
          nodesUrl={nodesUrl}
          edgesUrl={edgesUrl}
          body={body}
          edgeFilters={
            edgeFilters
          }
        />

      </div>

      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          header={
            dialog.nodeData.data?.person?.fullName || dialog?.nodeData?.label
          }
          maximizable
          modal={false}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          style={{
            width: "35vw",
            height: "70vh",
            minWidth: "15vw",
            minHeight: "15vw",
          }}
          breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        >
          <Sidecar
            nodeData={dialog.nodeData}
            handleNodeClick={handleOpenClick}
            activeTabIndex={dialog.activeTabIndex}
            setActiveTabIndex={(index) => {
              const updatedDialogs = dialogs.map((dlg) =>
                dlg.id === dialog.id ? { ...dlg, activeTabIndex: index } : dlg
              );
              setDialogs(updatedDialogs);
            }}
          />
        </Dialog>
      ))}
    </>
  );
};

export default QueryGraph;
