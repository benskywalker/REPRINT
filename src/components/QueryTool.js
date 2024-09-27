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
const personSuggestions = [];
data.person.map((person) => {
  let fullName = person.firstName + " " + person.lastName;
  if(person.middleName) {
    fullName = person.firstName + " " + person.middleName + " " + person.lastName;
  }
  personSuggestions.push(person.personStdName || fullName)
  return suggestions.push(person.personStdName || fullName);
});

const keywordSuggestions = [];
data.keyword.map((keyword) => {
  keywordSuggestions.push(keyword.keyword);
  return suggestions.push(keyword.keyword);
});

const occupationSuggestions = [];
data.occupation.map((occupation) => {
  occupationSuggestions.push(occupation.occupationDesc);
  return suggestions.push(occupation.occupationDesc);
});

const organizationSuggestions = [];
data.organizationtype.map((organization) => {
  organizationSuggestions.push(organization.organizationDesc);
  return suggestions.push(organization.organizationDesc);
});

const placeItems=[];
const placeSuggestions = [];
data.place.map((place) => {
  placeItems.push({ label: place.placeNameStd, value: place.placeNameStd });
  placeSuggestions.push(place.placeNameStd);
  return suggestions.push(place.placeNameStd);
});

const religionSuggestions = [];
data.religion.map((religion) => {
  religionSuggestions.push(religion.religionDesc);
  return suggestions.push(religion.religionDesc);
});

const relationshipSuggestions = [];
data.relationshiptype.map((relationship) => {
  relationshipSuggestions.push(relationship.relationshipDesc);
  return suggestions.push(relationship.relationshipDesc);
});

const repositorySuggestions = [];
data.repositorie.map((repository) => {
  repositorySuggestions.push(repository.repoName);
  return suggestions.push(repository.repoDesc);
});

const roleSuggestions = [];
data.role.map((role) => {
  roleSuggestions.push(role.roleDesc);
  return suggestions.push(role.roleDesc);
});

const mentionSuggestions = personSuggestions.concat(placeSuggestions);

const fields = [
  { label: "Person", code: "person", suggestions: personSuggestions },
  { label: "Place", code: "place", suggestions: placeSuggestions },
  { label: "Religion", code: "religion", suggestions: religionSuggestions },
  { label: "Occupation", code: "occupation", suggestions: occupationSuggestions },
  { label: "Organization", code: "organization", suggestions: organizationSuggestions },
  { label: "Mention", code: "mention", suggestions: mentionSuggestions },
  { label: "Keyword", code: "keyword", suggestions: keywordSuggestions },
  { label: "Repository", code: "repository", suggestions: repositorySuggestions },
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
  const [roleItems, setRoleItems] = useState([]);
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);
  const cm = useRef(null);

  const cmItems = [
    { label: "Remove", icon: "pi pi-times", command: (e) => {removeClause()}}
  ];

  const addQuery = (q, index) => {
    const newQuery = query;
    newQuery[index] = q;
    setQuery(newQuery);
  }

  useEffect(() => {
    if(selectedField !== undefined) {
      if(selectedField.label === "Person") {
        const items = [
          { label: "First Name", value: "firstName" },
          { label: "Middle Name", value: "middleName" },
          { label: "Last Name", value: "lastName"},
          { label: "Full Name", value: "fullName"},
          { label: "Author", value: "author"},
          { label: "Recipient", value: "recipient"}
        ];

        setRoleItems(items);
      } else if(selectedField.label === "Place") {
        const items = [
          { label: "Sent", value: "sent" },
          { label: "Received", value: "received" },
          { label: "Mentioned", value: "mentioned" }
        ];
        setRoleItems(items);
      }
      const createQuery = () => {
        const q = {
            field: selectedField.code,
            value: value,
            role: selectedRole
        };
        const newQuery = query;
        newQuery[0] = q;
        setQuery(newQuery);
    };

    createQuery();
}}, [selectedField, value, selectedRole, query]);
  
  const searchSuggestions = (e) => {
    const query = e.query;
    let sug = suggestions;
    if(selectedField !== undefined) {
      sug = selectedField.suggestions;
    }
    const filteredSuggestions = sug.filter((suggestion) => {
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

  const removeButton = (index) => {
    const newClause = clauses.filter((clause, i) => i !== index);
    setClauses(newClause);
  }

  const removeClause = () => {
    const newClause = clauses.filter((clause, index) => index !== selectedClause);
    setClauses(newClause);
  }

  const onSearch = () => {
    console.log(query);
  }

  return (
    <div className="query-tool">
      <div className="buttons">
        <Button className="add-button" label="Add Clause" onClick={onAddClause} />
        <Button className="search-button" label="Search" onClick={onSearch}/>
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
              dropdown
              value={value} 
              suggestions={filteredSuggestions} 
              completeMethod={searchSuggestions} 
              onChange={(e) => setValue(e.value)}
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
              showClear
            />
          </div>
          { (selectedField !== undefined && (selectedField.code === "person" || selectedField.code === "place")) && 
            <div className="place">
              <div className="inputTitle">Role</div>
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
            />
            <Button className="remove-button" label="Remove" onClick={() => removeButton(index)} />
          </div>);
        })}
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
