import React from "react";
import { Card } from "primereact/card";

const GalleryEntry = ({ image, name }) => {
    const religion = "Religion";
    const bio = "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

    return (
        <Card>
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