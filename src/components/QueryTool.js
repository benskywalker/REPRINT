import React, { useState, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "primereact/button";
import { ContextMenu } from "primereact/contextmenu";

import { QueryClause } from "./QueryClause";

import "./QueryTool.css";

const QueryTool = () => {
  const [query, setQuery] = useState([]);
  const [selectedClause, setSelectedClause] = useState("");
  const [clauses, setClauses] = useState([]);
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
      <Button label = "Add Clause" onClick={onAddClause}/>
      {clauses.map((clause, index) => (
        <div key={clause.id} onContextMenu={(e) =>{onRightClick(e, index)}}>
          <QueryClause setQuery={setQueries} index={index}/>
        </div>
      ))}
      <Button label="Submit" onClick={onSubmit}/>
    </div>
  );
}

export default QueryTool;
