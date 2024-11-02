import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "./QueryTool.css";
import { TabView, TabPanel } from "primereact/tabview";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import { ToggleButton } from "primereact/togglebutton";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { MultiSelect } from "primereact/multiselect";
import QueryGraph from "../../components/querytool/QueryGraph";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";

const QueryTool = () => {
  const [value, setValue] = useState([20, 80]);
  const op = useRef(null);
  const [checked, setChecked] = useState(true);
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [selectedView, setSelectedView] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [splitButtonLabel, setSplitButtonLabel] = useState("In");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sections, setSections] = useState([
    { id: Date.now(), selectedValue: "" },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const previousIndex = useRef(0);
  const [queryData, setQueryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState(null);
  const [currentTable, setCurrentTable] = useState("person");

  const [views, setViews] = useState([
    { label: "Person", value: "person" },
    { label: "Organization", value: "organization" },
    { label: "Place", value: "place" },
    { label: "Religion", value: "religion" },
    { label: "Document", value: "document" },
  ]);

  const boolItems = [
    { label: "Equals", value: "equals" },
    { label: "Not Equals", value: "not_equals" },
    { label: "Like", value: "like" },
    { label: "Not Like", value: "not_like" },
    { label: "Greater Than", value: "greater_than" },
    { label: "Less Than", value: "less_than" },
    { label: "Greater Than or Equal", value: "greater_than_or_equal" },
    { label: "Less Than or Equal", value: "less_than_or_equal" },
  ];

  const actionItems = [
    { label: "And", value: "and" },
    { label: "Or", value: "or" },
    { label: "Else", value: "else" },
    { label: "Remove", value: "remove" },
  ];

  const relatedEntitiesMap = {
    person: ["document", "religion", "organization"],
    organization: ["person", "religion", "document"],
    religion: ["person", "organization"],
    document: ["person", "organization"],
  };

  const handleButtonClick = async (rowData, entityType, currentTable) => {
    try {
      setLoading(true);
      const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
      let table1;

      // Determine the appropriate filter field based on the entity type
      let body;

      switch (currentTable) {
        case "person":
          console.log("Person: ");
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

      console.log("Body", body);
      const response = await axios.post(`${baseExpressUrl}knex-query`, body);
      setQueryData(response.data[0]);
      setSelectedView(entityType);
      setCurrentTable(currentTable);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const actionBodyTemplate = (rowData) => {
    const relatedEntities = relatedEntitiesMap[selectedView] || [];
    return relatedEntities.map((entity, index) => (
      <Column
        key={index}
        header={entity.charAt(0).toUpperCase() + entity.slice(1)}
        body={(rowData) => (
          <span
            style={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => handleButtonClick(rowData, entity, currentTable)}
          >
            {entity.charAt(0).toUpperCase() + entity.slice(1)}
          </span>
        )}
      />
    ));
  };

  const updateFilteredFields = () => {
    let filtered = [];
    if (selectedView === "person") {
      filtered = fields.filter((view) => view.view === "person");
    } else if (selectedView === "organization") {
      filtered = fields.filter((view) => view.view === "organization");
    } else if (selectedView === "place") {
      filtered = fields.filter((view) => view.view === "place");
    } else if (selectedView === "religion") {
      filtered = fields.filter((view) => view.view === "religion");
    } else if (selectedView === "document") {
      filtered = fields.filter((view) => view.view === "document");
    }
    setFilteredFields(filtered);
    setVisibleColumns(filtered);
    setSelectedField(null);
    setSplitButtonLabel("In");
  };

  const updateFields = (e) => {
    setSelectedView(e.value);
    setCurrentTable(e.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
        const response = await axios.get(`${baseExpressUrl}query-tool-fields`);
        setFields(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(fields);
  }, [fields]);

  useEffect(() => {
    updateFilteredFields();
    if (selectedView) {
      // Optionally, you can fetch initial data for the selectedView here
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView, fields]);

  const addNewSection = () => {
    setSections([...sections, { id: Date.now(), selectedValue: "" }]);
  };

  const removeSection = (id) => {
    if (sections.length === 1 || sections[0].id === id) {
      return;
    }
    setSections(sections.filter((section) => section.id !== id));
  };

  const onTabChange = (e) => {
    const newIndex = e.index;
    const oldIndex = previousIndex.current;

    // Assuming "Query" is index 0 and "Table" is index 3
    if (oldIndex === 0 && newIndex === 3) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const body = {
            tables: [selectedView],
            fields: sections.map((section) =>
              section.selectedField ? section.selectedField.field : null
            ),
            operators: sections.map((section) =>
              section.selectedParameter
                ? {
                    equals: "=",
                    not_equals: "!=",
                    like: "LIKE",
                    not_like: "NOT LIKE",
                    greater_than: ">",
                    less_than: "<",
                    greater_than_or_equal: ">=",
                    less_than_or_equal: "<=",
                  }[section.selectedParameter]
                : null
            ),
            values: sections.map((section) => section.selectedValue),
            dependentFields: sections.map((section) => section.selectedAction),
          };
          const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL;
          const response = await axios.post(
            `${baseExpressUrl}knex-query`,
            body
          );
          setQueryData(response.data[0]);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }

    setActiveIndex(newIndex);
    previousIndex.current = newIndex;
  };

  useEffect(() => {
    console.log("Query Data Updated:", queryData);
  }, [queryData]);

  useEffect(() => {
    if (filteredFields.length > 0) {
      setVisibleColumns(filteredFields);
    }
  }, [filteredFields]);

  const onColumnToggle = (event) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = filteredFields.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    );
    setVisibleColumns(orderedSelectedColumns);
  };

  const onFilter = (e) => {
    setFilters(e.filters);
    sessionStorage.setItem("query-tool-filters", JSON.stringify(e.filters));
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    sessionStorage.setItem("query-tool-globalFilter", value);
  };

  const renderHeader = () => {
    return (
      <div className="table-header">
        <span className="p-input-icon-left">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search"> </InputIcon>
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
  const header = renderHeader();

  return (
    <div className="query-tool-container">
      <div className="title-container">
        <h1>Query Tool</h1>
      </div>
      <i
        className="pi pi-question-circle help-icon"
        onClick={(e) => op.current.toggle(e)}
      ></i>
      <OverlayPanel
        ref={op}
        appendTo={document.body}
        className="custom-overlay-panel"
      >
        <div>
          <p>Query tool 101 guide here</p>
        </div>
      </OverlayPanel>
      <div className="query-container">
        <TabView
          className="query-tool"
          activeIndex={activeIndex}
          onTabChange={onTabChange}
        >
          <TabPanel
            header="Query"
            leftIcon="pi pi-search mr-2"
            className="query-tab-panel"
          >
            <div className="query-section">
              <h3>Search for:</h3>
              <Dropdown
                tooltip="Message to display"
                value={selectedView}
                onChange={(e) => updateFields(e)}
                options={views}
                optionLabel="label"
                placeholder="Parameters"
                filter
                className="w-full md:w-14rem"
              />
            </div>
            {sections.map((section, index) => (
              <div key={section.id} className="query-section">
                <h3>Where:</h3>
                <div className="query-input">
                  <Dropdown
                    tooltip="Message to display"
                    value={section.selectedField}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[index].selectedField = e.value;
                      setSections(newSections);
                    }}
                    options={filteredFields}
                    optionLabel="field"
                    placeholder="Parameters"
                    filter
                    className="w-full md:w-14rem"
                    disabled={filteredFields?.length === 0}
                  />
                  <Dropdown
                    tooltip="Message to display"
                    value={section.selectedParameter}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[index].selectedParameter = e.value;
                      setSections(newSections);
                    }}
                    options={boolItems}
                    optionLabel="label"
                    placeholder="Parameters"
                    className="w-full md:w-14rem"
                  />
                  <FloatLabel>
                    <InputText
                      tooltip="Tips on what values to put"
                      value={section.selectedValue}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[index].selectedValue = e.target.value;
                        setSections(newSections);
                      }}
                    />
                    <label htmlFor="username">Value</label>
                  </FloatLabel>
                  <Dropdown
                    tooltip="Select Action"
                    value={section.selectedAction}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[index].selectedAction = e.value;
                      setSections(newSections);
                      if (e.value === "and" || e.value === "or") {
                        addNewSection();
                      } else if (e.value === "remove") {
                        removeSection(section.id);
                      }
                    }}
                    options={actionItems}
                    optionLabel="label"
                    placeholder="Select Action"
                    className="w-full md:w-14rem"
                  />
                </div>
              </div>
            ))}

            <div className="query-section">
              <h3>Order by:</h3>
              <div className="query-input">
                <Dropdown
                  tooltip="Message to display"
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.value)}
                  options={filteredFields}
                  optionLabel="field"
                  placeholder="Parameters"
                  filter
                  className="w-full md:w-14rem"
                  disabled={filteredFields?.length === 0}
                />
                <ToggleButton
                  onLabel="Ascending"
                  offLabel="Descending"
                  onIcon="pi pi-arrow-up"
                  offIcon="pi pi-arrow-down"
                  tooltip="Message about order"
                  checked={checked}
                  onChange={(e) => setChecked(e.value)}
                />
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Network" leftIcon="pi pi-user mr-2">
            {loading ? (
              <div className="spinner-wrapper">
                <ProgressSpinner />
              </div>
            ) : (
              queryData && <QueryGraph data={queryData} type={selectedView} />
            )}
          </TabPanel>
          <TabPanel header="Map" leftIcon="pi pi-map-marker mr-2">
            <p className="m-0">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
              aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
              eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci
              velit, sed quia non numquam eius modi.
            </p>
          </TabPanel>
          <TabPanel header="Table" leftIcon="pi pi-table mr-2">
            {loading ? (
              <div className="spinner-wrapper">
                <ProgressSpinner />
              </div>
            ) : (
              queryData && (
                <DataTable
                  value={queryData}
                  size={"small"}
                  style={{ maxWidth: "80vw" }}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  header={header}
                  showGridlines
                  stripedRows
                  scrollable
                  scrollHeight="450px"
                  resizableColumns
                  reorderableColumns
                  globalFilter={globalFilter}
                  filters={filters}
                  onFilter={onFilter}
                >
                  {visibleColumns.map((fieldObj, index) => (
                    <Column
                      key={index}
                      field={fieldObj.field}
                      header={fieldObj.field}
                      sortable
                      filter
                      filterPlaceholder={`Search by ${fieldObj.field}`}
                    />
                  ))}
                  {relatedEntitiesMap[selectedView]?.map((entity, index) => (
                    <Column
                      key={`related-${index}`}
                      header={entity.charAt(0).toUpperCase() + entity.slice(1)}
                      body={(rowData) => (
                        <span
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleButtonClick(rowData, entity, currentTable)
                          }
                        >
                          {entity.charAt(0).toUpperCase() + entity.slice(1)}
                        </span>
                      )}
                    />
                  ))}
                </DataTable>
              )
            )}
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default QueryTool;
