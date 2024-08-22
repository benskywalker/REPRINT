import SigmaGraph from "../components/Sigmagraph";
import TimeRangeAdjuster from "../components/TimeRangeAdjuster";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { Splitter, SplitterPanel } from 'primereact/splitter'; // Import Splitter components from PrimeReact
import { Accordion, AccordionTab } from 'primereact/accordion'; // Import Accordion components from PrimeReact
import { Button } from 'primereact/button'; // Import Button component from PrimeReact
import styles from "./Home.module.css";
import NodeDetails from "../components/NodeDetails";

const Home = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNodes, setSelectedNodes] = useState([]); // State for multiple selected nodes
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:4000/sender_receiver");
                const data = await response.json();
                setData(data);
                setFilteredData(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
    
        fetchData();
    }, []);
    
    const handleDataAdjust = (adjustedData) => {
        setFilteredData(adjustedData);
    };
    
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
                    <SplitterPanel size={70} minSize={50}>
                        <SigmaGraph className={styles.sigma} data={filteredData} onNodeClick={handleNodeClick} />
                    </SplitterPanel>
                </Splitter>
                {/* <TimeRangeAdjuster data={data} onDataAdjust={handleDataAdjust} /> */}
                <br />
                <br />
                <br />
            </div>
        </>
    );
}

export default Home;