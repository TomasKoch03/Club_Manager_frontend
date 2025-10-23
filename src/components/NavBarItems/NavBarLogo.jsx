import React from 'react';
import { LuFlagTriangleRight } from "react-icons/lu";

const NavBarLogo = ({ href = "/club-manager/home", title = "Club Manager" }) => {
  return (
    <div className="flex items-center">
      <LuFlagTriangleRight className="mr-2" />
      <a 
        href={href}
        className="text-xl font-bold text-white lg:text-2xl hover:text-gray-300"
        style={{ textDecoration: 'none' }}
      >
        {title}
      </a>
    </div>
  );
};

export default NavBarLogo;