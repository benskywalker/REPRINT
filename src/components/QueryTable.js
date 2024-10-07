import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export const QueryTable = ( request ) => {
    const [people, setPeople] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post("http://localhost:4000/query", request.request);
                // if(request.request.table === 'Person') {
                //     setPeople(response.data);
                // } else {
                //     setDocuments(response.data);
                // }
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        }
        fetchData();
    }, [request.request]);

  return (
    <div className='query-table'>
        { loading && <p>Loading...</p>}
        { !loading && request.request.table === 'Person' &&
        <DataTable value={people}>
            <Column field="firstName" header="First Name"></Column>
            <Column field="lastName" header="Last Name"></Column>
            <Column field="middleName" header="Middle Name"></Column>
            <Column field="religion" header="Religion"></Column>
            <Column field="birthDate" header="Birth Date"></Column>
            <Column field="deathDate" header="Death Date"></Column>
            <Column field="language" header="Language"></Column>
            <Column field="gender" header="Gender"></Column>
        </DataTable>
        }
        { !loading && request.request.table === 'Document' &&
        <DataTable value={documents}>
            <Column field="sortingDate" header="Letter Date"></Column>
            <Column field="senders" header="Author"></Column>
            <Column field="receivers" header="Recipient"></Column>
            <Column field="languageDesc" header="Language"></Column>
        </DataTable>
        }
    </div>
  )
}