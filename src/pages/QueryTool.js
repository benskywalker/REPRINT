import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import './QueryTool.css';
import '../components/QueryTool.css';
import { TabView, TabPanel } from "primereact/tabview";
import { v4 as uuidv4 } from 'uuid';
import { Slider } from "primereact/slider";
import { OverlayPanel } from "primereact/overlaypanel"; // Import OverlayPanel
import { ToggleButton } from "primereact/togglebutton";
import { QueryClause } from "../components/QueryClause";
import { ContextMenu } from "primereact/contextmenu";
import { InputText } from "primereact/inputtext";
import { QueryTable } from "../components/QueryTable";

const response = await axios.get("http://localhost:4000/base_query");
const data = response.data;

const suggestions = [];

let firstName = data.person.map((name) => name.firstName);
let lastName = data.person.map((name) => name.lastName);
let middleName = data.person.map((name) => name.middleName);

firstName = [...new Set(firstName)];
lastName = [...new Set(lastName)];
middleName = [...new Set(middleName)];

firstName.map((name) => {
  return suggestions.push({value: name, field: "First Name"});
});

lastName.map((name) => {
  return suggestions.push({value: name, field: "Last Name"});
});

middleName.map((name) => {
  if(name !== null)
    return suggestions.push({value: name, field: "Middle Name"});
});

data.person.map((person) => {
  let fullName = person.firstName + " " + person.lastName;
  if(person.middleName) {
    fullName = person.firstName + " " + person.middleName + " " + person.lastName;
  }
  return suggestions.push({value: person.personStdName || fullName, field: "Person"});
});

data.keyword.map((keyword) => {
  return suggestions.push({value: keyword.keyword, field: "Keyword"});
});

data.occupation.map((occupation) => {
  return suggestions.push({value: occupation.occupationDesc, field: "Occupation"});
});

data.organizationtype.map((organization) => {
  return suggestions.push({value: organization.organizationDesc, field: "Organization"});
});

data.place.map((place) => {
  return suggestions.push({value: place.placeNameStd, field: "Place"});
});

data.religion.map((religion) => {
  return suggestions.push({value:religion.religionDesc, field: "Religion"});
});

data.relationshiptype.map((relationship) => {
  return suggestions.push({value: relationship.relationshipDesc, field: "Relationship"});
});

data.repositorie.map((repository) => {
  return suggestions.push({value:repository.repoDesc, field: "Repository"});
});

const roleSuggestions = [];
data.role.map((role) => {
  return roleSuggestions.push({label: role.roleDesc, code: role.roleDesc});
});

const fields = [
    "First Name",
    "Last Name",
    "Middle Name",
    "Person",
    "Place",
    "Keyword",
    "Occupation",
    "Organization",
    "Religion",
    "Relationship",
    "Repository"
  ]
  
  const tables = [
    "Person",
    "Place",
    "Document"
  ]

