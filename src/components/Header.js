// Header component for ui

import React from "react";
import { Button } from "primereact/button";
import styles from "./Header.module.css";
import { InputText } from "primereact/inputtext";
import { Sidebar } from "primereact/sidebar";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import PrimeReact from "primereact/api"; // import PrimeReact to use changeTheme function
import { Image } from "primereact/image";
import logoImage from './images/logo.png';


const Header = ({ onUploadClick, onSearchChange }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("soho-dark"); // default theme

  const handleInputChange = (event) => {
    onSearchChange(event.target.value);
  };
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleTheme = () => {
    const newTheme = selectedTheme === "viva-light" ? "soho-dark" : "viva-light";
    PrimeReact.changeTheme(selectedTheme, newTheme, "theme-link");
    setSelectedTheme(newTheme);
  };

  return (
    <div className={styles.header}>
      <NavLink
        to="/"
        activeclassname={styles.activeLink}
        className={styles.title}
      >
        <div className={styles.logo}>
          <Image src={logoImage} alt="logo" />
        </div>
        {/* <Image src={logo} alt="logo"  className={styles.logo}/> */}
      </NavLink>
      <InputText
        placeholder="Search"
        className={styles.search}
        onChange={handleInputChange}
      />
      {/* pi bar menu for sidebar pop up */}
      <Button
        icon="pi pi-bars"
        text 
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
        <Button
        style={{ width: "25%" }}
          icon={selectedTheme === "viva-light" ? "pi pi-moon" : "pi pi-sun"}
          onClick={toggleTheme}
        />
      </Sidebar>
    </div>
  );
};

export default Header;
