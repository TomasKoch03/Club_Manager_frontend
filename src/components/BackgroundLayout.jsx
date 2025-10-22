import React from "react";
import fondo from '../assets/fondo_landing_page.jpg';

const BackgroundLayout = ({ children, blur = true, overlay = true }) => {
    return (
        <div
            className="fixed inset-0 overflow-hidden p-0 m-0"
            style={{
                backgroundImage: `url(${fondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {overlay && (
                <div
                    className={`absolute inset-0 ${blur ? 'filter backdrop-blur-md' : ''} bg-black/30`}
                >
                </div>
            )}

            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default BackgroundLayout;