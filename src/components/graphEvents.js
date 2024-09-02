import { useEffect } from 'react';
import { useRegisterEvents, useSigma } from '@react-sigma/core';

//component that listens to events
const GraphEvents = ({ onNodeClick }) => {
    const registerEvents = useRegisterEvents();
    const sigma = useSigma();

    useEffect(() => {
        const getLocalNetwork = (node) => {
            sigma.getGraph().mapNodes((node) => {
                sigma.getGraph().setNodeAttribute(node, "hidden", true)
            })

            sigma.getGraph().setNodeAttribute(node, "hidden", false);

            sigma.getGraph().forEachNeighbor(node, (node) => {
                sigma.getGraph().setNodeAttribute(node, "hidden", false);
            });

            sigma.getGraph().forEachEdge((edge) => {
                if(!sigma.getGraph().hasExtremity(edge, node)) {
                    sigma.getGraph().setEdgeAttribute(edge, 'hidden', true);
                }
            });
        }

        const handleNodeClick = (node) => {
            onNodeClick(node);
        }

        //events
        registerEvents({
            enterNode: (event) => 
            {
                sigma.getGraph().setNodeAttribute(event.node, "highlighted", true);
                getLocalNetwork(event.node);
            },
            leaveNode: (event) => 
            {
                sigma.getGraph().setNodeAttribute(event.node, "highlighted", false);
                sigma.getGraph().mapNodes((node) => {
                    sigma.getGraph().setNodeAttribute(node, 'hidden', false);
                })
                sigma.getGraph().mapEdges((edge) => {
                    sigma.getGraph().setEdgeAttribute(edge, 'hidden', false);
                })
            },
            clickNode: (event) => 
            {
                const nodeData = sigma.getGraph().getNodeAttributes(event.node);
                console.log(nodeData);
                handleNodeClick(nodeData);
            },
        })
    }, [registerEvents, sigma, onNodeClick]);

    return null;
};

export default GraphEvents;