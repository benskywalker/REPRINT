import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

export default function LetterTable({ nodeData }) {
    const [documents, setDocuments] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);

    useEffect(() => {
        if (nodeData && nodeData.data && nodeData.data.documents) {
            setDocuments(nodeData.data.documents);
        }
    }, [nodeData]); // Ensure this dependency array is correct

    const renderHeader = () => {
        return (
            <div className="table-header">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Global Search"
                    />
                </span>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <div>
            <DataTable
                value={documents}
                paginator
                rows={10}
                responsiveLayout="scroll"
                globalFilter={globalFilter}
                header={header}
            >
                <Column
                    field="senderFullName"
                    header="Sender"
                    sortable
                    filter
                    filterPlaceholder="Search by sender"
                ></Column>
                <Column
                    field="receiverFullName"
                    header="Receiver"
                    sortable
                    filter
                    filterPlaceholder="Search by receiver"
                ></Column>
                <Column
                    field="documentID"
                    header="Document ID"
                    sortable
                    filter
                    filterPlaceholder="Search by document ID"
                ></Column>
                <Column
                    field="date"
                    header="Date"
                    sortable
                    filter
                    filterPlaceholder="Search by date"
                    body={(rowData) => (rowData.date ? rowData.date : 'Date not Found')}
                ></Column>
            </DataTable>
        </div>
    );
}