import React from "react";
import { Card } from "primereact/card";

const DocumentsGallery = ({ documents, searchQuery, filters }) => {
  console.log(documents);
  const flist = filters || [];

  const createDocumentCard = (document, index) => {
    const sender = document.author;
    const receiver = document.receiver;
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
          `${document.receivers} ${document.senders} ${document.sortingDate}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        .filter(
          (document) =>
            flist.length === 0 ||
            flist.some((filter) =>
              `${document.receivers} ${document.senders} ${document.sortingDate}`
                .toLowerCase()
                .includes(filter.code.toLowerCase())
            )
        )
        .map((document, index) => createDocumentCard(document, index))}
    </div>
  );
};

export default DocumentsGallery;