// src/components/gallery/PeopleGallery.js
import React from "react";
import { Card } from "primereact/card";

const PeopleGallery = ({ people, searchQuery, filters, handleButtonClick }) => {
  const flist = filters || [];

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="gallery">
      {people
        .filter((person) =>
          `${person.firstName} ${person.lastName} ${person.religion}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        .filter(
          (person) =>
            flist.length === 0 ||
            flist.some((filter) =>
              `${person.firstName} ${person.lastName} ${person.religion}`
                .toLowerCase()
                .includes(filter.code.toLowerCase())
            )
        )
        .map((person) => {
          const name =
            capitalizeFirstLetter(person.firstName) +
            " " +
            capitalizeFirstLetter(person.lastName);
          let religion = person.religion;
          if (!religion) {
            religion = "No religion available";
          } else {
            religion = capitalizeFirstLetter(religion);
          }

          let bio = person.biography;
          if (!bio) {
            bio = "No bio available";
          }

          return (
            <div
              key={person.personID}
              className="gallery-item"
              onClick={() => handleButtonClick(person)}
            >
              <Card className="gallery-card">
                {/* <img src={image} alt={name} className='gallery-image'/> */}
                <div className="gallery-text">
                  <div className="gallery-title">{name}</div>
                  <div className="gallery-subtitle">{religion}</div>
                  <div className="gallery-subtitle">ORGANIZATION</div>
                  {/* <div className="gallery-bio">{bio}</div> */}
                </div>
              </Card>
            </div>
          );
        })}
    </div>
  );
};

export default PeopleGallery;