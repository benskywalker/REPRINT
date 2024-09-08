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

    // Helper function to generate random dark colors
    const generateRandomDarkColor = () => {
      const r = Math.floor(Math.random() * 155) + 100; // Range between 100 and 255
      const g = Math.floor(Math.random() * 155) + 100; // Range between 100 and 255
      const b = Math.floor(Math.random() * 155) + 100; // Range between 100 and 255
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Modify the getEdgeColor function to return RGBA for transparency
    const getEdgeColor = (type) => {
      const edgeColors = {
        document: 'rgba(51, 65, 92, 0.6)',  // Dark blue with transparency
        organization: 'rgba(75, 63, 114, 0.6)',  // Dark purple with transparency
        religion: 'rgba(58, 63, 68, 0.6)',  // Dark grey with transparency
        relationship: 'rgba(74, 86, 110, 0.6)',  // Grey-blue with transparency
        default: 'rgba(44, 46, 62, 0.6)',  // A fallback dark blue-grey color with transparency
      };

      return edgeColors[type] || edgeColors.default;
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

        data.nodes.forEach((node) => {
          const newNode = {
            id: node.id,
            label: node.personStdName || node.organizationName || node.religionDesc,
            size: 15, // Slightly larger node size
            color: '#336699', // Professional blue color
            borderColor: '#000000', // Black border for sharper contrast
            borderWidth: 3, // Thicker borders for clarity
            data: node,
            highlighted: false, // Option to highlight nodes on hover later
          };

          if (!nodeIds.has(newNode.id)) {
            nodes.push(newNode);
            nodeIds.add(newNode.id);
          }
        });

        data.edges.forEach((edge) => {
          if (edge.from !== edge.to) {
            const edgeId = `edge-${edge.from}-${edge.to}`;

            if (!edgeIds.has(edgeId)) {
              const newEdge = {
                id: edgeId,
                source: edge.from,
                target: edge.to,
                color: getEdgeColor(edge.type), // Use the updated color palette for edges with transparency
                size: 2.5, // Slightly thicker for visibility
                hidden: false,
                type: 'curvedArrow', // Curved edges for a more organic look
                opacity: 0.85, // Slight transparency for a polished look
                ...edge,
              };

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
            }
          }
        });

        nodes.forEach((node) => {
          node.data.documents = edges.filter((edge) => edge.source === node.id || edge.target === node.id);
        });

        // Filter out nodes that have no connected edges
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
            communityColors[communityId] = generateRandomDarkColor(); // Generate random dark color
          }
          graphologyGraph.setNodeAttribute(node, 'community', communityId);
          graphologyGraph.setNodeAttribute(node, 'color', communityColors[communityId]);
        });

        // Update nodes with community colors
        const updatedNodes = filteredNodes.map((node) => {
          const communityId = graphologyGraph.getNodeAttribute(node.id, 'community');
          return {
            ...node,
            color: communityColors[communityId],
          };
        });

        const calculatedMetrics = computeMetrics(graphologyGraph);
        console.log('Metrics:', calculatedMetrics);

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