import React, { useRef, useState, useEffect } from "react";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { useFields } from './hooks/useFields';
import { useTableHistory } from './hooks/useTableHistory';
import { useQueryData } from './hooks/useQueryData';
import { useExpandableText } from './hooks/useExpandableText';
import QueryTabs from './components/QueryTabs';
import HelpPanel from './components/HelpPanel';
import './styles/QueryTool.css';

const QueryTool = () => {
  const toast = useRef(null);
  const op = useRef(null);
  const previousIndex = useRef(0);

  const {
    fields,
    filteredFields,
    selectedView,
    currentTable,
    updateFields,
    setSelectedView,
    setCurrentTable
  } = useFields(toast);

  const { tableHistory, pushToHistory, goBack } = useTableHistory();
  const {
    queryData,
    setQueryData,
    loading,
    graphData,
    setGraphData,
    fetchData
  } = useQueryData(toast);
  const { truncateText } = useExpandableText();

  const [activeIndex, setActiveIndex] = useState(0);
  const [sections, setSections] = useState([{ id: Date.now(), selectedValue: "" }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState([]);

  const hasValidQuery = sections.some(section => 
    section.selectedField && 
    section.selectedParameter && 
    section.selectedValue
  );

  useEffect(() => {
    if (filteredFields.length > 0) {
      setVisibleColumns(filteredFields);
    }
  }, [filteredFields]);

  const onFilter = (e) => {
    setFilters(e.filters);
    sessionStorage.setItem("query-tool-filters", JSON.stringify(e.filters));
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    sessionStorage.setItem("query-tool-globalFilter", value);
  };

  const onColumnToggle = (event) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = filteredFields.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    );
    setVisibleColumns(orderedSelectedColumns);
  };

  const handleButtonClick = async (rowData, entityType, currentTable) => {
    try {
      const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
      let table1;
      let body;

      switch (currentTable) {
        case "person":
          table1 = currentTable + "2" + entityType;
          if (entityType === "document") {
            body = {
              tables: [table1, entityType],
              fields: ["docID", currentTable + "ID"],
              operators: ["="],
              values: [rowData.personID],
              dependentFields: [entityType + "ID"],
            };
          } else {
            body = {
              tables: [table1, entityType],
              fields: [entityType + "ID", currentTable + "ID"],
              operators: ["="],
              values: [rowData.personID],
              dependentFields: [entityType + "ID"],
            };
          }
          break;
        case "organization":
          if (entityType === "person") {
            table1 = entityType + "2" + currentTable;
            body = {
              tables: [table1, entityType],
              fields: [entityType + "ID", currentTable + "ID"],
              operators: ["="],
              values: [rowData.organizationID],
              dependentFields: [entityType + "ID"],
            };
          } else if (entityType === "document") {
            table1 = currentTable + "2" + entityType;
            body = {
              tables: [table1, entityType],
              fields: ["docID", currentTable + "ID"],
              operators: ["="],
              values: [rowData.organizationID],
              dependentFields: [entityType + "ID"],
            };
          } else {
            table1 = currentTable + "2" + entityType;
            body = {
              tables: [table1, entityType],
              fields: [entityType + "ID", currentTable + "ID"],
              operators: ["="],
              values: [rowData.organizationID],
              dependentFields: [entityType + "ID"],
            };
          }
          break;
        case "religion":
          table1 = entityType + "2" + currentTable;
          body = {
            tables: [table1, entityType],
            fields: [entityType + "ID", currentTable + "ID"],
            operators: ["="],
            values: [rowData.religionID],
            dependentFields: [entityType + "ID"],
          };
          break;
        case "document":
          table1 = entityType + "2" + currentTable;
          body = {
            tables: [table1, entityType],
            fields: [entityType + "ID", "docID"],
            operators: ["="],
            values: [rowData.documentID],
            dependentFields: [entityType + "ID"],
          };
          break;
        default:
          body = null;
      }

      const { response } = await fetchData(body, baseExpressUrl);

      if (response?.data.rows.length > 0) {
        pushToHistory({
          queryData,
          selectedView,
          currentTable,
          visibleColumns,
          filters,
          globalFilter,
        });

        setQueryData(response.data.rows);
        setSelectedView(entityType);
        setCurrentTable(entityType);
      } else {
        toast.current.show({
          severity: "info",
          summary: "No Results",
          detail: `No ${entityType} found for this ${currentTable}`,
          life: 3000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while fetching data.",
        life: 3000,
      });
    }
  };

  const renderHeader = () => {
    return (
      <div className="table-header">
        {tableHistory.length > 0 && (
          <button
            className="back-button mr-4"
            onClick={goBack}
            aria-label="Go Back"
            title="Go Back"
          >
            <i className="left-arrow pi pi-arrow-left"></i>
            Previous Table
          </button>
        )}
        <span className="p-input-icon-left">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              type="search"
              value={globalFilter}
              onChange={onGlobalFilterChange}
              placeholder="Global Search"
            />
          </IconField>
        </span>

        <MultiSelect
          value={visibleColumns}
          options={filteredFields}
          optionLabel="field"
          onChange={onColumnToggle}
          className="w-full sm:w-20rem ml-4"
        />
      </div>
    );
  };
  const addNewSection = () => {
    setSections([...sections, { id: Date.now(), selectedValue: "" }]);
  };

  const removeSection = (id) => {
    if (sections.length === 1 || sections[0].id === id) {
      return;
    }
    setSections(sections.filter((section) => section.id !== id));
  };

  const onTabChange = async (e) => {
    const newIndex = e.index;
    const oldIndex = previousIndex.current;

    if ((oldIndex === 0 && newIndex === 3) || (oldIndex === 0 && newIndex === 1)) {


      const hasValidQuery = sections.every(section =>
        section.selectedField &&
        section.selectedParameter &&
        section.selectedValue
      );

      console.log('hasValidQuery: ', hasValidQuery);


      const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
      const body = {
        tables: [selectedView],
        fields: sections.map(section => section.selectedField?.field).filter(Boolean),
        operators: sections.map(section =>
          section.selectedParameter ? {
            equals: "=",
            not_equals: "!=",
            like: "LIKE",
            not_like: "NOT LIKE",
            greater_than: ">",
            less_than: "<",
            greater_than_or_equal: ">=",
            less_than_or_equal: "<=",
          }[section.selectedParameter] : null
        ).filter(Boolean),
        values: sections.map(section => section.selectedValue).filter(Boolean),
        dependentFields: sections.map(section => section.selectedAction).filter(Boolean),
      };

      if (hasValidQuery) {
        try {
          const { response, graphResults, error } = await fetchData(body, baseExpressUrl);

          if (error) {
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "Failed to fetch data. Please try again.",
              life: 3000,
            });
            return;
          }

          if (response?.data.rows.length > 0) {
            pushToHistory({
              queryData,
              selectedView,
              currentTable,
              visibleColumns: filteredFields,
              filters: null,
              globalFilter: "",
            });
            setQueryData(response.data.rows);
            setVisibleColumns(filteredFields);
            if (graphResults) {
              setGraphData(graphResults);
            }
          } else {
            toast.current.show({
              severity: "info",
              summary: "No Results",
              detail: `No results found for your query.`,
              life: 3000,
            });
          }
        } catch (error) {
          console.error('Error during fetch:', error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "An error occurred while fetching data.",
            life: 3000,
          });
        }
      }
    }

    setActiveIndex(newIndex);
    previousIndex.current = newIndex;
  };

  return (
    <div className="query-tool-container">
      <Toast ref={toast} />
      <div className="title-container">
        <h1>Query Tool</h1>
      </div>

      <QueryTabs
        activeIndex={activeIndex}
        onTabChange={onTabChange}
        addNewSection={addNewSection}
        removeSection={removeSection}
        selectedView={selectedView}
        currentTable={currentTable}
        updateFields={updateFields}
        sections={sections}
        setSections={setSections}
        filteredFields={filteredFields}
        queryData={queryData}
        loading={loading}
        graphData={graphData}
        globalFilter={globalFilter}
        filters={filters}
        onFilter={onFilter}
        handleButtonClick={handleButtonClick}
        truncateText={truncateText}
        header={renderHeader()}
        visibleColumns={visibleColumns}
        hasValidQuery={hasValidQuery}
      />

      <HelpPanel op={op} />
    </div>
  );
};

export default QueryTool;