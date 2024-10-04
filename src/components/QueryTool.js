import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "primereact/button";
import { AutoComplete } from "primereact/autocomplete";
import { ContextMenu } from "primereact/contextmenu";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";

import { QueryClause } from "./QueryClause";

import "./QueryTool.css";

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
console.log(suggestions);

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

const minDate = new Date();
minDate.setFullYear(1600, 0, 1);

const maxDate = new Date();
maxDate.setFullYear(1750, 0, 1);


const QueryTool = () => {
  const [query, setQuery] = useState([]);
  const [selectedClause, setSelectedClause] = useState("");
  const [clauses, setClauses] = useState([]);
  const [value, setValue] = useState(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedField, setSelectedField] = useState();
  const [selectedRole, setSelectedRole] = useState();
  const [roleItems, setRoleItems] = useState(roleSuggestions);
  const [table, setTable] = useState();
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);
  const cm = useRef(null);

  const cmItems = [
    { label: "Remove", icon: "pi pi-times", command: (e) => {removeClause()}}
  ];

  const addQuery = (q, index) => {
    const newQuery = query;
    newQuery[index] = q;
    console.log(newQuery);
    setQuery(newQuery);
  }

    const createQuery = () => {
      if(selectedRole !== undefined) {
        const q = {
            table: table,
            field: selectedField,
            value: value,
            role: selectedRole.code
        };
        addQuery(q, 0);
      } else {
        const q = {
            table: table,
            field: selectedField,
            value: value
        };
        addQuery(q, 0);
      }
    };
  
  const searchSuggestions = (e) => {
    const query = e.query;
    const filteredSuggestions = suggestions.filter((suggestion) => {
      const value = suggestion.value.toLowerCase();
      if(selectedField && suggestion.field != selectedField)
        return false;
      return value.includes(query.toLowerCase());
    });
    const newSuggestions = filteredSuggestions.map((suggestion) => {
      return suggestion.value;
    });
    setFilteredSuggestions(newSuggestions);
  };

  const onAddClause = () => {
    const id = uuidv4();
    setClauses([...clauses, {id: id}]);
  };

  const onRightClick = (e, index) => {
    if(cm.current) {
      setSelectedClause(index);
      cm.current.show(e);
    }
  }

  const removeButton = (index) => {
    const newClause = clauses.filter((clause, i) => i !== index);
    setClauses(newClause);
  }

  const removeClause = () => {
    const newClause = clauses.filter((clause, index) => index !== selectedClause);
    setClauses(newClause);
  }

  const onSearch = () => {
    createQuery();
    console.log(query);
  }

  const setAutoComplete = (e) => {
    setValue(e.value);
    setField(e.value);
  }

  const setField = (value) => {
    const field = suggestions.find((suggestion) => suggestion.value === value);
    if(field) {
      setSelectedField(field.field);
    } else {
      setSelectedField(null);
    }
  }

  const setFieldDropdown = (e) => {
    const auto = suggestions.find((suggestion) => suggestion.value === value);
    if(auto && auto.field !== e.value) {
      setValue(null);
    }
    setSelectedField(e.value); 
  }

  return (
    <div className="query-tool">
      <div className="buttons">
        <Button className="add-button" label="Add Clause" onClick={onAddClause} />
        <Button className="search-button" label="Search" onClick={onSearch}/>
      </div>
      <ContextMenu model={cmItems} ref={cm} />
      <h3>Construct your Search:</h3>
      <div className="query-clauses">
        <div className = "table">
          <div className = "inputTitle">Search for:</div>
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
        {/* Base clause that can't be removed*/}
        <div className="base-clause">
          <div className="fields">
            <div className = "inputTitle">Where:</div>
            <Dropdown
              className="query-drop"
              placeholder="Field"
              options={fields}
              value={selectedField}
              onChange={setFieldDropdown}
              optionLabel="label"
              showClear
            />
          </div>
          <div className="term">
            <div className="inputTitle">is:</div> 
            <AutoComplete 
              className="query-drop"
              placeholder="Term(s)"
              dropdown
              value={value} 
              suggestions={filteredSuggestions} 
              completeMethod={searchSuggestions} 
              onChange={setAutoComplete}
            />
          </div>
          { (table === "Document" && (selectedField === "Person" || selectedField === "Place" || selectedField === "First Name" || selectedField === "Middle Name" || selectedField === "Last Name")) && 
            <div className="place">
              <div className="inputTitle">is the</div>
              <Dropdown
                className="query-drop"
                placeholder="Role"
                options={roleItems}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.value)}
                showClear
              />
            </div>
          }
        </div>
        {clauses.map((clause, index) => {
          return (
          <div className="query-clause" key={clause.id} onContextMenu = {(e)=>onRightClick(e, index)}>
            <QueryClause
              setQuery = {addQuery}
              index = {index}
              suggestions={suggestions}
              fields={fields}
              roleItems={roleItems}
              table = {table}
            />
            <Button className="remove-button" label="Remove" onClick={() => removeButton(index)} />
          </div>);
        })}
      </div>
      <div className="search-dates">
          <div className="start-date">
            <div className="inputTitle">Start date</div>
            <Calendar 
              className="query-drop" 
              placeholder="Start date" 
              value={startDate}
              onChange={(e) => setStartDate(e.value)}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
          <div className="end-date">
          <div className="inputTitle">End date</div>
            <Calendar 
              className="query-drop" 
              placeholder="End date" 
              value={endDate}
              onChange={(e) => setEndDate(e.value)}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
      </div>
    </div>
  )
  
}

export default QueryTool;
