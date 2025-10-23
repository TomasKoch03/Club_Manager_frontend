import React from "react";
import Navbar from "../components/NavBar";
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="h-screen bg-gray-100 flex flex-col"> 
            <Navbar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>   
    );
};

export default MainLayout;
