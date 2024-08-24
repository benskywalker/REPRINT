import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NodeDetails from "../components/NodeDetails";
import { Dialog } from "primereact/dialog"; // Assuming you are using PrimeReact for Dialog

const Gallery = () => {
  const [people, setPeople] = useState([]);
  const [dialogs, setDialogs] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchPeople = async () => {
      try {
        const response = await fetch("http://localhost:4000/persons"); // Replace with your API endpoint
        const data = await response.json();
        setPeople(data);
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

  return (
    <div>
      <Header /> {/* Include the Header component */}
      <div className="gallery">
        {people.map((person) => (
          <button
            key={person.personID}
            className="gallery-item"
            onClick={() => handleButtonClick(person)}
          >
            <img
              src="https://via.placeholder.com/150"
              alt={person.firstName + " " + person.lastName}
            />
            <div>{person.firstName + " " + person.lastName}</div>
          </button>
        ))}
      </div>
      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data.fullName}
          maximizable
          modal={false}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          draggable={true}
        >
          <NodeDetails nodeData={dialog.nodeData} />
        </Dialog>
      ))}
    </div>
  );
};

export default Gallery;
