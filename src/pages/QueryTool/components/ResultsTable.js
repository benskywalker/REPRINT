import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { relatedEntitiesMap } from '../Constants';
import '../styles/ResultsTable.css';

const ResultsTable = ({
  loading,
  queryData,
  visibleColumns,
  globalFilter,
  filters,
  onFilter,
  selectedView,
  currentTable,
  handleButtonClick,
  truncateText,
  header
}) => {
  if (loading) {
    return (
      <div className="spinner-wrapper">
        <ProgressSpinner />
      </div>
    );
  }

  if (!queryData || !visibleColumns) return null;

  return (
    <DataTable
      value={queryData}
      size="small"
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
      scrollHeight="45vh"
      resizableColumns
      reorderableColumns
      globalFilter={globalFilter}
      filters={filters}
      onFilter={onFilter}
    >
      {visibleColumns.slice(0, 3).map((fieldObj, index) => (
        <Column
          key={index}
          field={fieldObj.field}
          header={fieldObj.field}
          sortable
          filter
          filterPlaceholder={`Search by ${fieldObj.field}`}
          body={(rowData) => (
            <span>
              {truncateText(
                rowData[fieldObj.field],
                rowData.id,
                fieldObj.field
              )}
            </span>
          )}
        />
      ))}

      {relatedEntitiesMap[selectedView]?.map((entity, index) => (
        <Column
          key={`related-${index}`}
          header={entity.charAt(0).toUpperCase() + entity.slice(1)}
          body={(rowData) => (
            <span
              className="action-link"
              onClick={() =>
                handleButtonClick(rowData, entity, currentTable)
              }
            >
              {entity.charAt(0).toUpperCase() + entity.slice(1)}
            </span>
          )}
        />
      ))}

      {visibleColumns.slice(3).map((fieldObj, index) => (
        <Column
          key={index + 3}
          field={fieldObj.field}
          header={fieldObj.field}
          sortable
          filter
          filterPlaceholder={`Search by ${fieldObj.field}`}
          body={(rowData) => (
            <span>
              {truncateText(
                rowData[fieldObj.field],
                rowData.id,
                fieldObj.field
              )}
            </span>
          )}
        />
      ))}
    </DataTable>
  );
};

export default ResultsTable;