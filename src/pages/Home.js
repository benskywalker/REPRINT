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
        setDialogs((prevDialogs) => [...prevDialogs, { id: index, nodeData }]);
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
        setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes, node]);
    };

    const handleCloseNode = (nodeId) => {
        setSelectedNodes((prevSelectedNodes) => 
            prevSelectedNodes.filter((node, index) => index !== nodeId)
        );
    };

    const renderHeader = (node, index) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{node.label}</span>
            <Button icon="pi pi-arrow-up-right-and-arrow-down-left-from-center" className="p-button-rounded p-button-text" onClick={() => handleOpenClick(index)} />
            <Button icon="pi pi-times" className="p-button-rounded p-button-text" onClick={() => handleCloseNode(index)} />
        </div>
    );

    return (
        <>
            <Header className={styles.header} />
            <div className={styles.content}>
                <Splitter style={{ height: '100vh' }}>
                    <SplitterPanel size={30} minSize={20}>
                    <Accordion activeIndex={0} multiple>
                        {selectedNodes.map((node, index) => (
                            <AccordionTab key={index} header={renderHeader(node, index)}>
                                <div style={{ overflow: 'auto', maxHeight: '100%' }}>
                                    <NodeDetails nodeData={node} />
                                </div>
                            </AccordionTab>
                        ))}
                    </Accordion>
                    </SplitterPanel>
                    <SplitterPanel className={styles.sigmaPanel} size={70} minSize={50}>
                        <SigmaGraph className={styles.sigma} data={filteredData} onNodeClick={handleNodeClick} />
                        {document && <TimeRangeAdjuster document={document} timeRange={timeRange} setTimeRange={setTimeRange} />}
                    </SplitterPanel>
                </Splitter>
            </div>
            {dialogs.map((dialog) => (
            <Dialog key={dialog.id} header="Node Details" modal={false} visible={true} onHide={() => handleCloseDialog(dialog.id)}>
                <NodeDetails nodeData={dialog.nodeData} />
            </Dialog>
        ))}
        </>
    );
}

export default Home;