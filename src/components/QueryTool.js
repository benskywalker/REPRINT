import React, { useState, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "primereact/button";
import { ContextMenu } from "primereact/contextmenu";

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
  return suggestions.push(keyword);
});

data.occupation.map((occupation) => {
  return suggestions.push(occupation);
});

data.organizationtype.map((organization) => {
  return suggestions.push(organization.organizationName);
});

data.place.map((place) => {
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

const QueryTool = () => {
  const [query, setQuery] = useState([]);
  const [selectedClause, setSelectedClause] = useState("");
  const [clauses, setClauses] = useState([uuidv4()]);
  const cm = useRef(null);

  const cmItems = [
    { label: "Remove", icon: "pi pi-times", command: (e) => {removeClause()}}
  ];
  

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

  const setQueries = (q, index) => {
    setQuery(prevQuery => {
      const newQuery = [...prevQuery];
      newQuery[index] = q;
      return newQuery;
    })
  }

  const onSubmit = () => {
    const queries = [];
    query.map((q) => {
      q.map((clause) => {
        queries.push(clause);
      })
    })
    console.log(queries);
  }

  return(
    <div className="query-tool">
      <ContextMenu model={cmItems} ref={cm}/>
      <div className="buttons">
        <Button className="add-button" label = "Add Clause" onClick={onAddClause}/>
        <Button className="submit-button" label="Submit" onClick={onSubmit}/>
      </div>
      <div className="query-items">
        {clauses.map((clause, index) => (
            <QueryClause
              className="query-clause" 
              key={clause.id} 
              setQuery={setQueries} 
              index={index} 
              suggestions={suggestions} 
              onRightClick={onRightClick}
            />
        ))}
      </div>
    </div>
  );
}

export default QueryTool;
