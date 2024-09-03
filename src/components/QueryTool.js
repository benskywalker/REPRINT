import React from "react";

import axios from "axios";

import { AutoComplete } from "primereact/autocomplete";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const QueryTool = () => {
  const [keywords, setKeywords] = React.useState(null);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState(null);
  const [results, setResults] = React.useState(null);

  const suggestions = [
    {
      label: "Name",
      code: "n",
      items: [
        { keyword: "Pemberton", value: "pemberton"},
        { keyword: "Harrison", value: "harrison"},
        { keyword: "Allcock", value: "allcock"},
      ]
    },
    {
      label: "Religion",
      code: "r",
      items: [
        { keyword: "Anabaptist", value: "anabaptist"},
        { keyword: "Quaker", value: "quaker"},
        { keyword: "Pietist", value: "pietist"},
      ]
    },
    {
      label: "Location",
      code: "l",
      items: [
        { keyword: "Pennsylvania", value: "pennsylvania"},
        { keyword: "New Jersey", value: "new jersey"},
        { keyword: "New York", value: "new york"},
      ]
    },
    {
      label: "Event",
      code: "e",
      items: [
        { keyword: "marriage", value: "marriage"},
        { keyword: "birth", value: "birth"},
        { keyword: "death", value: "death"},
      ]
    },
    {
      label: "Relationship",
      code: "r",
      items: [
        { keyword: "parent", value: "parent"},
        { keyword: "child", value: "child"},
        { keyword: "spouse", value: "spouse"},
      ]
    }
  ];

  const search = (event) => {
    let query = event.query;
    let _filteredKeywords = [];

    for (let type of suggestions) {
        let filteredKeywords = type.items.filter((item) => item.keyword?.toLowerCase().indexOf(query.toLowerCase()) !== -1);
        if (filteredKeywords && filteredKeywords.length) {
            _filteredKeywords.push({ ...type, ...{ items: filteredKeywords } });
        }
    }
    setFilteredSuggestions(_filteredKeywords);
}

  return (
    <div>
      <AutoComplete
        group
        multiple
        value={keywords}
        suggestions={filteredSuggestions}
        field="keyword"
        placeholder="Enter a query"
        completeMethod={search}
        onChange={(e) => setKeywords(e.value)}
        optionGroupLabel="label"
        optionGroupChildren="items"
        dropdown
      />
      <DataTable value={results}>
        <Column field="name" header="Name" />
      </DataTable>

    </div>
  )
}

export default QueryTool;
