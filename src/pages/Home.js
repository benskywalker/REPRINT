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


const Home = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNodes, setSelectedNodes] = useState([]); // State for multiple selected nodes
    const [document, setDocument] = useState(null); // State for document
    const [timeRange, setTimeRange] = useState([0, 100]); // State for time range
    const [dialogs, setDialogs] = useState([]);

    

    const handleOpenClick = (index) => {
        const nodeData = selectedNodes[index];
        const id = uuidv4(); // Generate a unique ID
        setDialogs((prevDialogs) => [...prevDialogs, { id, nodeData }]);
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
                // Assuming the document data is part of the response
                setDocument({ date: { start: "2023-01-01", end: "2023-12-31" } }); // Example document date
            } catch (error) {
                console.error("Error fetching data: ", error);
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

    const handleNodeClick = (node) => {
        // console.log(node.data.documents);
        setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes, node]);
    };

    const handleCloseNode = (nodeId) => {
        setSelectedNodes((prevSelectedNodes) => 
            prevSelectedNodes.filter((node, index) => index !== nodeId)
        );
    };

    const renderHeader = (node, index) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{node.data.fullName}</span>
            <Button icon="pi pi-external-link" className="p-button-rounded p-button-text" onClick={() => handleOpenClick(index)} />
            <Button icon="pi pi-times" className="p-button-rounded p-button-text" onClick={() => handleCloseNode(index)} />
        </div>
    );

    return (
        <>
            <Header className={styles.header} />
            <div className={styles.content}>
                <Splitter style={{ height: '100vh', overflowY:'auto' }}>
                    <SplitterPanel size={30} minSize={10} >
                    <Accordion activeIndex={0} multiple>
                        {selectedNodes.map((node, index) => (
                            <AccordionTab key={index} header={renderHeader(node, index)}>
                                <div style={{ overflow: 'auto', maxHeight: '100%' }}>
                                    <NodeDetails nodeData={node} handleNodeClick={handleNodeClick}/>
                                </div>
                            </AccordionTab>
                        ))}
                    </Accordion>
                    </SplitterPanel>
                    <SplitterPanel className={styles.sigmaPanel} size={70} minSize={50}>
                        <SigmaGraph className={styles.sigma} data={filteredData} onNodeClick={handleNodeClick} />
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
            style={{ height: '45vh', width: '55vh' }}
        >
            <NodeDetails nodeData={dialog.nodeData} handleNodeClick={handleNodeClick}/>
        </Dialog>
        ))}
        </>
    );
}

export default Home;