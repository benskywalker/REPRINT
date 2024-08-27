import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NodeDetails from "../components/NodeDetails";
import { Dialog } from "primereact/dialog";
import Filter from "../components/Filter";
import "../components/Filter.css";
import "./Gallery.css";

const Gallery = () => {
  const [people, setPeople] = useState([]);
  const [dialogs, setDialogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch("http://localhost:4000/persons");
        const data = await response.json();
        setPeople(data);
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };

    fetchPeople();
  }, []);

  const handleButtonClick = (person) => {
    console.log("Button clicked for:", person);
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

  const handleSearchChange = (query) => {
    setSearchQuery(query);
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

  const addedKeys = new Set();

  flist.map((filter) => {
    switch (filter.code) {
      case "J":
        filteredPeople
          .filter((person) => person.firstName === "john")
          .forEach((person, index) => {
            if (!filterPeople.some((p) => p.personID === person.personID)) {
              const key = `john-${index}`;
              filterPeople.push({ ...person, key });
            }
          });
        break;
      case "D":
        filteredPeople
          .filter((person) => person.firstName === "daniel")
          .forEach((person, index) => {
            if (!filterPeople.some((p) => p.personID === person.personID)) {
              const key = `daniel-${index}`;
              filterPeople.push({ ...person, key });
            }
          });
        break;
      case "P":
        filteredPeople
          .filter((person) => person.lastName === "pemberton")
          .forEach((person, index) => {
            if (!filterPeople.some((p) => p.personID === person.personID)) {
              const key = `phineas-${index}`;
              filterPeople.push({ ...person, key });
            }
          });
        break;
      default:
        break;
    }
  });

  if (filterPeople.length === 0) {
    filterPeople = filteredPeople;
  }

  return (
    <div>
      <Header onSearchChange={handleSearchChange} gallery={true} />
      <Filter onFilterChange={handleFilterChange} />
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
