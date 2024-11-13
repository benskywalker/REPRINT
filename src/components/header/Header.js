import React from "react";
import { Button } from "primereact/button";
import styles from "./Header.module.css";
import { Sidebar } from "primereact/sidebar";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import PrimeReact from "primereact/api"; // import PrimeReact to use changeTheme function
import { Image } from "primereact/image";
import logoImage from '../images/logo.png';
import logoImage2 from '../images/logo2.png';

const Header = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("soho-dark"); // default theme

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
          <Image src={selectedTheme === "soho-dark" ? logoImage : logoImage2} alt="logo" />
        </div>
      </NavLink>
      
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