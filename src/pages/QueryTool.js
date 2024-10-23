import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import './QueryTool.css';
import { TabView, TabPanel } from "primereact/tabview";
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from "primereact/overlaypanel"; // Import OverlayPanel
import { ToggleButton } from "primereact/togglebutton";
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner'; // Import ProgressSpinner
import { MultiSelect } from "primereact/multiselect";
import QueryGraph from "../components/QueryGraph";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";

const QueryTool = () => {
    const [value, setValue] = useState([20, 80]);
    const op = useRef(null);     //OverlayPanel reference
    const [checked, setChecked] = useState(true);
    const [fields, setFields] = useState([]);
    const [filteredFields, setFilteredFields] = useState([]);
    const [selectedView, setSelectedView] = useState(null); // State for selected view
    const [selectedField, setSelectedField] = useState(null); // State for selected field
    const [splitButtonLabel, setSplitButtonLabel] = useState("In"); // State for SplitButton label
    const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order 
    const [sections, setSections] = useState([{ id: Date.now(), selectedValue: '' }]); // State for managing query sections
    const [activeIndex, setActiveIndex] = useState(0); // State for active tab index
    const [queryData, setQueryData] = useState([]); // State for query data
    const [loading, setLoading] = useState(false); // State for loading
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(''); // Add global filter state
    const [filters, setFilters] = useState(null); // Add filter state

    const [views, setViews] = useState([
      {label: 'Person', value: 'person_all_view'},
      {label: 'Organization', value: 'organization_all_view'},
      {label: 'Place', value: 'place_all_view'},
      {label: 'Religion', value: 'religion_all_view'},
      {label: 'Document', value: 'document_all_view'}
    ]);

    const boolItems = [
      { label: "Equals", value: "equals" },
      { label: "Not Equals", value: "not_equals" },
      { label: "Like", value: "like" },
      { label: "Not Like", value: "not_like" },
      { label: "Greater Than", value: "greater_than" },
      { label: "Less Than", value: "less_than" },
      { label: "Greater Than or Equal", value: "greater_than_or_equal" },
      { label: "Less Than or Equal", value: "less_than_or_equal" }
    ];

    const actionItems = [
      { label: "And", value: "and" },
      { label: "Or", value: "or" },
      { label: "Else", value: "else" },
      { label: "Remove", value: "remove" }
    ];

    const updateFields = (e) => {  
        setSelectedView(e.value); // Update selected view
        let filtered = [];
        if(e.value === 'person_all_view'){
          filtered = fields.filter(view => view.view === 'person_all_view');
        }
        else if(e.value === 'organization_all_view'){
          filtered = fields.filter(view => view.view  === 'organization_all_view');
        }
        else if(e.value === 'place_all_view'){
          filtered = fields.filter(view => view.view  === 'place_all_view');
        }
        else if(e.value === 'religion_all_view'){
          filtered = fields.filter(view => view.view === 'religion_all_view');
        }
        else if(e.value === 'document_all_view'){
          filtered = fields.filter(view => view.view === 'document_all_view');
        }
        setFilteredFields(filtered);
        setSelectedField(null); // Reset selected field when view changes
        setSplitButtonLabel("In"); // Reset SplitButton label when view changes
    };
     
    useEffect(() => {
      const fetchData = async () => {
          try {
            const baseExpressUrl = process.env.BASEEXPRESSURL || "http://localhost:4000/";
              const response = await axios.get(`${baseExpressUrl}query-tool-fields`);
              setFields(response.data);
          } catch (error) {
              console.log(error);
          }
      };

      fetchData();
  }, []);
  useEffect(() => {
    console.log(fields);
}, [fields]);
    const addNewSection = () => {
        setSections([...sections, { id: Date.now(), selectedValue: '' }]);
    };

    const removeSection = (id) => {
        if (sections.length === 1 || sections[0].id === id) {
            return; // Prevent removing the first section
        }
        setSections(sections.filter(section => section.id !== id));
    };

    const onTabChange = (e) => {
        setActiveIndex(e.index);
        console.log(`Tab changed to: ${e.index}`);
        //get data from the server
        const fetchData = async () => {
          try {
            setLoading(true); // Set loading to true before fetching data
                        // Log all the operations, fields, and values for the knex query
            console.log(sections);

            const knexQuery = sections.map(section => {
            console.log(section);
            return {
                operation: selectedView,
                field: section.selectedField.field,
                value: section.selectedValue,
                action: section.selectedAction,
            };
            });

            const operatorMapping = {
                equals: '=',
                not_equals: '!=',
                like: 'LIKE',
                not_like: 'NOT LIKE',
                greater_than: '>',
                less_than: '<',
                greater_than_or_equal: '>=',
                less_than_or_equal: '<='
            };

            const body = {
                tables: selectedView,
                fields: sections.map(section => section.selectedField.field),
                operators: sections.map(section => operatorMapping[section.selectedParameter]),
                values: sections.map(section => section.selectedValue),
                logicalOperators: sections.map(section => section.selectedAction)
            };

            console.log(knexQuery);
            console.log(body);
            const baseExpressUrl = process.env.BASEEXPRESSURL || "http://localhost:4000/";

const response = await axios.post(`${baseExpressUrl}knex-query`, body); 
              setQueryData(response.data[0]);
              console.log( queryData);
          } catch (error) {
              console.log(error);
          } finally {
              setLoading(false); // Set loading to false after fetching data
          }
      }
      fetchData();

    };

    useEffect(() => {
        console.log('Query Data Updated:');
        console.log(queryData);
    }, [queryData]);

    useEffect(() => {
        // Pre-populate visibleColumns with the first 4 values of filteredFields
        if (filteredFields.length > 0) {
            setVisibleColumns(filteredFields);
        }
    }, [filteredFields]);


    const onColumnToggle = (event) => {
        console.log("Event Value: ", event.value);
        let selectedColumns = event.value;
        let orderedSelectedColumns = filteredFields.filter((col) => selectedColumns.some((sCol) => sCol.field === col.field));
        setVisibleColumns(orderedSelectedColumns);
    };

    const onFilter = (e) => {
        setFilters(e.filters); // Update state
        sessionStorage.setItem('query-tool-filters', JSON.stringify(e.filters)); // Save to sessionStorage
    };

    // Save global filter value to session storage when it changes
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilter(value); // Apply the filter
        sessionStorage.setItem('query-tool-globalFilter', value); // Save the filter to sessionStorage
    };

                const renderHeader = () => {
                    return (
                        <div className="table-header">
                            <span className="p-input-icon-left">
                            <IconField iconPosition="left">
                                <InputIcon className="pi pi-search"> </InputIcon>
                                <InputText 
                                    type="search"
                                    value={globalFilter} // Ensure global filter input shows the correct value
                                    onChange={onGlobalFilterChange} // Update on change
                                    placeholder="Global Search"
                                />
                            </IconField>
                            </span>
                            <MultiSelect 
                            value={visibleColumns} 
                            options={filteredFields}  
                            optionLabel="field" 
                            onChange={onColumnToggle} 
                            className="w-full sm:w-20rem ml-4" 
                            />
                        </div>
                    );
                };
                const header = renderHeader();

    return (
      <div className="query-tool-container">
          <div className="title-container">
              <h1>Query Tool</h1>
          </div>
              {/* Help Icon with click event, positioned at the bottom right */}
          <i className="pi pi-question-circle help-icon" onClick={(e) => op.current.toggle(e)}></i>
          {/* OverlayPanel Component */}
          <OverlayPanel ref={op} appendTo={document.body} className="custom-overlay-panel">
              <div>
                  <p>Query tool 101 guide here</p>
              </div>
          </OverlayPanel>
          <div className="query-container">
              <TabView className="query-tool" activeIndex={activeIndex} onTabChange={onTabChange}>
                  <TabPanel header="Query" leftIcon="pi pi-search mr-2" className="query-tab-panel">
                      <div className="query-section">
                          <h3>Search for:</h3>
                          <Dropdown tooltip="Message to display" 
                          value={selectedView} // Bind selected view to Dropdown
                          onChange={(e) => updateFields(e)} 
                          options={views} optionLabel="label" placeholder="Parameters" 
                          filter className="w-full md:w-14rem" />
                      </div>
                      {sections.map((section, index) => (
                        <div key={section.id} className="query-section">
                            <h3>Where:</h3>
                            <div className="query-input">
                                <Dropdown tooltip="Message to display"
                                value={section.selectedField} // Bind selected field to Dropdown
                                onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].selectedField = e.value;
                                    setSections(newSections);
                                }} 
                                options={filteredFields} 
                                optionLabel="field" placeholder="Parameters" 
                                filter className="w-full md:w-14rem" 
                                disabled={filteredFields?.length === 0}
                                />
                                <Dropdown tooltip="Message to display" 
                                value={section.selectedParameter} // Bind selected parameter to Dropdown
                                onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].selectedParameter = e.value;
                                    setSections(newSections);
                                }} 
                                options={boolItems} 
                                optionLabel="label" placeholder="Parameters" 
                                className="w-full md:w-14rem" 
                                />
                                <FloatLabel>
                                    <InputText tooltip="Tips on what values to put"
                                    value={section.selectedValue} // Bind selected value to InputText
                                    onChange={(e) => {
                                        const newSections = [...sections];
                                        newSections[index].selectedValue = e.target.value;
                                        setSections(newSections);
                                    }} />
                                    <label htmlFor="username">Value</label>
                                </FloatLabel>
                                <Dropdown tooltip="Select Action" 
                                value={section.selectedAction} // Bind selected action to Dropdown
                                onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[index].selectedAction = e.value;
                                    setSections(newSections);
                                    if (e.value === "and" || e.value === "or") {
                                        addNewSection();
                                    } else if (e.value === "remove") {
                                        removeSection(section.id);
                                    }
                                }} 
                                options={actionItems} 
                                optionLabel="label" placeholder="Select Action" 
                                className="w-full md:w-14rem" 
                                />
                            </div>
                        </div>
                      ))}
                      
                      <div className="query-section">
                          <h3>Order by:</h3>
                          <div className="query-input">
                              <Dropdown tooltip="Message to display" 
                              value={selectedOrder} 
                              onChange={(e) => setSelectedOrder(e.value)} 
                              options={filteredFields} 
                              optionLabel="field" 
                              placeholder="Parameters" 
                              filter 
                              className="w-full md:w-14rem" 
                              disabled={filteredFields?.length === 0}
                              />
                              <ToggleButton onLabel="Ascending" offLabel="Descending" onIcon="pi pi-arrow-up" offIcon="pi pi-arrow-down" tooltip="Message about order"
                                  checked={checked} onChange={(e) => setChecked(e.value)} />                            
                          </div>
                      </div>
                  
                  </TabPanel>
                  <TabPanel header="Network" leftIcon="pi pi-user mr-2">
                      {loading ? (
                        <div className="spinner-wrapper">
                        <ProgressSpinner />
                    </div>                           ) : (queryData && (
                        <QueryGraph data = {queryData} type = {selectedView}/>
                        ))}
                  </TabPanel>
                  <TabPanel header="Map" leftIcon="pi pi-map-marker mr-2">
                      <p className="m-0">
                          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
                          eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
                          enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui 
                          ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                      </p>
                  </TabPanel>
                  <TabPanel header="Table" leftIcon="pi pi-table mr-2" >
                      {/* table for data returned from server */}
                      {loading ? (
                        <div className="spinner-wrapper">
                            <ProgressSpinner />
                        </div>                      ) : (
                          queryData && (
                              <DataTable value={queryData}
                                         size={'small'}
                                        style={{ maxWidth: '80vw' }}
                                        paginator 
                                        rows={10} 
                                        rowsPerPageOptions={[5, 10, 25, 50]}  
                                        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                                        header={header} 
                                        showGridlines
                                        stripedRows 
                                        scrollable scrollHeight="450px"
                                        resizableColumns
                                        reorderableColumns 
                                        globalFilter={globalFilter} // Add global filter
                                        filters={filters} // Add filters
                                        onFilter={onFilter} // Add onFilter callback
                                        >
                                  {
                                      visibleColumns.map((fieldObj, index) => {
                                          return <Column key={index} 
                                                    field={fieldObj.field} 
                                                    header={fieldObj.field}
                                                    sortable
                                                    filter
                                                    filterPlaceholder={`Search by ${fieldObj.field}`}
                                                    />;
                                      })
                                  }
                              </DataTable>
                          )
                      )}
                  </TabPanel>
              </TabView>            
          </div>
      </div>
  );
};

export default QueryTool;