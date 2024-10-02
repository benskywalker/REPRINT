import React, {useEffect, useState} from "react";

import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";

export const QueryClause = ({ setQuery, index, suggestions, fields, roleItems, table }) => {
    const [value, setValue] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [selectedField, setSelectedField] = useState();
    const [selectedRole, setSelectedRole] = useState();
    const [selectedBool, setSelectedBool] = useState();

    const boolItems = [
        "And",
        "Or",
    ];

    useEffect(() => {
      if(selectedField !== undefined) {
        if(selectedRole !== undefined) {
          const query = {
            bool: selectedBool,
            field: selectedField,
            role: selectedRole.code,
            value: value
          };
          setQuery(query, index + 1);
          } else {
            const query = {
              bool: selectedBool,
              field: selectedField,
              value: value
            };
            console.log(query);
            setQuery(query, index + 1);
          }
        }
      }, [value, selectedField, selectedRole, selectedBool, setQuery, index]);

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
        <div className="query-clause">
            <div className="bool">
                <Dropdown
                    className="query-drop"
                    placeholder="Boolean"
                    options={boolItems}
                    value={selectedBool}
                    onChange={(e) => setSelectedBool(e.value)}
                    showClear
                />
            </div>
        <div className="term">
            <div className="inputTitle">Term(s)</div> 
            <AutoComplete 
              className="query-drop"
              placeholder="Term(s)"
              dropdown
              forceSelection={false}
              value={value} 
              suggestions={filteredSuggestions} 
              completeMethod={searchSuggestions} 
              onChange={setAutoComplete}
            />
          </div>
          <div className="fields">
            <div className = "inputTitle">Field</div>
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
          { (table === "Document" && (selectedField === "Person" || selectedField === "Place" || selectedField === "First Name" || selectedField === "Middle Name" || selectedField === "Last Name")) && 
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
    );
}

