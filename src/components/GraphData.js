import axios from 'axios';
import Graph from 'graphology';
import { centrality } from 'graphology-metrics';
import pagerank from 'graphology-pagerank';
import modularity from 'graphology-communities-louvain';

const fetchGraphData = async (url) => {
    const graph = { nodes: [], edges: [] };
    let minDate = 1600;
    let maxDate = 1500;
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

    try {
        const response = await axios.get(url);
        const data = response.data;

        const nodes = [];
        const edges = [];
        const nodeIds = new Set();
        const edgeIds = new Set();

        const edgeColors = {
          document: '#5d94eb',
          organization: '#33FF57',
          religion: '#3357FF',
          relationship: '#FF33A1',
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
          if (edge.from !== edge.to) {
            const edgeId = `edge-${edge.from}-${edge.to}`;

            if (!edgeIds.has(edgeId)) {
              const newEdge = {
                id: edgeId,
                source: edge.from,
                target: edge.to,
                color: edgeColors[edge.type] || '#ccc',
                size: 2,
                hidden: true,
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

        const graphologyGraph = buildGraphologyGraph(filteredNodes, edges);

        // Compute communities using Louvain method
        const communities = modularity(graphologyGraph);

        // Apply community-based coloring
        const communityColors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3'];
        graphologyGraph.forEachNode((node, attributes) => {
          const communityId = communities[node];
          graphologyGraph.setNodeAttribute(node, 'community', communityId);
          graphologyGraph.setNodeAttribute(node, 'color', communityColors[communityId % communityColors.length]);
        });

        // Update nodes with community colors
        const updatedNodes = filteredNodes.map((node) => {
          const communityId = graphologyGraph.getNodeAttribute(node.id, 'community');
          return {
            ...node,
            color: communityColors[communityId % communityColors.length],
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