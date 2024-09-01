import { useEffect } from 'react';
import { useRegisterEvents, useSigma } from '@react-sigma/core';

//component that listens to events
const GraphEvents = () => {
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
            },
            clickNode: (event) => 
            {
                console.log(sigma.getGraph().getNodeAttribute(event.node, "label"));
            },
        })
    }, [registerEvents, sigma]);

    return null;
};

export default GraphEvents;