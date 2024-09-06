import SigmaGraph from '../components/Sigmagraph'
import { useState, useEffect } from 'react'
import { Splitter, SplitterPanel } from 'primereact/splitter' // Import Splitter components from PrimeReact
import { Accordion, AccordionTab } from 'primereact/accordion' // Import Accordion components from PrimeReact
import { Button } from 'primereact/button' // Import Button component from PrimeReact
import styles from './Home.module.css'
import NodeDetails from '../components/NodeDetails'
import { Dialog } from 'primereact/dialog' // Import Dialog component from PrimeReact
import { v4 as uuidv4 } from 'uuid' // Import uuid function
import { DataTable } from 'primereact/datatable' // Import DataTable and Column components from PrimeReact
import { Column } from 'primereact/column' // Import Column component from PrimeReact
import ClipLoader from 'react-spinners/ClipLoader' // Import ClipLoader from react-spinners
import fetchGraphData from '../components/GraphData'
import { Slider } from '@mui/material'


const Home = ({ searchQuery }) => {
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [document, setDocument] = useState(null)
  const [timeRange, setTimeRange] = useState([1600, 1700]) // Initialize with min and max dates
  const [dialogs, setDialogs] = useState([])
  const [hoveredNodeData, setHoveredNodeData] = useState(null)
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
  const [minDate, setMinDate] = useState(1650)
  const [maxDate, setMaxDate] = useState(1800)
  const [metrics, setMetrics] = useState(null)
  const [originalGraph, setOriginalGraph] = useState({ nodes: [], edges: [] })

  const getGraphData = async () => {
    const graphData = await fetchGraphData('http://localhost:4000/relations', 1600, 1700)
    console.log(graphData)
    setGraph(graphData.graph)
    setMetrics(graphData.metrics)
    setMinDate(graphData.minDate)
    setMaxDate(graphData.maxDate)
    setTimeRange([graphData.minDate, graphData.maxDate]) // Set initial time range
    setOriginalGraph(graphData.graph)
  }

  useEffect(() => {
    console.log('Fetching graph data on mount')

    getGraphData()
  }, [])

  const handleOpenClick = rowData => {
    const id = uuidv4()
    setDialogs(prevDialogs => [...prevDialogs, { id, nodeData: rowData }])
  }

  const handleCloseDialog = id => {
    setDialogs(prevDialogs => prevDialogs.filter(dialog => dialog.id !== id))
  }

  const handleGraphUpdate = graph => {
    setGraph(graph)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/sender_receiver')
        const data = await response.json()
        setFilteredData(data)
        setLoading(false)
        setDocument({ date: { start: '2023-01-01', end: '2023-12-31' } })
      } catch (error) {
        console.error('Error fetching data: ', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (document && document.data) {
      const filtered = document.data.filter(item => {
        const itemDate = new Date(item.date).getTime()
        return itemDate >= timeRange[0] && itemDate <= timeRange[1]
      })
      setFilteredData(filtered)
    }
  }, [timeRange, document])

  useEffect(() => {
    if (dialogs.length > 0) {
      // Trigger re-render to ensure Dialog resizes correctly
      setDialogs([...dialogs])
    }
  }, [dialogs])

  const handleNodeHover = nodeData => {
    setHoveredNodeData(nodeData)
  }

  const handleNodeOut = () => {
    setHoveredNodeData(null)
  }

  const handleNodeClick = node => {
    console.log('Node clicked:', node)
    setSelectedNodes(prevSelectedNodes => [...prevSelectedNodes, node])
  }

  const handleCloseNode = rowIndex => {
    setSelectedNodes(prevSelectedNodes =>
      prevSelectedNodes.filter((_, index) => index !== rowIndex)
    )
  }

  const onRowReorder = event => {
    setSelectedNodes(event.value) // Update the state with new row order
  }

  
  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  
    // Loop through the edges and nodes and update the graph
    const newEdges = originalGraph.edges.filter(edge => {
      // Dates can be YYYY, YYYY-MM, YYYY-MM-DD
      const parseDate = (dateStr) => {
        if (typeof dateStr === 'number') {
          return new Date(dateStr, 0); // Treat as YYYY
        }
  
        if (typeof dateStr !== 'string') {
          return null;
        }
  
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
        } else if (parts.length === 2) {
          return new Date(parts[0], parts[1] - 1); // YYYY-MM
        } else if (parts.length === 1) {
          return new Date(parts[0], 0); // YYYY
        }
  
        return null;
      };
  
      const edgeDate = parseDate(edge.date);
      return edgeDate >= new Date(newValue[0], 0) && edgeDate <= new Date(newValue[1], 11, 31);
    });
  
    const newNodes = originalGraph.nodes.filter(node => {
      return newEdges.some(edge => edge.source === node.id || edge.target === node.id);
    });
  
    setGraph({ nodes: newNodes, edges: newEdges });
  };
  
  const handleTimeRangeCommit = async (event, newValue) => {
    // Update the graph by pruning nodes and edges that are outside the time range
    const graphData = await fetchGraphData('http://localhost:4000/relations', newValue[0], newValue[1]);
    setGraph(graphData.graph);
    setMetrics(graphData.metrics);
  };
  const renderHeader = (node, index) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span>{node.data.fullName}</span>
      <Button
        icon='pi pi-external-link'
        className='p-button-rounded p-button-text'
        onClick={event => {
          event.stopPropagation() // Prevents the accordion from opening
          handleOpenClick(node)
        }}
      />
      <Button
        icon='pi pi-times'
        className='p-button-rounded p-button-text'
        onClick={event => {
          event.stopPropagation() // Prevents the accordion from opening
          handleCloseNode(index)
        }}
      />
    </div>
  )

  const renderAccordion = (rowData, index) => (
    <Accordion key={rowData.data.id}>
      {' '}
      {/* Assuming each node has a unique 'id' */}
      <AccordionTab header={renderHeader(rowData, index)}>
        <div style={{ overflow: 'auto', maxHeight: '45vh' }}>
          <NodeDetails
            key={rowData.data.id}
            nodeData={rowData}
            handleNodeClick={handleNodeClick}
            className='accordion-node-details'
          />
        </div>
      </AccordionTab>
    </Accordion>
  )
  return (
    <>
      <div className={styles.content}>
        <Splitter style={{ overflowY: 'auto' }}>
          <SplitterPanel size={30} minSize={0}>
            <div className={styles.relativeContainer}>
              {hoveredNodeData ? (
                <div className={styles.hoverNodeInfo}>
                  <span>{hoveredNodeData.data.fullName}</span>
                </div>
              ) : (
                <div className={styles.dataTableContainer}>
                  <DataTable
                    value={selectedNodes}
                    reorderableRows
                    onRowReorder={onRowReorder}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <Column
                      body={rowData => renderAccordion(rowData)}
                      header='Sidecars'
                    />
                  </DataTable>
                </div>
              )}
            </div>
          </SplitterPanel>
          <SplitterPanel className={styles.sigmaPanel} size={70} minSize={0}>
            {loading ? (
              <div className={styles.loaderContainer}>
                <ClipLoader color='#36d7b7' loading={loading} size={150} />
              </div>
            ) : (
              <div className={styles.graphContainer}>
                <SigmaGraph
                  graph={graph}
                  onNodeHover={handleNodeHover}
                  className={styles.sigma}
                  data={filteredData}
                  onNodeClick={handleNodeClick}
                  searchQuery={searchQuery}
                  handleNodeunHover={handleNodeOut}
                  handleGraphUpdate={handleGraphUpdate}
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
              </div>
            )}
          </SplitterPanel>
        </Splitter>
      </div>
      {dialogs.map(dialog => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data.fullName}
          maximizable
          modal={false}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          style={{
            width: '35vw',
            height: '70vh',
            minWidth: '15vw',
            minHeight: '15vw'
          }} /* Set a consistent height */
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
          <NodeDetails
            nodeData={dialog.nodeData}
            handleNodeClick={handleNodeClick}
          />
        </Dialog>
      ))}
    </>
  )
}

export default Home