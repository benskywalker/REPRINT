// Header component for ui

import React from "react";
import { Button } from "primereact/button";
import styles from "./Header.module.css";
import { InputText } from "primereact/inputtext";
import { Sidebar } from "primereact/sidebar";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const Header = ({ onUploadClick, onSearchChange }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleInputChange = (event) => {
    onSearchChange(event.target.value);
  };
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  return (
    <div className={styles.header}>
      <NavLink
        to="/"
        activeclassname={styles.activeLink}
        className={styles.title}
      >
        Network Analysis
      </NavLink>
      <InputText
        placeholder="Search"
        className={styles.search}
        onChange={handleInputChange}
      />
      {/* pi bar menu for sidebar pop up */}
      <Button
        icon="pi pi-bars"
        className={styles.menu}
        onClick={toggleSidebar}
      />
      <Sidebar
        visible={sidebarVisible}
        position="right"
        onHide={() => setSidebarVisible(false)}
      >
        <h3>PRINT Network Analysis</h3>
        <hr></hr>
        {/* display routes */}
        <ul className={styles.routesList}>
          <li>
            <NavLink to="/" activeclassname={styles.activeLink}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/query-tool" activeclassname={styles.activeLink}>
              Query Tool
            </NavLink>
          </li>
          <li>
            <NavLink to="/gallery" activeclassname={styles.activeLink}>
              Gallery
            </NavLink>
          </li>
        </ul>
        <hr></hr>
      </Sidebar>
    </div>
  );
};

export default Header;
