import React, {useEffect, useState} from "react";

import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";

const columnCommands = [
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
    { label: "Middle Name", value: "middleName" },
    { label: "Full Name", value: "fullName" },
    { label: "Biography", value: "biography" },
    { label: "Gender", value: "gender" },
    { label: "Start Date", value: "sd" },
    { label: "End Date", value: "ed" },
    { label: "Standard Name", value: "sn"},
    { label: "Collection", value: "collection" },
    { label: "Abstract", value: "abstract" },
    { label: "Research Notes", value: "researchNotes" },
    { label: "Language", value: "language_id" },
    { label: "Date", value: "date" },
];

const operatorCommands = [
    { label: "Like", value: "like" },
    { label: "Not Like", value: "not like" },
    { label: "Equal to", value: "=" },
    { label: "Not Equal to", value: "!=" },
    { label: "Greater Than", value: ">" },
    { label: "Less Than", value: "<" },
    { label: "Greater Than or Equal to", value: ">=" },
    { label: "Less Than or Equal to", value: "<=" },
];

export const QueryClause = ({ setQuery, index, suggestions }) => {
    const [column, setColumn] = useState(null);
    const [operator, setOperator] = useState(null);
    const [value, setValue] = useState("");

    const getQuery = () => {
        const columnValue = [];
        switch(column) {
            case "sn":
                columnValue.push("personStdName");
                break;
            case "sd":
                columnValue.push("birthDate");
                columnValue.push("formationDate");
                break;
            case "ed":
                columnValue.push("deathDate");
                columnValue.push("dissolutionDate");
                break;
            default:
                columnValue.push(column);
                break;
        }

        let queries = [];
        columnValue.map((column) => {
            queries.push({
                column: column,
                operator: operator,
                value: value
            })
        })

        setQuery(queries, index);
    };

    useEffect(() => {
        getQuery();
    }, [column, operator, value]);

    const onColumnChange = (e) => {
        setColumn(e.value);
    };

    const onOperatorChange = (e) => {
        setOperator(e.value);
    };

    const onValueChange = (e) => {
        setValue(e.target.value);
    };

    const searchSuggestions = (e) => {
        console.log(e);
        const query = e.query;
        let filteredSuggestions = suggestions.filter((suggestion) => {
            return suggestion.toLowerCase().startsWith(query.toLowerCase());
        });

        return filteredSuggestions;
    };


    return (
        <div>
            <Dropdown 
                placeholder="Column" 
                value={column} 
                options={columnCommands} 
                onChange={onColumnChange}
            />
            <Dropdown 
                placeholder="Operator" 
                value={operator} 
                options={operatorCommands} 
                onChange={onOperatorChange}
            />
            <AutoComplete 
                placeholder="Value" 
                value={value} 
                suggestions={suggestions} 
                completeMethod={searchSuggestions} 
                onChange={onValueChange}
            />
        </div>
    );
}

