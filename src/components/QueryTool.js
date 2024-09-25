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
let suggestions = [];
data.person.map((person) => {
  let fullName = person.firstName + " " + person.lastName;
  if(person.middleName) {
    fullName = person.firstName + " " + person.middleName + " " + person.lastName;
  }

  return suggestions.push(person.personStdName || fullName);
});

data.keyword.map((keyword) => {
  return suggestions.push(keyword.keyword);
});

data.occupation.map((occupation) => {
  return suggestions.push(occupation.occupationDesc);
});

data.organizationtype.map((organization) => {
  return suggestions.push(organization.organizationDesc);
});

const placeItems=[];

data.place.map((place) => {
  placeItems.push({ label: place.placeNameStd, value: place.placeNameStd });
  return suggestions.push(place.placeNameStd);
});

data.religion.map((religion) => {
  return suggestions.push(religion.religionDesc);
});

data.relationshiptype.map((relationship) => {
  return suggestions.push(relationship.relationshipDesc);
  
});

data.repositorie.map((repository) => {
  return suggestions.push(repository.repoDesc);

});

data.role.map((role) => {
  return suggestions.push(role.roleDesc);
  
});

const fields = [
  { label: "Person", code: "person" },
  { label: "Place", code: "place" },
  { label: "Religion", code: "religion" },
  { label: "Occupation", code: "occupation" },
  { label: "Organization", code: "organization" },
  { label: "Mention", code: "mention" },
  { label: "Keyword", code: "keyword" },
  { label: "Repository", code: "repository" },
]

const minDate = new Date();
minDate.setFullYear(1600, 0, 1);

const maxDate = new Date();
maxDate.setFullYear(1750, 0, 1);


const QueryTool = () => {
  const [query, setQuery] = useState([]);
  const [selectedClause, setSelectedClause] = useState("");
  const [clauses, setClauses] = useState([]);
  const [value, setValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleItems, setRoleItems] = useState([]);
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);
  const cm = useRef(null);

  const cmItems = [
    { label: "Remove", icon: "pi pi-times", command: (e) => {removeClause()}}
  ];

  useEffect(() => {
    console.log(selectedField);
    if(selectedField === "Person") {
      const items = [
        { label: "First Name", value: "firstName" },
        { label: "Middle Name", value: "middleName" },
        { label: "Last Name", value: "lastName"},
        { label: "Full Name", value: "fullName"},
        { label: "Author", value: "author"},
        { label: "Recipient", value: "recipient"}
      ];

      setRoleItems(items);
    } else if(selectedField === "Place") {
      const items = [
        { label: "Sent", value: "sent" },
        { label: "Received", value: "received" },
        { label: "Mentioned", value: "mentioned" }
      ];

      setRoleItems(items);
    }}, []);
  
  const searchSuggestions = (e) => {
    const query = e.query;
    let filtered = [];
    let filteredSuggestions = suggestions.filter((suggestion) => {
      return suggestion.toLowerCase().includes(query.toLowerCase());
    });
    
    setFilteredSuggestions(filteredSuggestions);
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

  const removeClause = () => {
    const newClause = clauses.filter((clause, index) => index !== selectedClause);
    setClauses(newClause);
  }

  return (
    <div className="query-tool">
      <div className="buttons">
        <Button className="add-button" label="Add Clause" onClick={onAddClause} />
        <Button className="search-button" label="Search" />
      </div>
      <ContextMenu model={cmItems} ref={cm} />
      <h2>Advanced Search</h2>
      <h3>Construct your Search:</h3>
      <div className="query-clauses">
        {/* Base clause that can't be removed*/}
        <div className="base-clause">
          <div className="term">
            <div className="inputTitle">Term(s)</div> 
            <AutoComplete 
              className="query-drop"
              placeholder="Term(s)"
              multiple 
              value={value} 
              suggestions={filteredSuggestions} 
              completeMethod={searchSuggestions} 
              onChange={setValue}
            />
          </div>
          <div className="fields">
            <div className = "inputTitle">Field</div>
            <Dropdown
              className="query-drop"
              placeholder="Field"
              options={fields}
              value={selectedField}
              onChange={(e) => setSelectedField(e.value)}
              optionLabel="label"
            />
          </div>
          { (selectedField.code === "person" || selectedField.code === "place") && 
            <div className="place">
              <div className="inputTitle">Role</div>
              <Dropdown
                className="query-drop"
                placeholder="Role"
                options={roleItems}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.value)}
              />
            </div>
          }
        </div>  
      </div>
      <div className="search-dates">
          <div className="inputTitle">Start date</div>
          <Calendar 
            className="query-drop" 
            placeholder="Start date" 
            value={startDate}
            onChange={(e) => setStartDate(e.value)}
            minDate={minDate}
            maxDate={maxDate}
          />
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
  )
  
}

export default QueryTool;
