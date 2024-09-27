import React, {useEffect, useState} from "react";

import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";

export const QueryClause = ({ setQuery, index, suggestions, fields }) => {
    const [value, setValue] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [selectedField, setSelectedField] = useState();
    const [selectedRole, setSelectedRole] = useState();
    const [selectedBool, setSelectedBool] = useState();
    const [roleItems, setRoleItems] = useState([]);

    const boolItems = [
        { label: "AND", value: "AND" },
        { label: "OR", value: "OR" }
    ];

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
        }
        const createQuery = () => {
            if(selectedField !== undefined) {
                const query = {
                    bool: selectedBool,
                    field: selectedField.code,
                    value: value,
                    role: selectedRole
                };
                setQuery(query, index + 1);
            }
        };

        createQuery();
    }, [selectedField, selectedBool, value, selectedRole, setQuery, index]);

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
              multiple
              dropdown
              forceSelection={false}
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
    );
}

