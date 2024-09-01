import React, { useEffect, useState } from 'react';
import { ListBox } from 'primereact/listbox';
import { useSigma } from '@react-sigma/core';
import './graphFilter.module.css';


const filters = [
  {
    label: 'Family',
    items: [
      { label: 'Pemberton', value: 'Pemberton'},
      { label: 'Haydock', value: 'Haydock'},
    ]
  },
  {
    label: 'Relations',
    items: [
      { label: 'Document', value: 'document'},
      { label: 'Organization', value: 'organization'},
      { label: 'Religion', value: 'religion'},
      { label: 'Familial', value: 'familial'},
    ]
  }
]


const FilterTemplate = (option) => {
  return (
    <div className='flex align-items-center'>
      <label> {option.name}</label>
    </div>
  )
}

const ApplyFilters = (filters) => {
  const sigma = useSigma();
  
  var flist = filters.filters;

  if(flist == null) {
    flist = [];
  }
  let rfilt = false;

  useEffect(() => {
    //reset graph
    sigma.getGraph().forEachNode((node) => {
      sigma.getGraph().setNodeAttribute(node, 'color', "#fffff0");
    })
    sigma.getGraph().forEachEdge((edge) => {
        sigma.getGraph().setEdgeAttribute(edge, 'hidden', true);
    });
    rfilt = false;

    flist.forEach((filter) => {
      switch(filter) {
        case 'Pemberton':
            sigma.getGraph().forEachNode((node) => {
                if(sigma.getGraph().getNodeAttribute(node, 'label').includes('Pemberton')) {
                sigma.getGraph().setNodeAttribute(node, 'color', 'red');
                }
            })
          break;
        case 'Haydock':
            sigma.getGraph().forEachNode((node) => {
                if(sigma.getGraph().getNodeAttribute(node, 'label').includes('Haydock')) {
                sigma.getGraph().setNodeAttribute(node, 'color', 'blue');
                }
            })
          break;
        case 'document':
          sigma.getGraph().forEachEdge((edge) => {
            if(sigma.getGraph().getEdgeAttribute(edge, 'relation') == 'document') {
              sigma.getGraph().setEdgeAttribute(edge, 'hidden', false);
            }
            rfilt = true;
          });
          break;
        case 'organization':
            sigma.getGraph().forEachEdge((edge) => {
                if(sigma.getGraph().getEdgeAttribute(edge, 'relation') == 'organization') {
                sigma.getGraph().setEdgeAttribute(edge, 'hidden', false);
                }
            });
            rfilt = true;
            break;
        case 'religion':
            sigma.getGraph().forEachEdge((edge) => {
                if(sigma.getGraph().getEdgeAttribute(edge, 'relation') == 'religion') {
                sigma.getGraph().setEdgeAttribute(edge, 'hidden', false);
                }
            });
            rfilt = true;
            break;
        case 'familial':
            sigma.getGraph().forEachEdge((edge) => {
                if(sigma.getGraph().getEdgeAttribute(edge, 'relation') == 'familial') {
                sigma.getGraph().setEdgeAttribute(edge, 'hidden', false);
                }
            });
            rfilt = true;
            break;
        default:
          break;
      }
    });
    if(!rfilt) {
      sigma.getGraph().forEachEdge((edge) => {
        sigma.getGraph().setEdgeAttribute(edge, 'hidden', false);
      });
    }
  }, [sigma, flist]);

  return null;
}


const GraphFilter = () => {
  const [selectedFilters, setFilters] = useState(null);
  return (
    <div>
      <ListBox multiple filter value = {selectedFilters} options = {filters} onChange={(e) => setFilters(e.value)} optionLabel='label' optionGroupLabel='label' optionGroupChildren='items' className='filterController'/>
      <ApplyFilters filters = {selectedFilters}/>
    </div>
  )
}

export default GraphFilter;