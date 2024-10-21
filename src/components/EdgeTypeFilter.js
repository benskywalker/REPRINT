// EdgeTypeFilter.js
import React, { useState } from "react";
import { Checkbox } from "primereact/checkbox";

const EdgeTypeFilter = ({ selectedEdgeTypes, onChange }) => {
  const edgeTypes = ["document", "organization", "relationship", "religion"];

  const handleEdgeTypeChange = (e) => {
    const { value, checked } = e.target;
    console.log(value, checked);
    let updatedEdgeTypes;
    if (checked) {
      updatedEdgeTypes = [...selectedEdgeTypes, value];
    } else {
      updatedEdgeTypes = selectedEdgeTypes.filter((type) => type !== value);
    }
    onChange(updatedEdgeTypes);
  };

  return (
    <div style={{ position: "fixed", bottom: "10px", right: "10px", background: "white", color: "black", padding: "10px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
      <h4>Filter Edge Types</h4>
      {edgeTypes.map((type) => (
        <div key={type} className="p-field-checkbox">
          <Checkbox
            inputId={type}
            value={type}
            checked={selectedEdgeTypes.includes(type)}
            onChange={handleEdgeTypeChange}
          />
          <label htmlFor={type} style={{ marginLeft: "5px" }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
        </div>
      ))}
    </div>
  );
};

export default EdgeTypeFilter;
