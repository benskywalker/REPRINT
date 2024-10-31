import React, { useRef, useCallback, useEffect } from 'react';
import { Sigma, RandomizeNodePositions, RelativeSize, ForceAtlas2 } from 'react-sigma';
import styles from './Sigmagraph.module.css';

const SigmaGraph = ({ onNodeClick, onNodeHover, graph = { nodes: [], edges: [] }, handleNodeunHover, showEdges }) => {
  const sigmaRef = useRef(null);
  const showEdgesRef = useRef(showEdges);

  useEffect(() => {
    showEdgesRef.current = showEdges;
  }, [showEdges]);

  useEffect(() => {
    if (!sigmaRef.current) {
      console.error('Sigma instance not found');
      return;
    }
    // If the graph is empty, return
    if (!graph?.nodes?.length) {
      return;
    }


    // Handle showEdges change
    const sigmaInstance = sigmaRef.current.sigma;
    const graphInstance = sigmaInstance.graph;

    if (showEdges) {
      graphInstance.edges().forEach(edge => {
        graphInstance.edges(edge.id).hidden = false;
      });
    } else {
      graphInstance.edges().forEach(edge => {
        graphInstance.edges(edge.id).hidden = true;
      });
    }

    sigmaInstance.refresh();
  }, [graph, showEdges]);

  const handleNodeClick = useCallback(
    event => {
      const nodeId = event.data.node.id;
      const nodeData = graph.nodes.find(node => node.id === nodeId);
      onNodeClick(nodeData);
      
    },
    [graph, onNodeClick]
  );

  const handleNodeHover = useCallback(
    event => {
      const sigmaInstance = sigmaRef.current.sigma;
      const graphInstance = sigmaInstance.graph;

      const edges = graphInstance
        .edges()
        .filter(
          edge => edge.source === event.data.node.id || edge.target === event.data.node.id
        );

      // Show all edges connected to the node
      edges.forEach(edge => {
        graphInstance.edges(edge.id).hidden = false;
      });
      // Hide all edges not connected to the node
      graphInstance.edges().forEach(edge => {
        if (edge.source !== event.data.node.id && edge.target !== event.data.node.id) {
          graphInstance.edges(edge.id).hidden = true;
        }
      });
      onNodeHover(event.data.node);
      sigmaInstance.refresh();
    },
    [onNodeHover]
  );

  const handleNodeOut = useCallback(
    event => {
      const sigmaInstance = sigmaRef.current.sigma;
      const graphInstance = sigmaInstance.graph;


      if (showEdgesRef.current) {
        // Show all edges
        graphInstance.edges().forEach(edge => {
          graphInstance.edges(edge.id).hidden = false;
        });
      } else {
        // Hide all edges
        graphInstance.edges().forEach(edge => {
          graphInstance.edges(edge.id).hidden = true;
        });
      }

      handleNodeunHover();
      sigmaInstance.refresh();
    },
    [handleNodeunHover]
  );

  return (
    <div className={styles.content}>
      <Sigma
        key={JSON.stringify(graph)} // Use key prop to force re-render on graph change
        graph={graph} // Use graph prop directly here
        style={{ width: '100%', height: 'calc(92vh - 60px)' }}
        onClickNode={handleNodeClick}
        onOverNode={handleNodeHover}
        onOutNode={handleNodeOut}
        ref={sigmaRef}
      >
        <RandomizeNodePositions />
        <RelativeSize initialSize={1} />
        <ForceAtlas2
          barnesHutOptimize={true}
          barnesHutTheta={0.5}
          linLogMode={false}
          outboundAttractionDistribution={false}
          adjustSizes={false}
          edgeWeightInfluence={0}
          scalingRatio={3}
          strongGravityMode={false}
          gravity={0.01}
          slowDown={5}
          startingIterations={1}
          worker={true}
        />
      </Sigma>
    </div>
  );
};

export default SigmaGraph;