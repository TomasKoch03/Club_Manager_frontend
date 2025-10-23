import React from "react";
import { FaRegBell, FaRegUserCircle } from 'react-icons/fa';
import NavBarLogo from './NavBarItems/NavBarLogo';
import NavBarItem from './NavBarItems/NavBarItem';
import NavBarDropDown from './NavBarItems/NavBarDropDown';

const Navbar = () => {
  const handleNotificationClick = () => {
    console.log('Notificaciones clicked');
  };
  
  const handleProfileClick = () => {
    console.log('Perfil clicked');
  };
  
  return (
    <header className="bg-gray-800 text-white shadow-md w-full">
      <nav className="w-full mx-auto px-6 py-3 flex justify-between items-center">

        <NavBarLogo href="/club-manager/home" title="Club Manager" />

        <div className="hidden md:flex items-center space-x-8">
          <NavBarDropDown title="Reservar">
            <div className="p-2">
              <a href="/club-manager/reservar/basquet" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                Basquet
              </a>
              <a href="/club-manager/reservar/futbol" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                Futbol
              </a>
              <a href="/club-manager/reservar/paddle" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                Paddle
              </a>
            </div>
          </NavBarDropDown>
          <NavBarItem href="/club-manager/mis-reservas">
            Mis Reservas
          </NavBarItem>
        </div>

        <div className="flex items-center gap-8">
          <NavBarItem 
            onClick={handleNotificationClick}
            icon={FaRegBell}
            ariaLabel="Notificaciones"
          />
          <NavBarItem 
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