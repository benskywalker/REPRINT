import React, { useState, useEffect } from 'react'

import { useSigma } from '@react-sigma/core';

import { SelectButton } from 'primereact/selectbutton';

import { circular, random } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';

import { animateNodes } from 'sigma/utils';

const ApplyLayouts = (layout) => {
    const sigma = useSigma();

    useEffect(() => {
        const sensibleSettings = forceAtlas2.inferSettings(sigma.getGraph());

        const fpos = forceAtlas2(sigma.getGraph(), { iterations: 100, settings: sensibleSettings });
        const cpos = circular(sigma.getGraph());

        const rlayout = () => {
            const positions = random(sigma.getGraph());
            animateNodes(sigma.getGraph(), positions, { duration: 500 });
        }

        switch(layout.layout) {
            case 'ForceAtlas2':
                animateNodes(sigma.getGraph(), fpos, { duration: 500 });
                break;
            case 'Circular':
                animateNodes(sigma.getGraph(), cpos, { duration: 500 });
                break;
            case 'Random':
                rlayout();
                break;
            default:
                break;
        }

    }, [sigma, layout])

    return null;
}

const LayoutController = () => {
    const layouts = ['ForceAtlas2', 'Circular', 'Random'];
    const [layout, setLayout] = useState('Random');
  return (
    <div>
        <SelectButton value={layout} onChange={(e) => setLayout(e.value)} options = {layouts}/>
        <ApplyLayouts layout = {layout}/>
    </div>
  )
}

export default LayoutController