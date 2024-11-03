import SigmaGraph from '../../components/graph/Sigmagraph' // Import the SigmaGraph component
import { useState, useEffect } from 'react'
import styles from './QueryGraph.module.css'
import Sidecar from '../../components/sidecar/Sidecar'
import FilterTool from '../../components/graph/graphSearch/FilterTool'
import { Dialog } from 'primereact/dialog'
import { v4 as uuidv4 } from 'uuid'
import ClipLoader from 'react-spinners/ClipLoader'
import fetchGraphData from '../../components/graph/GraphData'
import { Slider } from '@mui/material'
import { ToggleButton } from 'primereact/togglebutton'
import EdgeTypeFilter from '../../components/graph/filterBox/EdgeTypeFilter' // Import the new EdgeTypeFilter component
import e from 'express'

const QueryGraph = ({ data, type }) => {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState([1600, 1700])
  const [dialogs, setDialogs] = useState([])
  const [hoveredNodeData, setHoveredNodeData] = useState(null)
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
  const [minDate, setMinDate] = useState(1650)
  const [maxDate, setMaxDate] = useState(1800)
  const [metrics, setMetrics] = useState(null)
  const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] })
  const [showEdges, setShowEdges] = useState(true)
  const [selectedTerms, setSelectedTerms] = useState([])
  const [selectedEdgeTypes, setSelectedEdgeTypes] = useState([
    'document',
    'organization',
    'religion',
    'relationship'
  ]) // Default selected edge types

  const getGraphData = async () => {
    console.log("Data from query", data, "Type", type)
    const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL
    const graphData = await fetchGraphData(`${baseExpressUrl}graph2`, 2000, 0)
    setGraph(graphData.graph || { nodes: [], edges: [] })
    setMetrics(graphData.metrics)
    setMinDate(graphData.minDate)
    setMaxDate(graphData.maxDate)
    setTimeRange([graphData.minDate, graphData.maxDate])
    setOriginalGraph(graphData.graph || { nodes: [], edges: [] })
    setLoading(false)
    console.log('Graph Data:', graphData)
  }

  useEffect(() => {
    getGraphData()
  }, [])

  useEffect(() => {
    const parseData = () => {
      if(data.length > 0)
      {
        const graph = { nodes: [], edges: [] }
        if(type === 'person')
        {
          console.log('Data:', data)
          // Add the person to the graph
          data.forEach(person => {
            const id = "person_" + person.personID;
            console.log(id)
            const node = originalGraph.nodes.find(node => node.id === id);
            if(node)
            {
              if(!graph.nodes.includes(node))
              {
                graph.nodes.push(node)
              }
              const edges = originalGraph.edges.filter(edge => edge.source === id || edge.target === id);
              edges.forEach(edge => {
                console.log('Edge:', edge)
                if(!graph.edges.includes(edge) && (graph.nodes.find(node => node.id === edge.source) || graph.nodes.find(node => node.id === edge.target)))
                {
                  if(!graph.nodes.find(node => node.id === edge.source))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.source))
                  }
                  if(!graph.nodes.find(node => node.id === edge.target))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.target))
                  }
                  graph.edges.push(edge)
                }
              });
            }
          });
          //Need to figure out if documents are nodes or edges
        } else if(type === 'document')
        {
          
        } else if(type === 'organization')
        {
          data.forEach(organization => {
            const id = "organization_" + organization.organizationID;
            const node = originalGraph.nodes.find(node => node.id === id);
            if(node)
            {
              if(!graph.nodes.includes(node))
              {
                graph.nodes.push(node)
              }
              const edges = originalGraph.edges.filter(edge => edge.source === id || edge.target === id);
              edges.forEach(edge => {
                if(!graph.edges.includes(edge) && (graph.nodes.find(node => node.id === edge.source) || graph.nodes.find(node => node.id === edge.target)))
                {
                  if(!graph.nodes.find(node => node.id === edge.source))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.source))
                  }
                  if(!graph.nodes.find(node => node.id === edge.target))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.target))
                  }
                  graph.edges.push(edge)
                }
              });
            }
          });
        } else if(type === 'religion')
        {
          data.forEach(religion => {
            const id = "religion_" + religion.religionID;
            const node = originalGraph.nodes.find(node => node.id === id);
            if(node)
            {
              if(!graph.nodes.includes(node))
              {
                graph.nodes.push(node)
              }
              const edges = originalGraph.edges.filter(edge => edge.source === id || edge.target === id);
              edges.forEach(edge => {
                if(!graph.edges.includes(edge) && (graph.nodes.find(node => node.id === edge.source) || graph.nodes.find(node => node.id === edge.target)))
                {
                  if(!graph.nodes.find(node => node.id === edge.source))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.source))
                  }
                  if(!graph.nodes.find(node => node.id === edge.target))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.target))
                  }
                  graph.edges.push(edge)
                }
              });
            }
          });
        } else if(type === 'place')
        {
          data.forEach(place => {
            const id = "place_" + place.placeID;
            const node = originalGraph.nodes.find(node => node.id === id);
            if(node)
            {
              if(!graph.nodes.includes(node))
              {
                graph.nodes.push(node)
              }
              const edges = originalGraph.edges.filter(edge => edge.source === id || edge.target === id);
              edges.forEach(edge => {
                if(!graph.edges.includes(edge) && (graph.nodes.find(node => node.id === edge.source) || graph.nodes.find(node => node.id === edge.target)))
                {
                  if(!graph.nodes.find(node => node.id === edge.source))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.source))
                  }
                  if(!graph.nodes.find(node => node.id === edge.target))
                  {
                    graph.nodes.push(originalGraph.nodes.find(node => node.id === edge.target))
                  }
                  graph.edges.push(edge)
                }
              });
            }
          });
        }

        console.log('Graph:', graph)
        setGraph(graph);
      }
    }
    parseData()
  }, [data, type, originalGraph]);

  const handleOpenClick = rowData => {
    const id = uuidv4()
    setDialogs(prevDialogs => [...prevDialogs, { id, nodeData: rowData }])
  }

  const handleCloseDialog = id => {
    setDialogs(prevDialogs => prevDialogs.filter(dialog => dialog.id !== id))
  }

  const handleGraphUpdate = graph => {
    setGraph(graph || { nodes: [], edges: [] })
  }

  const handleNodeHover = nodeData => {
    setHoveredNodeData(nodeData)
  }

  const handleNodeOut = () => {
    setHoveredNodeData(null)
  }

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue)
    applyFilters(newValue, selectedTerms, selectedEdgeTypes)
  }

  const applyFilters = (timeRange, terms, edgeTypes = selectedEdgeTypes) => {
    const newEdges = originalGraph.edges.filter(edge => {
      const parseDate = dateStr => {
        if (typeof dateStr === 'number') {
          return new Date(dateStr, 0)
        }

        if (typeof dateStr !== 'string') {
          return null
        }

        const parts = dateStr.split('-')
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2])
        } else if (parts.length === 2) {
          return new Date(parts[0], parts[1] - 1)
        } else if (parts.length === 1) {
          return new Date(parts[0], 0)
        }

        return null
      }

      // If no edge types are selected, show all edges
      if (edgeTypes.length === 0) {
        return true
      }

      // Only include edges that match the selected edge types
      if (!edgeTypes.includes(edge.type)) {
        return false
      }

      if (edge.type === 'document') {
        const edgeDate = parseDate(edge.date)
        return (
          edgeDate >= new Date(timeRange[0], 0) &&
          edgeDate <= new Date(timeRange[1], 11, 31)
        )
      } else {
        return true
      }
    })

    const newNodes = originalGraph.nodes.filter(node => {
      return newEdges.some(
        edge => edge.source === node.id || edge.target === node.id
      )
    })

    const filteredGraph = { nodes: newNodes, edges: newEdges }
    filterGraphWithTerms(filteredGraph, terms)
  }

  const filterGraphWithTerms = (graph, terms) => {
    if (terms.length === 0) {
      setGraph(graph)
      return
    }

    const filteredNodes = graph.nodes.filter(
      node =>
        (node.data?.person?.fullName !== undefined &&
          terms.includes(node.data.person.fullName)) ||
        (node.label !== undefined && terms.includes(node.label))
    )

    const connectedNodeIds = new Set(filteredNodes.map(node => node.id))
    const immediateConnections = new Set()

    graph.edges.forEach(edge => {
      if (connectedNodeIds.has(edge.source)) {
        immediateConnections.add(edge.target)
      }
      if (connectedNodeIds.has(edge.target)) {
        immediateConnections.add(edge.source)
      }
    })

    const allFilteredNodes = graph.nodes.filter(
      node => connectedNodeIds.has(node.id) || immediateConnections.has(node.id)
    )

    const filteredEdges = graph.edges.filter(
      edge =>
        (connectedNodeIds.has(edge.source) &&
          immediateConnections.has(edge.target)) ||
        (connectedNodeIds.has(edge.target) &&
          immediateConnections.has(edge.source))
    )

    setGraph({ nodes: allFilteredNodes, edges: filteredEdges })
  }

  const handleTimeRangeCommit = async (event, newValue) => {
    // Update the graph by pruning nodes and edges that are outside the time range
  }


  const onFilterChange = (filteredGraph, terms) => {
    setSelectedTerms(terms)
    applyFilters(timeRange, terms, selectedEdgeTypes)
  }

  const handleEdgeTypeChange = newEdgeTypes => {
    console.log('Selected Edge Types:', newEdgeTypes)
    setSelectedEdgeTypes(newEdgeTypes)
    applyFilters(timeRange, selectedTerms, newEdgeTypes)
  }

  return (
    <>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loaderContainer}>
            <ClipLoader color='#36d7b7' loading={loading} size={150} />
          </div>
        ) : (
          <div className={styles.graphContainer}>
            <div className={styles.filterToolContainer}>
              <FilterTool
                graph={graph}
                setGraph={setGraph}
                originalGraph={originalGraph}
                onFilterChange={onFilterChange}
              />
              <ToggleButton
                onIcon='pi pi-check'
                offIcon='pi pi-times'
                checked={showEdges}
                onChange={e => setShowEdges(e.value)}
                onLabel='Show Edges'
                offLabel='Hide Edges'
                severity={showEdges ? 'success' : 'danger'}
              />

            </div>
            <SigmaGraph
              graph={graph}
              onNodeHover={handleNodeHover}
              className={styles.sigma}
              onNodeClick={handleOpenClick}
              handleNodeunHover={handleNodeOut}
              handleGraphUpdate={handleGraphUpdate}
              showEdges={showEdges}
            />

            <div className={styles.sliderContainer}>
              <Slider
                value={timeRange}
                onChange={handleTimeRangeChange}
                onChangeCommitted={handleTimeRangeCommit}
                valueLabelDisplay='auto'
                min={minDate}
                max={maxDate}
                step={1}
                className={styles.slider}
                marks={[
                  { value: minDate, label: minDate },
                  { value: maxDate, label: maxDate }
                ]}
              />
            </div>
            <EdgeTypeFilter
              selectedEdgeTypes={selectedEdgeTypes}
              onChange={handleEdgeTypeChange}
            />
          </div>
        )}
      </div>


      {dialogs.map(dialog => (
        <Dialog
          key={dialog.id}
          header={
            dialog.nodeData.data?.person?.fullName || dialog?.nodeData?.label
          }
          maximizable
          modal={false}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          style={{
            width: '35vw',
            height: '70vh',
            minWidth: '15vw',
            minHeight: '15vw'
          }}
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
          <Sidecar
            nodeData={dialog.nodeData}
            handleNodeClick={handleOpenClick}
            activeTabIndex={dialog.activeTabIndex}
            setActiveTabIndex={index => {
              const updatedDialogs = dialogs.map(dlg =>
                dlg.id === dialog.id ? { ...dlg, activeTabIndex: index } : dlg
              )
              setDialogs(updatedDialogs)
            }}
          />
        </Dialog>
      ))}
    </>
  )
}

export default QueryGraph
