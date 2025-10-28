import React from "react";
import { Navbar as BSNavbar, Nav, Container } from 'react-bootstrap';
import { FaRegBell, FaRegUserCircle } from 'react-icons/fa';
import NavBarLogo from './NavBarItems/NavBarLogo';
import NavBarItem from './NavBarItems/NavBarItem';
import NavBarDropDown from './NavBarItems/NavBarDropDown';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
    const handleNotificationClick = () => {
        console.log('Notificaciones clicked');
    };

    const handleProfileClick = () => {
        console.log('Perfil clicked');
    };

    return (
        <BSNavbar bg="white" expand="lg" className="shadow-sm border-bottom rounded">
            <Container fluid>
                <BSNavbar.Brand href="/club-manager/home">
                    <NavBarLogo title="Club Manager" />
                </BSNavbar.Brand>

                <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

                <BSNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <NavBarDropDown title="Reservar">
                            <NavBarDropDown.Item href="/club-manager/reservar/basquet">
                                Basquet
                            </NavBarDropDown.Item>
                            <NavBarDropDown.Item href="/club-manager/reservar/futbol">
                                Futbol
                            </NavBarDropDown.Item>
                            <NavBarDropDown.Item href="/club-manager/reservar/paddle">
                                Paddle
                            </NavBarDropDown.Item>
                        </NavBarDropDown>

                        <NavBarItem href="/club-manager/mis-reservas">
                            Mis Reservas
                        </NavBarItem>
                    </Nav>

                    <Nav className="ms-auto">
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
                    </Nav>
                </BSNavbar.Collapse>
            </Container>
        </BSNavbar>
    );
};

export default Navbar;