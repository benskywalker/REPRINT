import axios from 'axios';
import Graph from 'graphology';
import { centrality } from 'graphology-metrics';
import pagerank from 'graphology-pagerank';
import modularity from 'graphology-communities-louvain';

const fetchGraphData = async (url, minDate, maxDate) => {
  const graph = { nodes: [], edges: [] };
  let metrics = null;
  let originalGraph = { nodes: [], edges: [] };

  const buildGraphologyGraph = (nodes, edges) => {
    const graph = new Graph();

    nodes.forEach(node => {
      graph.addNode(node.id, { label: node.label, data: node.data });
    });

    edges.forEach(edge => {
      graph.addEdge(edge.source, edge.target, { data: edge });
    });

    return graph;
  };

  const computeMetrics = (graph) => {
    const metrics = {};

    metrics.degreeCentrality = centrality.degree(graph);
    metrics.betweennessCentrality = centrality.betweenness(graph);
    metrics.closenessCentrality = centrality.closeness(graph);
    metrics.eigenvectorCentrality = centrality.eigenvector(graph);
    metrics.pageRank = pagerank(graph); // Use pagerank from graphology-pagerank
    metrics.modularity = modularity(graph);

    return metrics;
  };

  const generateRandomDarkColor = () => {
    const r = Math.floor(Math.random() * 155) + 100;
    const g = Math.floor(Math.random() * 155) + 100;
    const b = Math.floor(Math.random() * 155) + 100;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getEdgeColor = (type) => {
    const edgeColors = {
      document: 'rgb(113, 139, 255)',    
      organization: 'rgb(166, 0, 255)', 
      religion: 'rgb(2, 78, 255)',     
      relationship: 'rgb(255, 0, 0)',
    };
  
    return edgeColors[type]  
    || generateRandomDarkColor();
  };

  try {
    const body = {
      minDate,
      maxDate,
    };
    const response = await axios.post(url, body);
    const data = response.data;

    if (!data.nodes || !data.edges) {
      throw new Error('Invalid data format: nodes or edges are missing');
    }

    const nodes = [];
    const edges = [];
    const nodeIds = new Set();
    const edgeIds = new Set();

    // Process nodes
    data.nodes.forEach((node) => {
      const newNode = {
        id: node.id,
        label: node.person?.personStdName || node.organization?.organizationDesc || node.religion?.religionDesc,
        size: 15, // Slightly larger node size
        color: '#336699', // Professional blue color
        borderColor: '#000000', // Black border for sharper contrast
        borderWidth: 3, // Thicker borders for clarity
        data: node, // Attach full node data
        highlighted: false, // Option to highlight nodes on hover later
        documents: node.documents, // Attach documents to nodes
        relations: node.relations, // Attach relations to nodes
        mentions: node.mentions, // Attach mentions to nodes
      };

      if (!nodeIds.has(newNode.id)) {
        nodes.push(newNode);
        nodeIds.add(newNode.id);
      }
    });

    // Process edges
data.edges.forEach((edge) => {

  //for testing purposes dont include religeon edges
  // if (edge.type === 'religion' || edge.type === 'organization' ) {
  //   return;
  // }

  if (edge.from !== edge.to) {
    const edgeId = `edge-${edge.from}-${edge.to}`;
    
    if (!edgeIds.has(edgeId)) {
      const newEdge = {
        id: edgeId,
        source: edge.from,
        target: edge.to,
        color: getEdgeColor(edge.type), // Use the updated color palette for edges
        size: 2.5, // Slightly thicker for visibility
        hidden: false,
        type: 'curvedArrow', // Curved edges for a more organic look
        opacity: 0.85, // Slight transparency for a polished look
        date: edge.document?.date, // Add date from document to edge
        roleType: edge.roleID, // Add the role ID to keep track of the role
        ...edge,
      };

      // Custom handling for different role types
      switch (edge.roleID) {
        case 1: // Sender
          newEdge.label = 'Sender';
          newEdge.color = getEdgeColor('sender');
          break;
        case 2: // Receiver
          newEdge.label = 'Receiver';
          newEdge.color = getEdgeColor('receiver');
          break;
        case 3: // Mentioned
          newEdge.label = 'Mentioned';
          newEdge.color = getEdgeColor('mentioned');
          break;
        case 4: // Author
          newEdge.label = 'Author';
          newEdge.color = getEdgeColor('author');
          break;
        case 5: // Waypoint
          newEdge.label = 'Waypoint';
          newEdge.color = getEdgeColor('waypoint');
          break;
        default:
          newEdge.label = 'Unknown';
          break;
      }

      

      // Update the minDate and maxDate based on the document date
      if (newEdge.date) {
        const date = new Date(newEdge.date);
        if (date.getFullYear() < minDate) {
          minDate = date.getFullYear();
        }
        if (date.getFullYear() > maxDate) {
          maxDate = date.getFullYear();
        }
      }

      edges.push(newEdge);
      edgeIds.add(edgeId);
    }else{
      console.log('edge already exists', edge.type);

      
    }
  }
});


    nodes.forEach((node) => {
      node.data.documents = edges.filter((edge) => edge.source === node.id || edge.target === node.id);
    });

    const filteredNodes = nodes.filter(node =>
      edges.some(edge => edge.source === node.id || edge.target === node.id)
    );

    if (filteredNodes.length === 0 || edges.length === 0) {
      throw new Error('No valid nodes or edges found');
    }

    const graphologyGraph = buildGraphologyGraph(filteredNodes, edges);

    // Compute communities using Louvain method
    const communities = modularity(graphologyGraph);

    // Assign random dark colors to communities
    const communityColors = {};
    graphologyGraph.forEachNode((node, attributes) => {
      const communityId = communities[node];
      if (!communityColors[communityId]) {
        communityColors[communityId] = generateRandomDarkColor();
      }
      graphologyGraph.setNodeAttribute(node, 'community', communityId);
      graphologyGraph.setNodeAttribute(node, 'color', communityColors[communityId]);
    });

    const updatedNodes = filteredNodes.map((node) => {
      const communityId = graphologyGraph.getNodeAttribute(node.id, 'community');
      return {
        ...node,
        color: communityColors[communityId],
      };
    });

    const calculatedMetrics = computeMetrics(graphologyGraph);

    graph.nodes = updatedNodes;
    graph.edges = edges;
    originalGraph = { nodes: updatedNodes, edges };
    metrics = calculatedMetrics;

  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return { graph, minDate, maxDate, metrics, originalGraph };
};

export default fetchGraphData;
