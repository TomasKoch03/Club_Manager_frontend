import React from "react";
import Navbar from "../components/NavBar";
import { Outlet } from 'react-router-dom';
import fondo from '../assets/fondo_landing_page.jpg';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col"
             style={{
                 backgroundImage: `url(${fondo})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}>
            <div className="absolute inset-0 filter backdrop-blur-md bg-black/30">
            </div>
            <Navbar />
            {/* si el Navbar es fixed top-0, añade pt para compensar su altura */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
