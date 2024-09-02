import { useEffect } from 'react'
import { useSigma } from '@react-sigma/core'

const GraphSearch = ({ search }) => {
    const sigma = useSigma();

    useEffect(() => {
        sigma.getGraph().mapNodes((node) => {
                sigma.getGraph().setNodeAttribute(node, 'highlighted', false);
        });

        if(search == null || search === undefined || search === "") return;

        sigma.getGraph().mapNodes((node) => {
            const nodeLabel = sigma.getGraph().getNodeAttribute(node, 'label');
            if(nodeLabel == null) return;
            if(nodeLabel.toLowerCase().includes(search.toLowerCase())) {
                sigma.getGraph().setNodeAttribute(node, 'isSearched', true);
                sigma.getGraph().setNodeAttribute(node, 'highlighted', true);
            }
            else {
                sigma.getGraph().setNodeAttribute(node, 'isSearched', false);
            }
        });
    }, [sigma, search]);

  return;
}

export default GraphSearch;