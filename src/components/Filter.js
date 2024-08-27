import React, { useState, useEffect, useRef } from "react";
import { Checkbox } from "primereact/checkbox";
import "./Filter.css";

const Filter = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
    { name: "Phineas", code: "P" },
  ];

  const ref = useRef(null);

  useEffect(() => {
    if (isOpen) {
      ref.current.focus();
    }
  }, [isOpen]);

  const filteredFilters = filters.filter((filter) =>
    filter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`filter-container ${isOpen ? "open" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {!isOpen ? (
        <div className="filter-icon">
          <span>+</span>
        </div>
      ) : (
        <div
          className="filter-content"
          ref={ref}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredFilters.map((filter) => (
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
          <button className="close-button" onClick={() => setIsOpen(false)}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;
