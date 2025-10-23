import React from 'react';

const NavBarItem = ({ 
  href, 
  onClick, 
  children, 
  className = '', 
  ariaLabel,
  icon: Icon 
}) => {
  const baseClasses = 'text-white hover:text-gray-300 focus:outline-none';
  
  const handleClick = (e) => {
    if (onClick && !href) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a 
      href={href || '#'}
      className={`${baseClasses} ${className}`}
      style={{ textDecoration: 'none' }}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      {Icon && <Icon className={`h-6 w-6 ${children ? 'mr-2' : ''}`} />}
      {children}
    </a>
  );
};

export default NavBarItem;