import SigmaGraph from "../components/Sigmagraph";
import TimeRangeAdjuster from "../components/TimeRangeAdjuster";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { Splitter, SplitterPanel } from 'primereact/splitter'; // Import Splitter components from PrimeReact
import { Accordion, AccordionTab } from 'primereact/accordion'; // Import Accordion components from PrimeReact
import { Button } from 'primereact/button'; // Import Button component from PrimeReact
import styles from "./Home.module.css";
import NodeDetails from "../components/NodeDetails";
import { Dialog } from 'primereact/dialog'; // Import Dialog component from PrimeReact
import { v4 as uuidv4 } from 'uuid'; // Import uuid function
import { DataTable } from 'primereact/datatable'; // Import DataTable and Column components from PrimeReact
import { Column } from 'primereact/column'; // Import Column component from PrimeReact
import { DisplayGraph } from "../components/graph";

const Home = ({ searchQuery }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [document, setDocument] = useState(null);
    const [timeRange, setTimeRange] = useState([0, 100]);
    const [dialogs, setDialogs] = useState([]);
    const [hoveredNodeData, setHoveredNodeData] = useState(null);

    const handleOpenClick = (rowData) => {
        const id = uuidv4();
        setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData: rowData }]);
    };
    
    const handleCloseDialog = (id) => {
        setDialogs((prevDialogs) => prevDialogs.filter(dialog => dialog.id !== id));
    };
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:4000/sender_receiver");
                const data = await response.json();
                setData(data);
                setFilteredData(data);
                setLoading(false);
                setDocument({ date: { start: "2023-01-01", end: "2023-12-31" } });
            } catch (error) {
                console.error("Error fetching data: ", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (document && document.data) {
            const filtered = document.data.filter(item => {
                const itemDate = new Date(item.date).getTime();
                return itemDate >= timeRange[0] && itemDate <= timeRange[1];
            });
            setFilteredData(filtered);
        }
    }, [timeRange, document]);

    const handleNodeHover = (nodeData) => {
        setHoveredNodeData(nodeData);
    };

    const handleNodeClick = (node) => {
        console.log(node);
        setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes, node]);
    };

    const handleCloseNode = (rowIndex) => {
        setSelectedNodes((prevSelectedNodes) => 
            prevSelectedNodes.filter((_, index) => index !== rowIndex)
        );
    };

    const onRowReorder = (event) => {
        setSelectedNodes(event.value); // Update the state with new row order
    };

    const renderHeader = (node, index) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{node.data.fullName}</span>
            <Button icon="pi pi-external-link" className="p-button-rounded p-button-text" onClick={() => handleOpenClick(node)} />
            <Button icon="pi pi-times" className="p-button-rounded p-button-text" onClick={() => handleCloseNode(index)} />
        </div>
    );

    const renderAccordion = (rowData) => (
        <Accordion>
            <AccordionTab header={renderHeader(rowData, selectedNodes.indexOf(rowData))}>
                <div style={{ overflow: 'auto', maxHeight: '100%' }}>
                    <NodeDetails nodeData={rowData} handleNodeClick={handleNodeClick} />
                </div>
            </AccordionTab>
        </Accordion>
    );

    return (
        <>
            <div className={styles.content}>
                <Splitter style={{ overflowY: 'auto' }}>
                    <SplitterPanel size={30} minSize={0}>
                        <div className={styles.relativeContainer}>
                            {hoveredNodeData ? (
                                <div className={styles.hoverNodeInfo}>
                                    <span>{hoveredNodeData.data.fullName}</span>
                                </div>
                            ) : (
                                <div className={styles.dataTableContainer}>
                                    <DataTable 
                                        value={selectedNodes}
                                        reorderableRows
                                        onRowReorder={onRowReorder}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <Column
                                            body={rowData => renderAccordion(rowData)}
                                            header="Details"
                                        />
                                    </DataTable>
                                </div>
                            )}
                        </div>
                    </SplitterPanel>
                    <SplitterPanel className={styles.sigmaPanel} size={70} minSize={0}>
                        <DisplayGraph onNodeClick = {handleNodeClick}/>
                    </SplitterPanel>
                </Splitter>
            </div>
            {dialogs.map((dialog) => (
                <Dialog 
                    key={dialog.id} 
                    header={dialog.nodeData.data.fullName} 
                    maximizable 
                    modal={false} 
                    visible={true} 
                    onHide={() => handleCloseDialog(dialog.id)}
                >
                    <NodeDetails nodeData={dialog.nodeData} handleNodeClick={handleNodeClick}/>
                </Dialog>
            ))}
        </>
    );
}

export default Home;