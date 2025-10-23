import React from "react";
import { FaRegBell, FaRegUserCircle } from 'react-icons/fa';
import { LuFlagTriangleRight } from "react-icons/lu";
import NavBarLogo from './NavBarItems/NavBarLogo';
import NavBarItem from './NavBarItems/NavBarItem';

const Navbar = () => {
  const handleNotificationClick = () => {
    console.log('Notificaciones clicked');
  };

  const handleProfileClick = () => {
    console.log('Perfil clicked');
  };
  return (
    <header className="bg-gray-800 text-white shadow-md w-full"> {/* Cambia bg-gray-800 por tu color verde oscuro */}
      <nav className="w-full mx-auto px-6 py-3 flex justify-between items-center">

        <NavBarLogo href="/club-manager/home" title="Club Manager" />

        <div className="hidden md:flex items-center space-x-8">
          <div className="relative">
            {/* El botón "Reservar" con una flecha para indicar que es un menú */}
            <button className="flex items-center text-black hover:text-gray-300 focus:outline-none">
              <span>Reservar</span>
              <svg className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <NavBarItem href="/club-manager/mis-reservas">
            Mis Reservas
          </NavBarItem>
        </div>

        <div className="flex items-center space-x-5">
          <NavBarItem 
            type="button"
            onClick={handleNotificationClick}
            icon={FaRegBell}
            ariaLabel="Notificaciones"
          />
          <NavBarItem 
            type="button"
            onClick={handleProfileClick}
            icon={FaRegUserCircle}
            ariaLabel="Perfil de usuario"
          />
        </div>
        
      </nav>
    </header>
  );
};

export default Navbar;