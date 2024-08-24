import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Toolbar } from 'primereact/toolbar';


export default function LetterTable(nodeData) {
    const [data, setData] = useState([]);
    const dt = useRef(null);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        document: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        sender: { value: null, matchMode: FilterMatchMode.IN },
        receiver: { value: null, matchMode: FilterMatchMode.IN },
        date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    });

    
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [senders] = useState([
        'Amy Elsner',
        'Anna Fali',
        'Asiya Javayant',
        'Bernardo Dominic',
        'Elwin Sharvill',
        'Ioni Bowcher',
        'Ivan Magalhaes',
        'Onyama Limba',
        'Stephen Shaw',
        'XuXue Feng'
    ]);
    
    const [receivers] = useState([
        'Amy Elsner',
        'Anna Fali',
        'Asiya Javayant',
        'Bernardo Dominic',
        'Elwin Sharvill',
        'Ioni Bowcher',
        'Ivan Magalhaes',
        'Onyama Limba',
        'Stephen Shaw',
        'XuXue Feng'
    ]);


    const clearFilter = () => {
        const newFilters = { ...filters };
        // newFilters['global'].value = null;
        // newFilters['global'].matchMode = FilterMatchMode.CONTAINS;
        // newFilters['document'].value = null;
        // newFilters['document'].matchMode = FilterMatchMode.STARTS_WITH;
        // newFilters['sender'].value = null;
        // newFilters['sender'].matchMode = FilterMatchMode.IN;
        // newFilters['receiver'].value = null;
        // newFilters['receiver'].matchMode = FilterMatchMode.IN;
        // newFilters['date'].value = null;
        // newFilters['date'].matchMode = FilterMatchMode.DATE_IS;

        // setFilters(sidecarId, newFilters);
        // console.log(filters);
        if (dt.current) {
            dt.current.reset();
        }
        setGlobalFilterValue('');
    };
    const formatDate = (value) => {
        return value.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const senderBodyTemplate = (rowData) => {
        const sender = rowData.sender;

        return (
            <div className="flex align-items-center gap-2">
                <span>{sender}</span>
            </div>
        );
    };

    const senderFilterTemplate = (options) => {
        return (
            <React.Fragment>
                <div className="mb-3 font-bold">Choose the sender</div>
                <MultiSelect value={options.value} options={senders} itemTemplate={sendersItemTemplate} onChange={(e) => options.filterCallback(e.value)} optionLabel="name" placeholder="Any" className="p-column-filter" />
            </React.Fragment>
        );
    };

    const sendersItemTemplate = (option) => {
        return (
            <div className="flex align-items-center gap-2">
                <span>{option}</span>
            </div>
        );
    };

    const receiverBodyTemplate = (rowData) => {
        const receiver = rowData.receiver;

        return (
            <div className="flex align-items-center gap-2">
                <span>{receiver}</span>
            </div>
        );
    };

    const receiverFilterTemplate = (options) => {
        return (
            <React.Fragment>
                <div className="mb-3 font-bold">Choose the receiver</div>
                <MultiSelect value={options.value} options={receivers} itemTemplate={receiversItemTemplate} onChange={(e) => options.filterCallback(e.value)} optionLabel="name" placeholder="Any" className="p-column-filter" />
            </React.Fragment>
        );
    };

    const receiversItemTemplate = (option) => {
        return (
            <div className="flex align-items-center gap-2">
                <span>{option}</span>
            </div>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return formatDate(rowData.date);
    };

    const dateFilterTemplate = (options) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />;
    };

    const actionBodyTemplate = () => {
        return <Button type="button" icon="pi pi-cog" rounded></Button>;
    };


    function handleItemClick (id){
        // const newContent = `LetterImage${Math.random()}${id}`; // Generate new content string
        // onLetterClick(newContent); // Call the parent component's function with the new content
        console.log(data);
      };

      const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default(0, 0);
                const filterMeta = dt.current.getFilterMeta();

                // Filter the data based on the filterMeta
                const filteredData = data.filter(letter => {
                    return Object.keys(filterMeta).every(key => {
                        const { value, matchMode } = filterMeta[key];
                        if (!value) return true;
                        const fieldValue = key.split('.').reduce((obj, field) => obj[field], letter);
                        if (matchMode === FilterMatchMode.CONTAINS) {
                            return fieldValue.toLowerCase().includes(value.toLowerCase());
                        } else if (matchMode === FilterMatchMode.STARTS_WITH) {
                            return fieldValue.toLowerCase().startsWith(value.toLowerCase());
                        } else if (matchMode === FilterMatchMode.IN) {
                            return value.includes(fieldValue);
                        } else if (matchMode === FilterMatchMode.DATE_IS) {
                            return new Date(fieldValue).toDateString() === new Date(value).toDateString();
                        }
                        return true;
                    });
                });

                // Define columns for export
                const exportColumns = [
                    { title: 'Document', dataKey: 'document' },
                    // { title: 'Sender', dataKey: 'sender.name' },
                    { title: 'Sender', dataKey: 'sender' },
                    // { title: 'Receiver', dataKey: 'receiver.name' },
                    { title: 'Receiver', dataKey: 'receiver' },
                    { title: 'Date', dataKey: 'date' }
                ];

                // Prepare data for export
                const exportData = filteredData.map(letter => ({
                    document: letter.document,
                    'sender': letter.sender,
                    'receiver': letter.receiver,
                    // 'sender.name': letter.sender.name,
                    // 'receiver.name': letter.receiver.name,
                    date: formatDate(letter.date)
                }));

                // Auto-generate table in PDF
                doc.autoTable(exportColumns, exportData);
                doc.save('letters.pdf');
            });
        });
    };

    const renderHeader = () => {
        const leftContents = (
            <React.Fragment>
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
            </React.Fragment>
        );
    
        const rightContents = (
            <React.Fragment>
                <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded onClick={exportPdf} data-pr-tooltip="PDF" style={{ marginRight: '10px' }}/>
                <IconField iconPosition="left" className="icon-field">
                    <InputIcon className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </IconField>
            </React.Fragment>
        );
    
        return (
            <Toolbar left={leftContents} right={rightContents} />
        );
    };

    const header = renderHeader();

    return (
        <div className="card">
            <DataTable value={data}                     
                    paginator 
                    showGridlines 
                    rows={10} 
                    selectionMode="single" onSelectionChange={(e) => handleItemClick(e.value.id)}
                    dataKey="id"
                    ref={dt} 
                    filters={filters} 
                    // globalFilterFields={['document', 'sender', 'receiver','date']} header={header}
                    globalFilterFields={['document', 'sender', 'receiver','date']} header={header}
                    emptyMessage="No letters found."
                    sortMode="single">
                <Column field="document" header="Document" sortable filter filterPlaceholder="Search by document" style={{ minWidth: '14rem' }} />
                <Column header="Sender" sortable sortField="sender" filterField="sender" showFilterMatchModes={false} filterMenuStyle={{ width: '14rem' }}
                    style={{ minWidth: '14rem' }} body={senderBodyTemplate} filter filterElement={senderFilterTemplate} />
                <Column header="Receiver" sortable sortField="receiver" filterField="receiver" showFilterMatchModes={false} filterMenuStyle={{ width: '14rem' }}
                    style={{ minWidth: '14rem' }} body={receiverBodyTemplate} filter filterElement={receiverFilterTemplate} />
                <Column field="date" header="Date" sortable filterField="date" dataType="date" style={{ minWidth: '12rem' }} body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
                <Column headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
        </div>
    );
}