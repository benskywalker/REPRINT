import React, { useState, useEffect } from "react";

import { Dialog } from "primereact/dialog";
import { TabMenu } from "primereact/tabmenu";

import NodeDetails from "../components/NodeDetails";
import Filter from "../components/Filter";
import GalleryEntry from "../components/GalleryEntry";
import GalleryDoc from "../components/GalleryDoc";

import "../components/Filter.css";
import "./Gallery.css";

const Gallery = ({ searchQuery }) => {
  const [people, setPeople] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dialogs, setDialogs] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);

  const tabmenuItems = [
    {label: 'People', icon: 'pi pi-users'},
    {label: 'Documents', icon: 'pi pi-file'}
  ];

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch("http://localhost:4000/persons");
        const data = await response.json();
        setPeople(data);

        // Create unique filter options based on the full names
        const uniqueNames = Array.from(
          new Set(
            data.map((person) => `${capitializeFirstLetter(person.firstName)} ${capitializeFirstLetter(person.lastName)}`)
          )
        );
        const filterOptions = uniqueNames.map((name, index) => ({
          name: name,
          code: name, // Use full name as code for filtering
        }));
        setFilterOptions(filterOptions);

        const documentRes = await fetch("http://localhost:4000/documents");
        const documentData = await documentRes.json();
        setDocuments(documentData);
        console.log(documentData);
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };

    fetchPeople();
  }, []);

  const handleButtonClick = (person) => {
    console.log(person);
    const newDialog = {
      id: person.personID,
      nodeData: {
        data: {
          fullName: person.firstName + " " + person.lastName,
        },
      },
    };
    setDialogs([...dialogs, newDialog]);
  };

  const handleCloseDialog = (id) => {
    setDialogs(dialogs.filter((dialog) => dialog.id !== id));
  };

  const handleFilterChange = (filters) => {
    setFilters(filters);
  };

  const filteredPeople = people.filter((person) =>
    `${person.firstName} ${person.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  let filterPeople = [];

  let flist = filters;
  if (flist === null) {
    flist = [];
  }

  flist.map((filter) => {
    filteredPeople
      .filter(
        (person) => `${person.firstName} ${person.lastName}` === filter.code
      )
      .forEach((person, index) => {
        if (!filterPeople.some((p) => p.personID === person.personID)) {
          const key = `${filter.code}-${index}`;
          filterPeople.push({ ...person, key });
        }
      });
  });

  if (flist.length === 0) {
    filterPeople = filteredPeople;
  }

  const capitializeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div>
      <Filter onFilterChange={handleFilterChange} options={filterOptions} />
      <TabMenu model = {tabmenuItems} activeIndex={selectedTab} onTabChange={(e) => setSelectedTab(e.index)}/>
      <div className="gallery">
        {filterPeople.map((person) => (
          <div
            key={person.personID}
            className="gallery-item"
            onClick={() => handleButtonClick(person)}
          >
            <GalleryEntry
              image={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaHfpIhAPZHSbZstaGEgFBIjZZ-Y-K533dag&s"}
              name={capitializeFirstLetter(person.firstName) + " " + capitializeFirstLetter(person.lastName)}
            />
          </div>
        ))}
      </div>
      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data.fullName}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          draggable={true}
          modal={false}
          style={{ width: "600px", height: "500px" }}
        >
          <NodeDetails nodeData={dialog.nodeData} />
        </Dialog>
      ))}
    </div>
  );
};

export default Gallery;
