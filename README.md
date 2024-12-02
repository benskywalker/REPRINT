# Project Overview

This project is a comprehensive data visualization and analysis tool that includes three main components: the Graph, Sidecars, and QueryTool. Each component serves a unique purpose in helping users interact with and analyze complex datasets.

## Table of Contents

1. [Graph](#graph)
2. [Sidecars](#sidecars)
3. [QueryTool](#querytool)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Contributing](#contributing)
7. [License](#license)

### Graph

The **Graph** component is the cornerstone of this application, providing an interactive network visualization of relationships between entities such as people, organizations, documents, and more. Leveraging the Sigma.js library, this component is both highly dynamic and customizable to cater to complex data analysis needs.

#### Features

- **Node and Edge Representation**:
  - Nodes represent entities, which can belong to various groups like people, organizations, documents, and religions.
  - Edges represent relationships or connections between entities, color-coded and labeled for clarity.

- **Interactive Graph Exploration**:
  - **Hover**: Highlight connected nodes and edges for easier navigation.
  - **Click**: Access detailed information about a specific node or edge.
  - **Zoom Controls**: Interactive zooming for better graph inspection.
  - **Dynamic Filtering**: Filter nodes and edges by type, properties, or date ranges.

- **Customizable Layout**:
  - Incorporates ForceAtlas2 for clustering entities based on their relationships.
  - Node positions reset dynamically for a visually organized graph layout.

- **Graph Metrics**:
  - Computes key metrics like degree centrality, betweenness centrality, closeness centrality, modularity, and graph density to provide insights into the network structure.

- **Search and Keyword Suggestions**:
  - Enables quick navigation through node labels and keywords derived from documents.
  - Offers auto-complete suggestions for seamless search.

- **Legend and Color-Coding**:
  - Nodes and edges are color-coded for easy identification of types and relationships.
  - Community detection adds additional color grouping for modularity analysis.

#### How It Works

1. **Data Fetching**:
   - Fetches nodes and edges from specified endpoints (`nodesUrl` and `edgesUrl`) using Axios.
   - Processes the data into a Graphology graph structure for efficient manipulation.

2. **Graph Construction**:
   - Nodes are filtered by user-defined criteria, such as group type, keywords, and date range.
   - Edges are filtered to match connected nodes and selected relationship types.

3. **Metrics Calculation**:
   - Computes centrality measures and community detection to provide analytical insights.
   - Applies community-based coloring to visually cluster nodes.

4. **Rendering**:
   - Converts Graphology's graph structure into a format compatible with Sigma.js.
   - Displays the graph with real-time interactivity and responsiveness.

5. **Filters and User Controls**:
   - Provides UI components to toggle node and edge visibility, apply filters, and adjust date ranges.

#### Key Files and Their Roles

- **[`Sigmagraph.js`](src/components/graph/Sigmagraph.js)**:
  The main component responsible for rendering the graph, managing filters, and handling user interactions.

- **[`fetchAndBuildGraph.js`](src/components/graph/fetchAndBuildGraph.js)**:
  Contains the logic for fetching, filtering, and constructing the graph. Also calculates metrics like centrality and modularity.



- **Graph Dependencies**:
  - **Sigma.js**: Core library for graph rendering.
  - **Graphology**: Used for graph manipulation and metrics computation.
  - **ForceAtlas2**: Provides layout adjustments for better clustering and visualization.

#### Example Usage

After setting up the backend to provide nodes and edges data, the `Sigmagraph.js` component can be integrated as follows:

```jsx
<SigmaGraph
  nodesUrl="http://localhost:4000/nodes"
  edgesUrl="http://localhost:4000/edges"
  edgeFilters={{ sender: true, receiver: true, mentioned: false }}
  body={{ query: "your-query" }}
  onMetricsUpdate={(metrics) => console.log("Graph metrics updated:", metrics)}
  onNodeClick={(node) => console.log("Node clicked:", node)}
  onNodeHover={(node) => console.log("Node hovered:", node)}
  handleNodeunHover={() => console.log("Node unhovered")}
/>

```


The Graph component is responsible for visualizing relationships between various entities such as people, organizations, documents, and more. It uses the Sigma.js library to render interactive network graphs.

### How the graph is built

-**Detailed Explanation of fetchAndBuildGraph.js**
The fetchAndBuildGraph.js file is responsible for fetching data from the backend, processing it, and constructing the graph. It also calculates various metrics for the graph.

Fetching Data
The function starts by fetching nodes and edges data from the provided URLs using axios.post. The data is expected to be in JSON format.

```js
const [nodesResponse, edgesResponse] = await Promise.all([
  axios.post(nodesUrl, body),
  axios.post(edgesUrl, body),
]);
```
Processing Nodes
The nodes are processed to create a standardized format. Each node is assigned attributes such as id, label, size, color, and group.

```js
nodesArray.forEach((node) => {
  const newNode = {
    id: node.id,
    label: node.fullName || node.organizationDesc || node.religionDesc || node.relationDesc || node.documentTitle || "Unknown",
    size: 15,
    color: colorPalette.nodeDefault,
    borderColor: "#95A5A6",
    borderWidth: 2,
    highlighted: false,
    group: node.group,
    date: node.date,
    ...node,
  };

  if (!nodeIds.has(newNode.id)) {
    nodes.push(newNode);
    nodeIds.add(newNode.id);
  }
});
```

Processing Edges
Edges are processed similarly, with attributes such as id, source, target, color, and label.

```js
edgesArray.forEach((edge) => {
  if (edge.from !== edge.to) {
    const edgeId = [edge-${edge.from}-${edge.to}](http://_vscodecontentref_/1);

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
      label: edge.type || "Unknown",
      ...edge,
    };

    // Handle different role types
    switch (edge.roleID) {
      case 1:
        newEdge.label = "Sender";
        break;
      case 2:
        newEdge.label = "Receiver";
        break;
      case 3:
        newEdge.label = "Mentioned";
        break;
      case 4:
        newEdge.label = "Author";
        break;
      case 5:
        newEdge.label = "Waypoint";
        break;
      default:
        break;
    }

    edges.push(newEdge);
    edgeIds.add(edgeId);
  }
});
```

Building the Graph
The buildGraph function constructs the graph using the processed nodes and edges. It applies various filters and terms to include only relevant nodes and edges.

```js
const buildGraph = (nodes, edges, filters, edgeTypeFilters, selectedTerms, dateRange) => {
  const graph = new Graph({ multi: true });

  // Helper function to extract year from various date formats
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

  // Step 1: Filter nodes based on selected filters, terms
  const filteredNodesMatchingTerms = nodes.filter((node) => {
    // Check if any group filters are active
    const isGroupFilterActive = Object.values(filters).some((value) => value);
    const groupMatch = isGroupFilterActive ? filters[node.group] : true;

    // Check if any term filters are active
    const isTermFilterActive = terms.length > 0;
    // Updated termMatch to handle partial and case-insensitive matches
    const termMatch = isTermFilterActive
      ? terms.some(term =>
          node.label.toLowerCase().includes(term.toLowerCase())
        )
      : true;

    // Include the node only if it matches all active filters
    return groupMatch && termMatch;
  });

  // Step 2: Extract IDs of nodes that match the filters
  const matchedNodeIds = new Set(
    filteredNodesMatchingTerms.map((node) => node.id)
  );

  // Step 3: Find immediate connections (neighbors) of the matched nodes
  const immediateConnectedNodeIds = new Set();

  edges.forEach((edge) => {
    if (matchedNodeIds.has(edge.source)) {
      immediateConnectedNodeIds.add(edge.target);
    }
    if (matchedNodeIds.has(edge.target)) {
      immediateConnectedNodeIds.add(edge.source);
    }
  });

  // Step 4: Identify all 'document' nodes that match and their connections
  const documentNodes = filteredNodesMatchingTerms.filter(
    (node) => node.group === "document"
  );
  const documentNodeIds = new Set(documentNodes.map((node) => node.id));

  const documentConnectedNodeIds = new Set();

  edges.forEach((edge) => {
    if (documentNodeIds.has(edge.source)) {
      const targetNode = nodeMap.get(edge.target);
      // Only add target node if it has passed group and term filters
      if (targetNode && filters[targetNode.group] && matchedNodeIds.has(targetNode.id)) {
        documentConnectedNodeIds.add(edge.target);
      }
    }
    if (documentNodeIds.has(edge.target)) {
      const sourceNode = nodeMap.get(edge.source);
      if (sourceNode && filters[sourceNode.group] && matchedNodeIds.has(sourceNode.id)) {
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
        ...(node.personID && { person: { ...node } }),
        ...(node.organizationID && { organization: { ...node } }),
        ...(node.religionID && { religion: { ...node } }),
        ...(node.documentID && { document: { ...node } }),
      },
      color:
        node.group !== "document"
          ? colorPalette.nodeDefault
          : colorPalette.communities[
              Math.floor(Math.random() * colorPalette.communities.length)
            ],
    });
  });

  const getEdgeColor = (type) => {
    const edgeColors = {
      document: "#A0A0A0",      // Medium Gray
      organization: "#808080",  // Gray
      religion: "#696969",      // Dim Gray
      relationship: "#505050",  // Dark Gray
      sender: colorPalette.sender,
      receiver: colorPalette.receiver,
      mentioned: colorPalette.mentioned,
      author: colorPalette.author,
      waypoint: colorPalette.waypoint,
      Unknown: "#B0B0B0",        // Silver
    };
    return edgeColors[type] 
  };

  // Step 11: Add edges to the graph
  filteredEdges.forEach((edge) => {
    graph.addEdge(edge.source, edge.target, {
      ...edge,
      color: getEdgeColor(edge.type),
    });
  });

  // Step 12: Filter out document nodes outside the date range using node.date
  if (startDate !== undefined && endDate !== undefined) {
    const documentNodesToRemove = [];
    graph.forEachNode((nodeId, nodeAttributes) => {
      if (nodeAttributes.group === "document") {
        const nodeDate = nodeAttributes.date;
        const year = extractYear(nodeDate);
        if (year !== undefined) {
          if (year < startDate || year > endDate) {
            documentNodesToRemove.push(nodeId);
          }
        } else {
          // Optionally, remove nodes without a valid date
          documentNodesToRemove.push(nodeId);
        }
      }
    });

    // Remove the nodes after traversal to avoid modifying the graph during iteration
    documentNodesToRemove.forEach((nodeId) => {
      graph.dropNode(nodeId);
    });
  }

  return graph;
};
```

### Features

- **Node and Edge Visualization**: Nodes represent entities, and edges represent relationships between them.
- **Filters**: Users can filter nodes and edges based on various criteria.
- **Metrics**: The graph calculates and displays various metrics such as degree centrality, betweenness centrality, and modularity.
- **Interactive Elements**: Users can click on nodes and edges to view detailed information.

### Key Files

- [`src/components/graph/Sigmagraph.js`](src/components/graph/Sigmagraph.js): Main component for rendering the graph.
- [`src/components/graph/fetchAndBuildGraph.js`](src/components/graph/fetchAndBuildGraph.js): Functions for fetching and building the graph data.
- [`src/components/graph/GraphData.js`](src/components/graph/GraphData.js): Utility functions for processing graph data.



## Sidecars

The Sidecars component provides detailed information about selected nodes in the graph. It displays various types of data related to the selected entity, such as documents, relationships, and mentions.

### Features

- **Dynamic Tabs**: Each tab displays different types of information related to the selected node.
- **Export Options**: Users can export data in PDF, Excel, and Word formats.
- **Session Storage**: Filters and global search values are saved to session storage for persistence.

### Key Files

- [`src/components/sidecar/Sidecar.js`](src/components/sidecar/Sidecar.js): Main component for rendering sidecars.
- [`src/components/sidecar/SidecarContent/LetterTable.js`](src/components/sidecar/SidecarContent/LetterTable.js): Displays documents related to the selected node.
- [`src/components/sidecar/SidecarContent/Relationships.js`](src/components/sidecar/SidecarContent/Relationships.js): Displays relationships related to the selected node.
- [`src/components/sidecar/SidecarContent/Mentions.js`](src/components/sidecar/SidecarContent/Mentions.js): Displays mentions related to the selected node.

## QueryTool

The QueryTool component allows users to perform complex searches on the dataset. Users can specify various parameters and filters to narrow down their search results.

### Features

- **Search Parameters**: Users can add multiple search parameters and specify the order of results.
- **Views**: Different views for searching entities like people, organizations, places, religions, and documents.
- **Graph and Table Views**: Search results can be displayed in a table or as a network graph.
- **History Management**: Keeps track of previous queries and allows users to navigate back to previous states.

### Key Files

- [`src/pages/QueryTool/QueryTool.js`](src/pages/QueryTool/QueryTool.js): Main component for the QueryTool.
- [`src/components/querytool/QueryGraph.js`](src/components/querytool/QueryGraph.js): Component for displaying query results as a graph.
- [`src/components/querytool/QueryGraph.module.css`](src/components/querytool/QueryGraph.module.css): Styles for the QueryGraph component.

## Installation

To install the project, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/your-project.git