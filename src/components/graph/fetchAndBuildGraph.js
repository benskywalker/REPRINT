// fetchAndBuildGraph.js

import axios from "axios";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { centrality } from "graphology-metrics";
import modularity from "graphology-communities-louvain";
import { density } from "graphology-metrics/graph";

const colorPalette = {
  nodeDefault: "#FFD700",
  nodeHighlighted: "#FFFFA1",
  edgeDefault: "#718093",
  edgeHighlighted: "#7F8C8D",
  communities: [
    "#FFD700",
    "#8E44AD",
    "#3498DB",
    "#1ABC9C",
    "#E74C3C",
    "#F39C12",
    "#2ECC71",
    "#9B59B6",
    "#E67E22",
    "#16A085",
  ],
};

const fetchAndBuildGraph = async (
  nodesUrl,
  edgesUrl,
  filters,
  edgeTypeFilters,
  body,
  selectedTerms,
  dateRange
) => {
  const nodes = [];
  const edges = [];
  let metrics = null;
  const nodeIds = new Set();
  const edgeIds = new Set();

  const generateRandomSoftColor = () => {
    const colors = colorPalette.communities;
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getEdgeColor = (type) => {
    const edgeColors = {
      document: "#3498DB",
      organization: "#1ABC9C",
      religion: "#8E44AD",
      relationship: "#E74C3C",
      sender: "#F39C12",
      receiver: "#2ECC71",
      mentioned: "#9B59B6",
      author: "#E67E22",
      waypoint: "#16A085",
      Unknown: "#7F8C8D",
    };
    return edgeColors[type] || generateRandomSoftColor();
  };

  try {
    console.log("Fetching nodes and edges...");
    const [nodesResponse, edgesResponse] = await Promise.all([
      axios.post(nodesUrl, body),
      axios.post(edgesUrl, body),
    ]);

    const nodesData = nodesResponse.data;
    const edgesData = edgesResponse.data;

    console.log("nodesData", nodesData, "edgesData", edgesData);

    // Process nodes
    const nodesArray = nodesData;
    nodesArray.forEach((node) => {
      const newNode = {
        id: node.id,
        label:
          node.fullName ||
          node.organizationDesc ||
          node.religionDesc ||
          node.relationDesc ||
          node.documentTitle ||
          "Unknown",
        size: 15,
        color: colorPalette.nodeDefault,
        borderColor: "#95A5A6",
        borderWidth: 2,
        highlighted: false,
        group: node.group, // Make sure 'group' is defined,
        date: node.date,
        ...node,
      };

      if (!nodeIds.has(newNode.id)) {
        nodes.push(newNode);
        nodeIds.add(newNode.id);
      }
    });

    // Process edges
    const edgesArray = edgesData.edges || edgesData;
    edgesArray.forEach((edge) => {
      if (edge.from !== edge.to) {
        const edgeId = `edge-${edge.from}-${edge.to}`;

        if (edgeIds.has(edgeId)) return;

        const newEdge = {
          id: edgeId,
          source: edge.from,
          target: edge.to,
          color: getEdgeColor(edge.type),
          size: 2,
          hidden: false,
          opacity: 0.7,
          date: edge.document?.date,
          label: edge.type || "Unknown", // Ensure label is set
          ...edge,
        };

        // Handle different role types
        switch (edge.roleID) {
          case 1:
            newEdge.label = "Sender";
            newEdge.color = colorPalette.edgeDefault;
            break;
          case 2:
            newEdge.label = "Receiver";
            newEdge.color = colorPalette.edgeDefault;
            break;
          case 3:
            newEdge.label = "Mentioned";
            newEdge.color = colorPalette.edgeDefault;
            break;
          case 4:
            newEdge.label = "Author";
            newEdge.color = colorPalette.edgeDefault;
            break;
          case 5:
            newEdge.label = "Waypoint";
            newEdge.color = colorPalette.edgeDefault;
            break;
          default:
            break;
        }

        edges.push(newEdge);
        edgeIds.add(edgeId);
      }
    });

    // Apply filtering
    const graph = buildGraph(
      nodes,
      edges,
      filters,
      edgeTypeFilters,
      selectedTerms,
      dateRange
    );

    // Compute metrics
    metrics = computeMetrics(graph);

    return { graph, metrics };
  } catch (error) {
    console.error("Error fetching or building graph:", error);
    throw error;
  }
};

const buildGraph = (
  nodes,
  edges,
  filters,
  edgeTypeFilters,
  selectedTerms,
  dateRange
) => {
  const graph = new Graph({ multi: true });

  // Helper function to extract year
  const extractYear = (date) => {
    if (typeof date === "number") {
      return date;
    }

    if (typeof date === "string") {
      const yearMatch = date.match(/^(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1], 10);
        if (!isNaN(year)) {
          return year;
        }
      }
    }

    return undefined;
  };

  // Create a map for quick node lookup by ID
  const nodeMap = new Map();
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
  });

  const terms = Array.isArray(selectedTerms) ? selectedTerms : [];
  const [startDate, endDate] = dateRange;

  // Step 1: Filter nodes based on selected filters, terms, and date range
  const filteredNodesMatchingTerms = nodes.filter((node) => {
    const groupMatch = filters[node.group];
    const termMatch = terms.length === 0 || terms.includes(node.label);

    // Collect all relevant dates
    // Collect all relevant dates
    const relevantDates = [
      extractYear(node.date),
      // extractYear(node.birthDate),
      // extractYear(node.deathDate)
    ];

    // Check if any relevant date is undefined or within the range
    const dateMatch = relevantDates.some(
      (date) =>
        typeof date === "undefined" ||
        (typeof date === "number" && date >= startDate && date <= endDate)
    );

    return groupMatch && termMatch && dateMatch;
  });

  // Extract IDs of nodes that match the selectedTerms
  const matchedNodeIds = new Set(
    filteredNodesMatchingTerms.map((node) => node.id)
  );

  // Step 2: Find immediate connections (neighbors) of the matched nodes
  const immediateConnectedNodeIds = new Set();

  edges.forEach((edge) => {
    if (matchedNodeIds.has(edge.source)) {
      immediateConnectedNodeIds.add(edge.target);
    }
    if (matchedNodeIds.has(edge.target)) {
      immediateConnectedNodeIds.add(edge.source);
    }
  });

  // Step 3: Identify all nodes of type 'document'
  const documentNodes = nodes.filter((node) => node.group === "document");
  const documentNodeIds = new Set(documentNodes.map((node) => node.id));

  // Step 4: Find immediate connections (neighbors) of 'document' nodes
  // **Only include connections to filter nodes**
  const documentConnectedNodeIds = new Set();

  edges.forEach((edge) => {
    if (documentNodeIds.has(edge.source)) {
      const targetNode = nodeMap.get(edge.target);
      if (targetNode && filters[targetNode.group]) {
        documentConnectedNodeIds.add(edge.target);
      }
    }
    if (documentNodeIds.has(edge.target)) {
      const sourceNode = nodeMap.get(edge.source);
      if (sourceNode && filters[sourceNode.group]) {
        documentConnectedNodeIds.add(edge.source);
      }
    }
  });

  // Step 5: Combine all relevant node IDs
  const combinedNodeIds = new Set([
    ...matchedNodeIds,
    ...immediateConnectedNodeIds,
    ...documentNodeIds,
    ...documentConnectedNodeIds,
  ]);

  // Step 6: Filter nodes to include only those in combinedNodeIds and match group filters
  const filteredNodesByGroup = nodes.filter((node) => {
    const groupMatch = filters[node.group];
    const isInCombined = combinedNodeIds.has(node.id);
    return groupMatch && isInCombined;
  });

  const filteredNodeIdsByGroup = new Set(
    filteredNodesByGroup.map((node) => node.id)
  );

  // Step 7: Filter edges based on type and connected nodes
  const filteredEdges = edges.filter(
    (edge) =>
      filteredNodeIdsByGroup.has(edge.source) &&
      filteredNodeIdsByGroup.has(edge.target) &&
      edge.label &&
      edgeTypeFilters[edge.label]
  );

  // Step 8: Collect connected node IDs
  const connectedNodeIds = new Set();
  filteredEdges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  // Step 9: Ensure only connected nodes are included
  const finalFilteredNodes = filteredNodesByGroup.filter((node) =>
    connectedNodeIds.has(node.id)
  );

  // Step 10: Add nodes to the graph
  finalFilteredNodes.forEach((node) => {
    graph.addNode(node.id, {
      ...node,
      data: {
        person: { ...node },
        organization: { ...node },
        religion: { ...node },
        document: { ...node },
      },
    });
  });

  // Step 11: Add edges to the graph
  filteredEdges.forEach((edge) => {
    graph.addEdge(edge.source, edge.target, {
      ...edge,
    });
  });

  return graph;
};

const computeMetrics = (graph) => {
  const metrics = {};

  metrics.totalNodes = graph.order;
  metrics.totalEdges = graph.size;
  metrics.density = density(graph).toFixed(4);

  metrics.degreeCentrality = centrality.degree(graph);
  metrics.betweennessCentrality = centrality.betweenness(graph);
  metrics.closenessCentrality = centrality.closeness(graph);

  const communities = modularity(graph);

  const communityColors = {};
  let colorIndex = 0;
  graph.forEachNode((node, attributes) => {
    const communityId = communities[node];
    if (!communityColors[communityId]) {
      communityColors[communityId] =
        colorPalette.communities[colorIndex % colorPalette.communities.length];
      colorIndex += 1;
    }
    graph.setNodeAttribute(node, "community", communityId);
    graph.setNodeAttribute(node, "color", communityColors[communityId]);
  });

  metrics.modularity = communities;

  return metrics;
};

export default fetchAndBuildGraph;
