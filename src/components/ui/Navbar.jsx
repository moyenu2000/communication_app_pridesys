// src/components/ui/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav style={navbarStyles}>
            <ul style={ulStyles}>
                <li style={liStyles}>
                    <Link to="/" style={linkStyles}>Home</Link>
                </li>
                <li style={liStyles}>
                    <Link to="/channels" style={linkStyles}>Channels</Link>
                </li>
                <li style={liStyles}>
                    <Link to="/userList" style={linkStyles}>UserList</Link>
                </li>
                <li style={liStyles}>
                    <Link to="/action" style={linkStyles}>Action</Link>
                </li>
                <li style={liStyles}>
                    <Link to="/settings" style={linkStyles}>Settings</Link>
                </li>
            </ul>
        </nav>
    );
};

const navbarStyles = {
    backgroundColor: "#333",
    padding: "10px 0",
    textAlign: "center"
};

const ulStyles = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    justifyContent: "center"
};

const liStyles = {
    margin: "0 15px"
};

const linkStyles = {
    textDecoration: "none",
    color: "white",
    fontSize: "16px",
};

export default Navbar;
