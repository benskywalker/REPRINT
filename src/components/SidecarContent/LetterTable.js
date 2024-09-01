import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from 'docx';
import { Toolbar } from 'primereact/toolbar';
import { InputIcon } from 'primereact/inputicon';
import { IconField } from 'primereact/iconfield';
import './LettersTable.css';

export default function LetterTable({ nodeData, onRowClick }) {
    const [data, setData] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null); 
    const dt = useRef(null);

    useEffect(() => {
        if (nodeData && nodeData.data && nodeData.data.documents) {
            setDocuments(nodeData.data.documents);
        }
    }, [nodeData]);
const renderHeader = () => {
    const leftContents = (
        <span className="p-input-icon-left">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"> </InputIcon>
                <InputText 
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Global Search"
                />
            </IconField>
        </span>
    );

    const rightContents = (
        <>
            <Button label="Download PDF" icon="pi pi-file-pdf" onClick={downloadPDF} className="p-button-danger"   style={{ width: '150px' ,marginRight:'8px'}} />
            <Button label="Download Excel" icon="pi pi-file-excel" onClick={downloadExcel} className="p-button-success"   style={{ width: '150px' ,marginRight:'8px'}} />
            <Button label="Download Word" icon="pi pi-file-word" onClick={downloadWord} className="p-button-primary"   style={{ width: '150px', marginRight:'8px' }} />
        </>
    );

    return (
        <Toolbar left={leftContents} right={rightContents} />
    );
};

    const getFilteredData = () => {
        // Retrieve the filtered data from the DataTable
        return dt.current ? dt.current.filteredValue || documents : documents;
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Sender", "Receiver", "Document ID", "Date"];
        const tableRows = [];

        getFilteredData().forEach(doc => {
            const docData = [
                doc.senderFullName,
                doc.receiverFullName,
                doc.documentID,
                doc.date || 'Date not Found'
            ];
            tableRows.push(docData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Document Table", 14, 15);
        doc.save('table.pdf');
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getFilteredData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'table.xlsx');
    };

    const downloadWord = () => {
        const table = new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('Sender')] }),
                        new TableCell({ children: [new Paragraph('Receiver')] }),
                        new TableCell({ children: [new Paragraph('Document ID')] }),
                        new TableCell({ children: [new Paragraph('Date')] }),
                    ],
                }),
                ...getFilteredData().map(doc => new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(doc.senderFullName || '')] }),
                        new TableCell({ children: [new Paragraph(doc.receiverFullName || '')] }),
                        new TableCell({ children: [new Paragraph(doc.documentID || '')] }),
                        new TableCell({ children: [new Paragraph(doc.date || 'Date not Found')] }),
                    ],
                })),
            ],
        });

        const doc = new Document({
            sections: [{ children: [table] }],
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'table.docx');
        });
    };

    const header = renderHeader();

    
    const handleRowClick = (e) => {
        if (typeof onRowClick === 'function') {
            onRowClick(e.data);
        } else {
            console.error('onRowClick is not a function');
        }
    };
    return (
        <div>
            <DataTable
                ref={dt}
                value={documents}
                paginator
                rows={10}
                responsiveLayout="scroll"
                globalFilter={globalFilter}
                header={header}
                onRowClick={handleRowClick}
                className="custom-datatable"
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
