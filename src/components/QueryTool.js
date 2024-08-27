import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './QueryTool.css';

const QueryTool = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tables, setTables] = useState([]);
  const [joins, setJoins] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([{ column: {}, table: {}, alias: '' }]);
  const [selectedTables, setSelectedTables] = useState([{ table: {}, alias: '' }]);
  const [selectedJoins, setSelectedJoins] = useState([{}]);
  const [whereClauses, setWhereClauses] = useState([{ column: {}, operator: '=', value: '' }]);

  useEffect(() => {
    // Fetch available columns and tables from your API or define them statically
    setColumns([
      { label: 'Column1', value: 'column1' },
      { label: 'Column2', value: 'column2' }
      // Add more columns as needed
    ]);

    setTables([
      { label: 'altkeyword', value: 'altkeyword' },
      { label: 'altoccupation', value: 'altoccupation' },
      { label: 'altorganization', value: 'altorganization' },
      { label: 'altperson', value: 'altperson' },
      { label: 'altplace', value: 'altplace' },
      { label: 'altreligion', value: 'altreligion' },
      { label: 'document', value: 'document' },
      { label: 'documentedit', value: 'documentedit' },
      { label: 'documenttype', value: 'documenttype' },
      { label: 'failed_insert_log', value: 'failed_insert_log' },
      { label: 'file_type', value: 'file_type' },
      { label: 'import_pp', value: 'import_pp' },
      { label: 'individualnotification', value: 'individualnotification' },
      { label: 'keyword', value: 'keyword' },
      { label: 'keyword2document', value: 'keyword2document' },
      { label: 'language', value: 'language' },
      { label: 'libraryofcongress', value: 'libraryofcongress' },
      { label: 'libraryofcongress2doc', value: 'libraryofcongress2doc' },
      { label: 'mentions', value: 'mentions' },
      { label: 'mentiontype', value: 'mentiontype' },
      { label: 'mention_nodes', value: 'mention_nodes' },
      { label: 'notification', value: 'notification' },
      { label: 'occupationtype', value: 'occupationtype' },
      { label: 'organization', value: 'organization' },
      { label: 'organization2document', value: 'organization2document' },
      { label: 'organization2religion', value: 'organization2religion' },
      { label: 'pdf_documents', value: 'pdf_documents' },
      { label: 'person', value: 'person' },
      { label: 'person2document', value: 'person2document' },
      { label: 'person2occupation', value: 'person2occupation' },
      { label: 'person2organization', value: 'person2organization' },
      { label: 'person2religion', value: 'person2religion' },
      { label: 'place', value: 'place' },
      { label: 'place2document', value: 'place2document' },
      { label: 'prefix_std', value: 'prefix_std' },
      { label: 'relatedletters', value: 'relatedletters' },
      { label: 'relationship', value: 'relationship' },
      { label: 'relationshiptype', value: 'relationshiptype' },
      { label: 'religion', value: 'religion' },
      { label: 'repository', value: 'repository' },
      { label: 'request', value: 'request' },
      { label: 'role', value: 'role' },
      { label: 'suffix_std', value: 'suffix_std' },
      { label: 'users', value: 'users' }
    ]);

    setJoins([
      { label: 'INNER JOIN', value: 'INNER JOIN' },
      { label: 'LEFT JOIN', value: 'LEFT JOIN' },
      { label: 'RIGHT JOIN', value: 'RIGHT JOIN' }
      // Add more join types as needed
    ]);
  }, []);

  const handleQuerySubmit = async () => {
    try {
      const response = await fetch('http://localhost:4000/custom-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: selectedColumns.map(col => ({
            column: col.column.value,
            table: col.table.value,
            alias: col.alias
          })), // Use selected columns, tables, and aliases
          tables: selectedTables.map(tbl => ({
            table: tbl.table.value,
            alias: tbl.alias
          })), // Use selected tables and aliases
          joins: selectedJoins.map(join => join.value), // Use selected joins
          whereClauses: whereClauses.map(clause => ({
            column: clause.column.value,
            operator: clause.operator,
            value: clause.value
          })) // Use where clauses
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to run query:', error);
      setResult({ error: 'Failed to run query' });
    }
  };

  const addColumnDropdown = () => {
    setSelectedColumns([...selectedColumns, { column: {}, table: {}, alias: '' }]);
  };

  const addTableDropdown = () => {
    setSelectedTables([...selectedTables, { table: {}, alias: '' }]);
    setSelectedJoins([...selectedJoins, {}]);
  };

  const addWhereClause = () => {
    setWhereClauses([...whereClauses, { column: {}, operator: '=', value: '' }]);
  };

  const removeColumn = (index) => {
    const newColumns = [...selectedColumns];
    newColumns.splice(index, 1);
    setSelectedColumns(newColumns);
  };

  const removeTable = (index) => {
    const newTables = [...selectedTables];
    newTables.splice(index, 1);
    setSelectedTables(newTables);
    const newJoins = [...selectedJoins];
    newJoins.splice(index - 1, 1);
    setSelectedJoins(newJoins);
  };

  const removeWhereClause = (index) => {
    const newClauses = [...whereClauses];
    newClauses.splice(index, 1);
    setWhereClauses(newClauses);
  };

  return (
    <div className='query-tool-card'>
      <h1>Query Tool</h1>
      <h3>Select the table(s) you would like to select from:</h3>
      {selectedTables.map((table, index) => (
        <div key={index}>
          <Dropdown
            className='dropdown'
            value={table.table}
            options={tables}
            onChange={e => {
              const newTables = [...selectedTables];
              newTables[index] = { ...newTables[index], table: e.value };
              setSelectedTables(newTables);
            }}
            placeholder='Select Table'
          />
          <InputText
            className='input'
            type='text'
            value={table.alias}
            onChange={e => {
              const newTables = [...selectedTables];
              newTables[index] = { ...newTables[index], alias: e.target.value };
              setSelectedTables(newTables);
            }}
            placeholder='Alias'
          />
          {index > 0 && (
            <Dropdown
              className='dropdown'
              value={selectedJoins[index - 1]}
              options={joins}
              onChange={e => {
                const newJoins = [...selectedJoins];
                newJoins[index - 1] = e.value;
                setSelectedJoins(newJoins);
              }}
              placeholder='Select Join'
            />
          )}
          <Button onClick={() => removeTable(index)}>- Remove Table</Button>
        </div>
      ))}
      <Button onClick={addTableDropdown}>+ Add Table</Button>
      {selectedColumns.map((col, index) => (
        <div key={index}>
          <Dropdown
            className='dropdown'
            value={col.column}
            options={columns}
            onChange={e => {
              const newColumns = [...selectedColumns];
              newColumns[index] = { ...newColumns[index], column: e.value };
              setSelectedColumns(newColumns);
            }}
            placeholder='Select Column'
          />
          <InputText
            className='input'
            type='text'
            value={col.alias}
            onChange={e => {
              const newColumns = [...selectedColumns];
              newColumns[index] = { ...newColumns[index], alias: e.target.value };
              setSelectedColumns(newColumns);
            }}
            placeholder='Alias'
          />
          <Button onClick={() => removeColumn(index)}>- Remove Column</Button>
        </div>
      ))}
      <Button onClick={addColumnDropdown}>+ Add Column</Button>
      {whereClauses.map((clause, index) => (
        <div key={index}>
          <Dropdown
            className='dropdown'
            value={clause.column}
            options={columns}
            onChange={e => {
              const newClauses = [...whereClauses];
              newClauses[index] = { ...newClauses[index], column: e.value };
              setWhereClauses(newClauses);
            }}
            placeholder='Select Column'
          />
            <InputText
                className='input'
                type='text'
                value={clause.operator}
                onChange={e => {
                const newClauses = [...whereClauses];
                newClauses[index] = { ...newClauses[index], operator: e.target.value };
                setWhereClauses(newClauses);
                }}
                placeholder='Operator'
            />

            <InputText
                className='input'
                type='text'
                value={clause.value}
                onChange={e => {
                const newClauses = [...whereClauses];
                newClauses[index] = { ...newClauses[index], value: e.target.value };
                setWhereClauses(newClauses);
                }}
                placeholder='Value'

            />

            <Button onClick={() => removeWhereClause(index)}>- Remove Where Clause</Button>

        </div>
        ))}
        <Button onClick={addWhereClause}>+ Add Where Clause</Button>
        <Button onClick={handleQuerySubmit}>Run Query</Button>

        {result && !result.error && (
        <DataTable value={result}>
            {selectedColumns.map((col, index) => (
            <Column key={index} field={col.alias || col.column.value} header={col.alias || col.column.label} />
            ))}
        </DataTable>
        )}

        {result && result.error && <div>Error: {result.error}</div>}
    </div>
    );
}

export default QueryTool;
