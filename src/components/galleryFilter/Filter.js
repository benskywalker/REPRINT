import React, { useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import "./Filter.css";

const Filter = ({ onFilterChange, options }) => {
  const [selectedFilters, setSelectedFilters] = useState(null);

  const handleFilterChange = (filter) => {
    setSelectedFilters(filter);
    onFilterChange(filter);
  };

  return (
    <div className="filter-container">
      <MultiSelect
        value={selectedFilters}
        onChange={(e) => handleFilterChange(e.value)}
        options={options}
        optionLabel="name"
        filter
        placeholder="Select Filters"
        className="p-multiselect"
      />
    </div>
  );
};

export default Filter;
