import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sigma, RandomizeNodePositions, RelativeSize, ForceAtlas2 } from 'react-sigma';
import ClipLoader from 'react-spinners/ClipLoader';
import NodeDialog from './NodeDialog'; // Assuming you have a NodeDialog component
import { Checkbox } from 'primereact/checkbox'; // Import Checkbox from PrimeReact
import { Accordion, AccordionTab } from 'primereact/accordion'; // Import Accordion components from PrimeReact
import styles from './Sigmagraph.module.css';

const SigmaGraph = ({ onNodeClick, data }) => {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDialogVisible, setNodeDialogVisible] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [forceAtlasActive, setForceAtlasActive] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState([]); // State for selected filters
  const sigmaRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/relations');
        const data = response.data;
        console.log(data);
        const nodes = [];
        const edges = [];
        const nodeIds = new Set();

        // Define color mapping for edge types
        const edgeColors = {
          document: '#FF5733', // Example color for document edges
          organization: '#33FF57', // Example color for organization edges
          religion: '#3357FF', // Example color for religion edges
          relationship: '#FF33A1', // Example color for relationship edges
        };

        data.nodes.forEach((node) => {
          const newNode = {
            id: node.id,
            label: node.personStdName || node.organizationName || node.religionDesc,
            size: 3,
            color: '#fffff0',
            data: node,
          };

          if (!nodeIds.has(newNode.id)) {
            nodes.push(newNode);
            nodeIds.add(newNode.id);
          }
        });

        data.edges.forEach((edge) => {
          const newEdge = {
            id: `edge-${edge.from}-${edge.to}`,
            source: edge.from,
            target: edge.to,
            color: edgeColors[edge.type] || '#ccc', // Use color mapping
            size: 2,
            data: edge,
          };

          edges.push(newEdge);
        });

        setGraph({ nodes, edges });
        setOriginalGraph({ nodes, edges });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNodeClick = (event) => {
    const nodeId = event.data.node.id;
    console.log('Node clicked:', nodeId);
    const nodeData = graph.nodes.find((node) => node.id === nodeId);
    setSelectedNode(nodeData);
    setNodeDialogVisible(true);
    onNodeClick(nodeData); // Pass the node data to the parent component
  };

  const handleNodeHover = (event) => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    const nodeId = event.data.node.id;

    // Directly access and modify the hovered node's attributes
    // graphInstance.nodes(nodeId).color = '#ffffff';
    // graphInstance.nodes(nodeId).size = 150;

    // Access and modify connected edges
    graphInstance.edges().forEach((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        // if the edge is connected to the hovered node
        // color the edge blue and increase its size
        graphInstance.edges(edge.id).color = '#00f';
        graphInstance.edges(edge.id).size = 3;
      } else {
        graphInstance.edges(edge.id).color = '#ccc';
        graphInstance.edges(edge.id).size = 2;
      }
    });

    sigmaInstance.refresh(); // Refresh the graph to apply changes
  };

  const handleNodeOut = () => {
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    // Restore original colors of nodes
    originalGraph.nodes.forEach((node) => {
      graphInstance.nodes(node.id).color = node.color;
    });

    // Restore original colors of edges
    originalGraph.edges.forEach((edge) => {
      graphInstance.edges(edge.id).color = edge.color;
      graphInstance.edges(edge.id).size = edge.size;
    });

    sigmaInstance.refresh(); // Refresh the graph to apply changes
  };

  const handleRelatedDocumentsClick = () => {
    if (selectedNode) {
      setDialogLoading(true);

      const relatedEdges = graph.edges.filter(
        (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id
      );

      const uniqueDocuments = Array.from(
        new Set(relatedEdges.map((edge) => edge.data.document))
      ).map((doc) => ({
        id: doc.id,
        title: doc.title,
        abstract: doc.abstract,
        collection: doc.collection,
        customCitation: doc.customCitation,
        date: doc.date,
        dateAdded: doc.dateAdded,
        docTypeID: doc.docTypeID,
        documentLanguageID: doc.documentLanguageID,
        folder: doc.folder,
        importID: doc.importID,
        isJulian: doc.isJulian,
        letterDate: doc.letterDate,
        page: doc.page,
        pdfURL: doc.pdfURL,
        repositoryID: doc.repositoryID,
        researchNotes: doc.researchNotes,
        status: doc.status,
        transcription: doc.transcription,
        translation: doc.translation,
        virtual_doc: doc.virtual_doc,
        volume: doc.volume,
        whoCheckedOut: doc.whoCheckedOut,
      }));

      setRelatedDocuments(uniqueDocuments);
      setDialogLoading(false);
    }
  };

  const filterOptions = [
    { label: 'Document', value: 'document', type: 'Relations' },
    { label: 'Religion', value: 'religion', type: 'Relations' },
    { label: 'Organization', value: 'organization', type: 'Relations' },
    { label: 'Person', value: 'person', type: 'Relations' },
  ];

  const groupedOptions = filterOptions.reduce((acc, option) => {
    if (!acc[option.type]) {
      acc[option.type] = [];
    }
    acc[option.type].push(option);
    return acc;
  }, {});

  const handleFilterChange = (e) => {
    const selectedValue = e.value;
    console.log('Checkbox clicked:', selectedValue); // Log the selected value

    let updatedFilters = [...selectedFilters];

    if (updatedFilters.includes(selectedValue)) {
      updatedFilters = updatedFilters.filter((filter) => filter !== selectedValue);
    } else {
      updatedFilters.push(selectedValue);
    }

    setSelectedFilters(updatedFilters);
  };

  useEffect(() => {
    if (selectedFilters.length === 0) {
      setGraph(originalGraph);
    } else {
      const filteredNodes = originalGraph.nodes.filter((node) =>
        selectedFilters.includes(node.data.nodeType)
      );
      const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
      const filteredEdges = originalGraph.edges.filter(
        (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
      );
      setGraph({ nodes: filteredNodes, edges: filteredEdges });
    }
  }, [selectedFilters, originalGraph]);

  return (
    <div className={styles.content}>
      {loading ? (
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      ) : (
        <>
          <Sigma
            key={JSON.stringify(graph)}
            graph={graph}
            style={{ width: '100%', height: '100vh' }}
            onClickNode={handleNodeClick}
            onOverNode={handleNodeHover}
            onOutNode={handleNodeOut}
            ref={sigmaRef}
          >
            <RandomizeNodePositions />
            <RelativeSize initialSize={15} />
            {forceAtlasActive ? (
              <ForceAtlas2
                iterationsPerRender={1}
                timeout={3000}
                barnesHutOptimize={false}
                gravity={1}
                scalingRatio={2}
              />
            ) : (
              <></>
            )}
          </Sigma>
          <br />
          <br />
          <br />
          <br />
        </>
      )}
      
      <div className={styles.filterBox}>
        <Accordion activeIndex={0}>
          {Object.keys(groupedOptions).map((type) => (
            <AccordionTab key={type} header={type}>
              {groupedOptions[type].map((option) => (
                <div key={option.value} className={styles.checkbox}>
                  <Checkbox
                    inputId={option.value}
                    value={option.value}
                    checked={selectedFilters.includes(option.value)}
                    onChange={(e) => {
                      console.log('Checkbox clicked:', e.value);
                      handleFilterChange(e);
                    }}
                  />
                  <label htmlFor={option.value} className={styles.checkboxLabel}>{option.label}</label>
                </div>
              ))}
            </AccordionTab>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default SigmaGraph;