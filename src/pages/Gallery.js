import React, { useState, useEffect } from "react";
import NodeDetails from "../components/NodeDetails";
import { Dialog } from "primereact/dialog";
import Filter from "../components/Filter";
import "../components/Filter.css";
import "./Gallery.css";

const Gallery = ({ searchQuery }) => {
  const [people, setPeople] = useState([]);
  const [dialogs, setDialogs] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch("http://localhost:4000/persons");
        const data = await response.json();
        setPeople(data);

        // Create unique filter options based on the full names
        const uniqueNames = Array.from(
          new Set(
            data.map((person) => `${person.firstName} ${person.lastName}`)
          )
        );
        const filterOptions = uniqueNames.map((name, index) => ({
          name: name,
          code: name, // Use full name as code for filtering
        }));
        setFilterOptions(filterOptions);
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };

    fetchPeople();
  }, []);

  const handleButtonClick = (person) => {
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

  return (
    <div>
      <Filter onFilterChange={handleFilterChange} options={filterOptions} />
      <div className="gallery">
        {filterPeople.map((person) => (
          <div
            key={person.personID}
            className="gallery-item"
            onClick={() => handleButtonClick(person)}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaHfpIhAPZHSbZstaGEgFBIjZZ-Y-K533dag&s"
              alt={person.firstName + " " + person.lastName}
            />
            <div>{person.firstName + " " + person.lastName}</div>
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
