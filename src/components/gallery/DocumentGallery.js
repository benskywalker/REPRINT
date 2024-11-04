import React from "react";
import { Card } from "primereact/card";

const DocumentsGallery = ({ documents, searchQuery, filters }) => {
  const flist = filters || [];

  const formatName = (name) => {
    const names = name.split(",");
    for(let i = 0; i < names.length; i++) {
      names[i] = names[i].split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
    return names.join(", ");
  };

  const createDocumentCard = (document, index) => {
    const sender = document.author ? formatName(document.author) : null;
    const receiver = document.receiver ? formatName(document.receiver) : null;
    const date = document.sortingDate;
    let bio = document.abstract;
    if (!bio) {
      bio = "No abstract available";
    }

    return (
      <div
        key={document.document || index}
        className="gallery-item"
        onClick={() => console.log(document)}
      >
        <Card className="gallery-card">
          <div className="gallery-text">
            {sender && <div className="gallery-title">{`From: ${sender}`}</div>}
            {receiver && <div className="gallery-title">{`To: ${receiver}`}</div>}
            <div className="gallery-subtitle">{date}</div>
            <div className="gallery-bio">{bio}</div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="gallery">
      {documents
        .filter((document) =>
          `${document.author} ${document.receiver} ${document.sortingDate}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        .filter(
          (document) =>
            flist.length === 0 ||
            flist.some((filter) =>
              `${document.receiver} ${document.author} ${document.sortingDate}`
                .toLowerCase()
                .includes(filter.code.toLowerCase())
            )
        )
        .map((document, index) => createDocumentCard(document, index))}
    </div>
  );
};

export default DocumentsGallery;