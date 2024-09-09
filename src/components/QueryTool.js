import React, { useState, useEffect } from "react";
import axios from "axios";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { FilterMatchMode, FilterOperator } from "primereact/api";

import "./QueryTool.css";

const QueryTool = () => {
  const [people, setPeople] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    birthDate: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    deathDate: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    gender: { value: null, matchMode: FilterMatchMode.EQUALS },
});
  const [loading, setLoading] = useState(true);

const onGlobalFilterChange = (e) => {
  const value = e.target.value;
  let _filters = { ...filters };

  _filters['global'].value = value;

  setFilters(_filters);
  setGlobalFilterValue(value);
  console.log(filters);
};

  useEffect(() => {
    const getPeople = async () => {
      const response = await axios.get("http://localhost:4000/persons");
      setPeople(response.data);
      setLoading(false);
    };

    getPeople();
  }, []);

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  people.map((person) => {
    person.name = capitalize(person.firstName) + " " + capitalize(person.lastName);
  })

  const peopleColumns = [
    { field : "name", header : "Name" },
    { field : "birthDate", header : "DOB" },
    { field : "deathDate", header : "DOD" },
    { field : "gender", header : "Gender"},
  ];

  const globalFilterFields = ['name'];

  const renderHeader = () => {
    return (
        <div className="flex justify-content-end">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
            </IconField>
        </div>
    );
}

  const header = renderHeader();

  return (
     <DataTable 
        value = {people}
        dataKey = 'personID'
        filter = {filters} 
        filterDisplay="row" 
        paginator 
        rows={20} 
        header = {header} 
        size = "small" 
        tableStyle={{ minWidth: '50rem' }} 
        showGridlines 
        globalFilterFields={globalFilterFields} 
        loading = {loading}
      >
        {peopleColumns.map((col, i) => (
          <Column key = {i} filter field = {col.field} filterField = {col.field} header = {col.header} sortable />
        ))}
     </DataTable>
   );
};

export default QueryTool;
