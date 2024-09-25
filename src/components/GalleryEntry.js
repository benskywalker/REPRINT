import React from "react";
import { Card } from "primereact/card";

const GalleryEntry = ({ image, person }) => {
    const name = person.firstName.charAt(0).toUpperCase() + person.firstName.slice(1) + " " + person.lastName.charAt(0).toUpperCase() + person.lastName.slice(1);
    let religion = person.religion;
    if (religion === null || religion === "" || religion === undefined) {
        religion = "No religion available";
    } else {
        religion = religion.charAt(0).toUpperCase() + religion.slice(1);
    }

    let bio = person.bio;
    if (bio === null || bio === "" || bio === undefined) {
        bio = "No bio available";
    }

    return (
        <Card className="gallery-card">
            <img src={image} alt={name} className = 'gallery-image'/>
            <div className="gallery-text">
                <div className="gallery-title">{name}</div>
                <div className="gallery-subtitle">{religion}</div>
                <div className="gallery-bio">{bio}</div>
            </div>
        </Card>
    );
};

export default GalleryEntry;