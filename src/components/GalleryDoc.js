import React from "react";
import { Card } from "primereact/card";

const GalleryDoc = ({ doc }) => {
    const sender = doc.sender;
    const date = doc.dateAdded;
    const reciever = doc.receiver;
    const docBio = doc.abstract;

    let title = "";

    if (reciever === null || reciever === "" || reciever === undefined) {
        title = `From: ${sender}`;
    } else {
        title = `From: ${sender} To: ${reciever}`;
    }

    let bio = docBio;
    if (bio === null || bio === "" || bio === undefined) {
        bio = "No abstract available";
    }

    return (
        <Card className="gallery-card">
            <div className="gallery-text">
                <div className="gallery-title">{title}</div>
                <div className="gallery-subtitle">{date}</div>
                <div className="gallery-bio">{bio}</div>
            </div>
        </Card>
    );
};

export default GalleryDoc;