import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NavBarDropDown = ({ title, children }) => {
    return (
        <NavDropdown
            title={title}
            id="basic-nav-dropdown"
            style={{ color: '#000' }}
        >
            {children}
        </NavDropdown>
    );
};

// Agregar el componente Item como propiedad del componente principal
NavBarDropDown.Item = ({ href, children }) => {
    const navigate = useNavigate();
    return (
        <NavDropdown.Item
            onClick={() => navigate(href)}
            style={{ color: '#000' }}
        >
            {children}
        </NavDropdown.Item>
    );
};

export default NavBarDropDown;