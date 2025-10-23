import React from "react";
import { Outlet } from 'react-router-dom';
import fondo from '../assets/fondo_landing_page.jpg';

const AuthLayout = () => {
    return (
        <div
            className="fixed inset-0 overflow-hidden p-0 m-0"
            style={{
                backgroundImage: `url(${fondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 filter backdrop-blur-md bg-black/30">
            </div>

            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;