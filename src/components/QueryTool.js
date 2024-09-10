import React, { useState, useRef } from "react";
import axios from "axios";

<<<<<<< Updated upstream
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { FilterMatchMode, FilterOperator } from "primereact/api";

import "./QueryTool.css";
=======
import { Dropdown} from "primereact/dropdown";
import { Button } from "primereact/button";
import { ContextMenu } from "primereact/contextmenu";
import { Card } from "primereact/card";
>>>>>>> Stashed changes

import "./QueryTool.css";

const QueryTool = () => {
<<<<<<< Updated upstream
  const [people, setPeople] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    birthDate: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    deathDate: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    gender: { value: null, matchMode: FilterMatchMode.EQUALS },
});
  const [loading, setLoading] = useState(true);

const onGlobalFilterChange = (e) => {
  const value = e.target.value;
  let _filters = { ...filters };

  _filters['global'].value = value;

  setFilters(_filters);
  setGlobalFilterValue(value);
  console.log(filters);
};

  useEffect(() => {
    const getPeople = async () => {
      const response = await axios.get("http://localhost:4000/persons");
      setPeople(response.data);
      setLoading(false);
    };

    getPeople();
  }, []);

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  people.map((person) => {
    person.name = capitalize(person.firstName) + " " + capitalize(person.lastName);
  })

  const peopleColumns = [
    { field : "name", header : "Name" },
    { field : "birthDate", header : "DOB" },
    { field : "deathDate", header : "DOD" },
    { field : "gender", header : "Gender"},
  ];

  const globalFilterFields = ['name'];

  const renderHeader = () => {
    return (
        <div className="flex justify-content-end">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
            </IconField>
        </div>
=======
  const [query, setQuery] = useState("");
  const [dropdowns, setDropdowns] = useState(["SELECT", "FROM"]);
  const [keywordDropdowns, setKeywordDropdowns] = useState(["*", "person"]);
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const cm = useRef(null);

  const cmItems = [
    { label: "Remove", icon: "pi pi-times", command: (e) => {removeClause(e.item.index); console.log(e)}}
  ]
  
  const queryCommands = [
    { label : "select", value: "SELECT" },
    { label: "and", value: "AND" },
    { label: "or", value: "OR" },
    { label: "not", value: "NOT" },
    { label: "where", value: "WHERE" },
    { label: "from", value: "FROM" },
    { label: "equals", value: "=" },
    { label: "greater than", value: ">" },
    { label: "less than", value: "<" },
    { label: "greater than or equal to", value: ">=" },
    { label: "less than or equal to", value: "<=" },
    { label: "not equal to", value: "!=" },
    { label: "like", value: "LIKE" },
    { label: "in", value: "IN" }
  ];

  const keywordCommands = [
    { label: "Everything", value: "*" },
    { label: "People", value: "person" },
    { label: "Organizations", value: "organization" },
    { label: "Events", value: "event" },
    { label: "Locations", value: "location" },
    { label: "Documents", value: "document" },
    { label: "Images", value: "image" },

  ];

  const onAddClause = () => {
    setDropdowns([...dropdowns, "SELECT"]);
    setKeywordDropdowns([...keywordDropdowns, "*"]);
    console.log(dropdowns);
  };

  const onDropdownChange = (value, index) => {
    const newDropdowns = [...dropdowns];
    newDropdowns[index] = value;
    setDropdowns(newDropdowns);
  };

  const onKeywordDropdownChange = (value, index) => {
    const newKeywordDropdowns = [...keywordDropdowns];
    newKeywordDropdowns[index] = value;
    setKeywordDropdowns(newKeywordDropdowns);
  };

  const onRightClick = (e, index) => {
    if(cm.current) {
      setSelectedDropdown(index);
      cm.current.show(e);
    }
  }

  const removeClause = () => {
    const newDropdowns = [...dropdowns];
    newDropdowns.splice(selectedDropdown, 1);
    setDropdowns(newDropdowns);

    const newKeywordDropdowns = [...keywordDropdowns];
    newKeywordDropdowns.splice(selectedDropdown, 1);
    setKeywordDropdowns(newKeywordDropdowns);
  }

  const Dropdowns = () => {
    return(
      <div>
        {dropdowns.map((dropdown, index) => (
          <div>
            <Dropdown key = {index} value={dropdown} options={queryCommands} onChange={(e) => {onDropdownChange(e.value, index)}} onContextMenu={(e) => {onRightClick(e, index)}}/>
            <Dropdown key = {"Keyword"+index} value={keywordDropdowns[index]} options={keywordCommands} onChange={(e) => {onKeywordDropdownChange(e.value, index)}} onContextMenu={(e) => {onRightClick(e, index)}}/>
          </div>
        ))}
      </div>
>>>>>>> Stashed changes
    );
}

<<<<<<< Updated upstream
  const header = renderHeader();

  return (
     <DataTable 
        value = {people}
        dataKey = 'personID'
        filter = {filters} 
        filterDisplay="row" 
        paginator 
        rows={20} 
        header = {header} 
        size = "small" 
        tableStyle={{ minWidth: '50rem' }} 
        showGridlines 
        globalFilterFields={globalFilterFields} 
        loading = {loading}
      >
        {peopleColumns.map((col, i) => (
          <Column key = {i} filter field = {col.field} filterField = {col.field} header = {col.header} sortable />
        ))}
     </DataTable>
   );
};
=======
  const onSubmit = () => {

    //build query
    let _query = "";
    dropdowns.map((dropdown, index) => {
      _query += dropdown + " ";
      _query += keywordDropdowns[index] + " ";
    });
    _query = _query.slice(0, -1);
    setQuery(_query + ";");

    console.log(query);
  }

  return(
    <div className="query-tool">
      <ContextMenu model={cmItems} ref={cm}/>
      <Button label = "Add Clause" onClick={onAddClause}/>
      <Dropdowns/>
      <Button label="Submit" onClick={onSubmit}/>
    </div>
  );
}
>>>>>>> Stashed changes

export default QueryTool;
