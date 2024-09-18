import React from "react";
import { Card } from "primereact/card";

const GalleryDoc = ({ doc }) => {
    const title = doc.abstract;
    const sender = doc.sender;
    const date = doc.date;
    const reciever = doc.reciever;

    return (
        <Card className="gallery-card">
            <div className="gallery-text">
                <div className="gallery-title">{title}</div>
                <div className="gallery-subtitle">{date}</div>
                <div className="gallery-bio">{sender + " to " + reciever}</div>
            </div>
        </Card>
    );
};

export default GalleryDoc;