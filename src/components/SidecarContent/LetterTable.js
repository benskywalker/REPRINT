import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';

export default function LetterTable() {
    const [data, setData] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
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
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
    ]);

    const [receivers] = useState([
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
    ]);


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

    const renderHeader = () => {
        return (
            <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
                <h4 className="m-0">Table of Documents</h4>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </IconField>
            </div>
        );
    };

    const senderBodyTemplate = (rowData) => {
        const sender = rowData.sender;

        return (
            <div className="flex align-items-center gap-2">
                <img alt={sender.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${sender.image}`} width="32" />
                <span>{sender.name}</span>
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
                <img alt={option.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`} width="32" />
                <span>{option.name}</span>
            </div>
        );
    };

    const receiverBodyTemplate = (rowData) => {
        const receiver = rowData.receiver;

        return (
            <div className="flex align-items-center gap-2">
                <img alt={receiver.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${receiver.image}`} width="32" />
                <span>{receiver.name}</span>
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
                <img alt={option.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`} width="32" />
                <span>{option.name}</span>
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

    const header = renderHeader();

    function handleItemClick (id){
        // const newContent = `LetterImage${Math.random()}${id}`; // Generate new content string
        // onLetterClick(newContent); // Call the parent component's function with the new content
        console.log(data);
      };

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
                    // globalFilterFields={['document', 'sender.name', 'receiver.name','date']} header={header}
                    globalFilterFields={['document', 'sender', 'receiver','date']} header={header}
                    emptyMessage="No letters found."
                    sortMode="single">
                <Column field="document" header="Document" sortable filter filterPlaceholder="Search by document" style={{ minWidth: '14rem' }} />
                <Column header="Sender" sortable sortField="sender.name" filterField="sender" showFilterMatchModes={false} filterMenuStyle={{ width: '14rem' }}
                    style={{ minWidth: '14rem' }} body={senderBodyTemplate} filter filterElement={senderFilterTemplate} />
                <Column header="Receiver" sortable sortField="receiver.name" filterField="receiver" showFilterMatchModes={false} filterMenuStyle={{ width: '14rem' }}
                    style={{ minWidth: '14rem' }} body={receiverBodyTemplate} filter filterElement={receiverFilterTemplate} />
                <Column field="date" header="Date" sortable filterField="date" dataType="date" style={{ minWidth: '12rem' }} body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
                <Column headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
        </div>
    );
}