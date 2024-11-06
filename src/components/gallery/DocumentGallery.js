import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import Sidecar from '../sidecar/Sidecar';
import { Dialog } from 'primereact/dialog';
import { v4 as uuidv4 } from 'uuid';

const DocumentsGallery = ({ documents, filters }) => {
  const [dialogs, setDialogs] = useState([]);
  const flist = filters || [];

  useEffect(() => {
    console.log(documents);
  }, [documents]);

  const formatName = (name) => {
    const names = name.split(",");
    for(let i = 0; i < names.length; i++) {
      names[i] = names[i].split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
    return names.join(", ");
  };

  const handleOpenClick = (document) => {
    const id = uuidv4();
    setDialogs(prevDialogs => [...prevDialogs, { id, nodeData: { data: { document } } }]);
  };

  const handleCloseDialog = (id) => {
    setDialogs(prevDialogs => prevDialogs.filter(dialog => dialog.id !== id));
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
        onClick={() => handleOpenClick(document)}
      >
        <Sidecar nodeData={{ data: { document: { ...document, sender, receiver } } }} />
      </div>
    );
  };

  return (
    <div className="gallery">
      {documents
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
      {dialogs.map(dialog => (
        <Dialog
          key={dialog.id}
          header={dialog.nodeData.data.document.title || "Document Details"}
          maximizable
          modal={false}
          visible={true}
          onHide={() => handleCloseDialog(dialog.id)}
          style={{
            width: '35vw',
            height: '70vh',
            minWidth: '15vw',
            minHeight: '15vw'
          }}
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
          <Sidecar
            nodeData={dialog.nodeData}
          />
        </Dialog>
      ))}
    </div>
  );
};

export default DocumentsGallery;