const QueryTool = ()=> {
    const op = useRef(null);     //OverlayPanel reference
    const [checked, setChecked] = useState(true);
    const [query, setQuery] = useState([]);
    const [selectedClause, setSelectedClause] = useState("");
    const [clauses, setClauses] = useState([]);
    const [selectedField, setSelectedField] = useState();
    const [roleItems, setRoleItems] = useState(roleSuggestions);
    const [table, setTable] = useState();
    const [date, setDate] = useState([0, 100]);
    const [request, setRequest] = useState({});
    const cm = useRef(null);

    const cmItems = [
        { label: "Remove", icon: "pi pi-times", command: (e) => {removeClause()}}
      ];
    
      const addQuery = (q, index) => {
        const newQuery = query;
        newQuery[index] = q;
        setQuery(newQuery);
      }
    
      const onAddClause = (and) => {
        const id = uuidv4();
        setClauses([...clauses, {and: and, id: id}]);
      };
    
      const onRightClick = (e, index) => {
        if(cm.current) {
          setSelectedClause(index);
          cm.current.show(e);
        }
      }
    
      const removeButton = (index) => {
        const newClause = clauses.filter((clause, i) => i !== index);
        const newQuery = query.filter((q, i) => i !== index);
        setClauses(newClause);
        setQuery(newQuery);
      }
    
      const removeClause = () => {
        const newClause = clauses.filter((clause, index) => index !== selectedClause);
        setClauses(newClause);
      }
    
      useEffect(() => {
        const getQuery = () => {
            const request = {
                table: table,
                query: query,
                order: selectedField,
                ascending: checked,
                startDate: date[0] + 1650,
                endDate: date[1] + 1650
            }
            setRequest(request);
        }
        getQuery();
    }, [table, query, selectedField, checked, date]);
    
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
            <ContextMenu model={cmItems} ref={cm} />
            <div className="query-container">
                <TabView className="query-tool">
                    <TabPanel header="Query" leftIcon="pi pi-search mr-2" className="query-tab-panel">
                        <div className="query-section">
                            <h3>Search for:</h3>
                            <Dropdown
                                className="query-drop"
                                placeholder="Table"
                                options = {tables}
                                value = {table}
                                onChange = {(e) => setTable(e.value)}
                                optionLabel = "label"
                                showClear
                            />                           
                        </div>
                        <div className="query-section">
                            <h3>And where:</h3>
                            <div className="query-input">
                                <QueryClause
                                    setQuery = {addQuery}
                                    index = {0}
                                    suggestions={suggestions}
                                    fields={fields}
                                    roleItems={roleItems}
                                    table = {table}
                                    add = {onAddClause}
                                    remove = {removeButton}
                                    base = {true}
                                    and = {true}
                                />
                            </div>
                        </div>
                        {clauses.map((clause, index) => {
                        return (
                            <div className="query-section" key={clause.id} onContextMenu = {(e)=>onRightClick(e, index)}>
                                <h3>{clause.and ? "And" : "Or"}</h3>
                                <div className="query-input">
                                <QueryClause
                                    setQuery = {addQuery}
                                    index = {index}
                                    suggestions={suggestions}
                                    fields={fields}
                                    roleItems={roleItems}
                                    table = {table}
                                    add = {onAddClause}
                                    remove = {removeButton}
                                    base = {false}
                                    and = {clause.and}
                                />
                                </div>
                            </div>);
                        })}
                        <div className="query-section">
                            <h3>Order by:</h3>
                            <div className="query-input">
                                <Dropdown
                                    className="query-drop"
                                    placeholder="Field"
                                    options={fields}
                                    value={selectedField}
                                    onChange={(e) => setSelectedField(e.value)}
                                    optionLabel="label"
                                    showClear
                                />
                                    <ToggleButton onLabel="Ascending" offLabel="Descending" onIcon="pi pi-arrow-up" offIcon="pi pi-arrow-down" tooltip="Message about order"
                                    checked={checked} onChange={(e) => setChecked(e.value)} />                               
                            </div>
                        </div>
                        <div className="query-section mb-0">
                            <h3>In Range:</h3>
                            <div className="start-date">
                                <InputText
                                    className="date"
                                    placeholder="Start date"
                                    value={date[0] + 1650}
                                    onChange={(e) => setDate([e.target.value, date[1]])}
                                    disabled
                                />
                                <InputText
                                    className="date"
                                    placeholder="End date"
                                    value={date[1] + 1650}
                                    onChange={(e) => setDate([date[0], e.target.value])}
                                    disabled
                                />
                            </div>
                            <div className="slider-container">
                                <Slider 
                                    value={date} 
                                    onChange={(e) => setDate(e.value)} 
                                    className="slider" 
                                    range={true} 
                                    style={{ width: '70%' }} />
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
                    {/* Map team, feel free to use this*/}
                    {/* <TabPanel header="Map" leftIcon="pi pi-map-marker mr-2">
                        <p className="m-0">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
                            eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
                            enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui 
                            ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                        </p>
                    </TabPanel> */}
                    <TabPanel header="Table" leftIcon="pi pi-table mr-2">
                        <QueryTable request={request} />
                    </TabPanel>
                </TabView>            
            </div>
        </div>

    );
}

export default QueryTool;