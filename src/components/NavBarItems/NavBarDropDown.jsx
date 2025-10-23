import React, { useState } from 'react';

const NavBarDropDown = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        className="flex items-center text-gray-800 hover:text-gray-600 focus:outline-none bg-gray-200 px-4 py-2 rounded border-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <svg className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default NavBarDropDown;