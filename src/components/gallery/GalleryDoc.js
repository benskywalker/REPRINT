import React from "react";
import { Card } from "primereact/card";

const GalleryDoc = ({ doc }) => {
    const senders = doc.senders.split(",");
    const date = doc.sortingDate;
    const receivers = doc.receivers.split(",");
    const docBio = doc.abstract;


    let sender = "";
    let send = "";
    senders.map((s) => {
        send = s.split(" ")[0].charAt(0).toUpperCase() + s.split(" ")[0].slice(1) + " " + s.split(" ")[1].charAt(0).toUpperCase() + s.split(" ")[1].slice(1);
        sender += send + ", ";
    });
    let receiver = "";
    let rec = "";
    receivers.map((r) => {
        rec = r.split(" ")[0].charAt(0).toUpperCase() + r.split(" ")[0].slice(1) + " " + r.split(" ")[1].charAt(0).toUpperCase() + r.split(" ")[1].slice(1);
        receiver += rec + ", ";
    }); 

    sender = sender.slice(0, -2);
    receiver = receiver.slice(0, -2);

    let bio = docBio;
    if (bio === null || bio === "" || bio === undefined) {
        bio = "No abstract available";
    }

    return (
        <Card className="gallery-card">
            <div className="gallery-text">
                <div className="gallery-title">{`From: ${sender}`}</div>
                <div className="gallery-title">{`To: ${receiver}`}</div>
                <div className="gallery-subtitle">{date}</div>
                <div className="gallery-bio">{bio}</div>
            </div>
        </Card>
    );
};

export default GalleryDoc;