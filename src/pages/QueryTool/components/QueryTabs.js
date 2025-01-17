import React from 'react';
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import QuerySection from './QuerySection';
import ResultsTable from './ResultsTable';
import QueryGraph from '../../../components/querytool/QueryGraph';
import { views } from '../Constants';
import '../styles/QueryTabs.css';

const QueryTabs = ({
  activeIndex,
  onTabChange,
  selectedView,
  currentTable,
  updateFields,
  sections,
  setSections,
  filteredFields,
  queryData,
  loading,
  graphData,
  globalFilter,
  filters,
  onFilter,
  handleButtonClick,
  truncateText,
  header,
  visibleColumns
}) => {
  return (
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
            tooltip="Select a table to search for"
            value={selectedView}
            onChange={updateFields}
            options={views}
            optionLabel="label"
            placeholder="Parameters"
            filter
            className="w-full md:w-14rem"
          />
        </div>
        {sections.map((section, index) => (
          <QuerySection
            key={section.id}
            section={section}
            index={index}
            filteredFields={filteredFields}
            sections={sections}
            setSections={setSections}
          />
        ))}
      </TabPanel>

      <TabPanel header="Network" leftIcon="pi pi-user mr-2">
        <QueryGraph
          nodesUrl={process.env.REACT_APP_BASEEXPRESSURL + "nodes-query"}
          edgesUrl={process.env.REACT_APP_BASEEXPRESSURL + "edges-query"}
          body={{
            tables: [selectedView],
            fields: sections.map(section => 
              section.selectedField ? section.selectedField.field : null
            ),
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
            ),
            values: sections.map(section => section.selectedValue),
            dependentFields: sections.map(section => section.selectedAction),
          }}
        />
      </TabPanel>

      <TabPanel header="Map" leftIcon="pi pi-map-marker mr-2">
        <iframe
          title="Map"
          style={{ width: "100%", height: "80vh" }}
          src="https://chdr.cs.ucf.edu/print_map"
          allowFullScreen
          loading="lazy"
        />
      </TabPanel>

      <TabPanel header="Table" leftIcon="pi pi-table mr-2">
        <ResultsTable
          loading={loading}
          queryData={queryData}
          visibleColumns={visibleColumns}
          globalFilter={globalFilter}
          filters={filters}
          onFilter={onFilter}
          selectedView={selectedView}
          currentTable={currentTable}
          handleButtonClick={handleButtonClick}
          truncateText={truncateText}
          header={header}
        />
      </TabPanel>
    </TabView>
  );
};

export default QueryTabs;