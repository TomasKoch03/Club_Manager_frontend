import React from 'react';

const NavBarItem = ({ 
  type = 'link', 
  href, 
  onClick, 
  children, 
  className = '', 
  ariaLabel,
  icon: Icon 
}) => {
  const baseClasses = 'text-white hover:text-gray-300 focus:outline-none';
  
  if (type === 'button') {
    return (
      <button 
        className={`${baseClasses} bg-transparent border-none p-0 ${className}`}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {Icon && <Icon className="h-6 w-6" />}
        {children}
      </button>
    );
  }

  return (
    <a 
      href={href}
      className={`${baseClasses} ${className}`}
      style={{ textDecoration: 'none' }}
    >
      {Icon && <Icon className="h-6 w-6 mr-2" />}
      {children}
    </a>
  );
};

export default NavBarItem;