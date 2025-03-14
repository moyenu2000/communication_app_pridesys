// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/ui/Navbar"; // import the Navbar component

const MainLayout = () => {
    return (
        <div>
            <Navbar /> 
            <h1>App Logo/Header</h1>
            <Outlet />  {/* The nested routes will be rendered here */}
        </div>
    );
};

export default MainLayout;
