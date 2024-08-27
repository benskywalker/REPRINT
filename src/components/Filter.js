import React, { useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import "./Filter.css"; // Import the CSS file

const Filter = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState(null);

  const handleFilterChange = (filter) => {
    setSelectedFilters(filter);
    onFilterChange(filter);
  };

  const filters = [
    { name: "John", code: "J" },
    { name: "Daniel", code: "D" },
    { name: "Phineas", code: "P" },
    // Add more options as needed
  ];

  return (
    <div className="filter-container">
      <MultiSelect
        value={selectedFilters}
        onChange={(e) => handleFilterChange(e.value)}
        options={filters}
        optionLabel="name"
        filter
        placeholder="Select Filters"
        className="p-multiselect"
      />
    </div>
  );
};

export default Filter;
