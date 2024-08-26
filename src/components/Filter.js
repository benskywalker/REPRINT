import React, { useState, useEffect, useRef } from "react";
import { Checkbox } from "primereact/checkbox";
import "./Filter.css";

const Filter = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleCheckboxChange = (filter) => {
    let updatedFilters;

    if (selectedFilters.includes(filter)) {
      updatedFilters = selectedFilters.filter((item) => item !== filter);
    } else {
      updatedFilters = [...selectedFilters, filter];
    }

    setSelectedFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const filters = [
    { name: "John", code: "J" },
    { name: "Daniel", code: "D" },
    { name: "Phineas", code: "P" },
  ];

  const ref = useRef(null);

  useEffect(() => {
    ref.current.focus();
  }, []);

  return (
    <div className="filter" ref={ref}>
      {filters.map((filter) => (
        <div
          className={`filter-option ${
            selectedFilters.includes(filter.code) ? "selected" : ""
          }`}
          key={filter.code}
        >
          <Checkbox
            className="checkbox"
            checked={selectedFilters.includes(filter.code)}
            onChange={() => handleCheckboxChange(filter.code)}
          />
          <div>{filter.name}</div>
        </div>
      ))}
    </div>
  );
};

export default Filter;
