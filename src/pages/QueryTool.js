import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import './QueryTool.css';
import { TabView, TabPanel } from "primereact/tabview";
import { SplitButton } from "primereact/splitbutton";
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Slider } from "primereact/slider";
import { OverlayPanel } from "primereact/overlaypanel"; // Import OverlayPanel
import { ToggleButton } from "primereact/togglebutton";
import axios from 'axios';

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
    const [sections, setSections] = useState([{ id: Date.now() }]); // State for managing query sections

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
              const response = await axios.get('http://localhost:4000/query-tool-fields');
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

    const countries = [
        { name: 'United States', code: 'US' },
        { name: 'Canada', code: 'CA' },
        { name: 'United Kingdom', code: 'UK' },
        { name: 'Australia', code: 'AU' },
        { name: 'Germany', code: 'DE' }
    ];

    const addNewSection = () => {
        setSections([...sections, { id: Date.now() }]);
    };

    const removeSection = (id) => {
        setSections(sections.filter(section => section.id !== id));
    };

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
              <TabView className="query-tool">
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
                                    <InputText tooltip="Tips on what values to put"/>
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
                      <p className="m-0">
                          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
                          eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
                          enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui 
                          ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                      </p>
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
                      <p className="m-0">
                          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti 
                          quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
                          culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. 
                          Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                      </p>
                  </TabPanel>
              </TabView>            
          </div>
      </div>

  );
};

export default QueryTool;