import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar as BSNavbar, Container, Nav } from 'react-bootstrap';
import { FaRegBell, FaRegUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // <CHANGE> Importar useNavigate
import NavBarDropDown from './NavBarItems/NavBarDropDown';
import NavBarItem from './NavBarItems/NavBarItem';
import NavBarLogo from './NavBarItems/NavBarLogo';
import { getUserData } from '../services/api'; // <CHANGE> Importar getUserData

const Navbar = () => {
    const navigate = useNavigate(); // <CHANGE> Hook para navegación

    const handleNotificationClick = () => {
        console.log('Notificaciones clicked');
    };

    const handleProfileClick = () => {
        console.log('Perfil clicked');
    };

    // <CHANGE> Handler para el click en el logo que redirige según el rol del usuario
    const handleLogoClick = async (e) => {
        e.preventDefault();
        try {
            const userData = await getUserData();
            if (userData.is_admin) {
                navigate('/admin/home');
            } else {
                navigate('/club-manager/home');
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            // En caso de error, redirigir a la página por defecto
            navigate('/club-manager/home');
        }
    };

    return (
        <BSNavbar bg="white" expand="lg" className="shadow-sm border-bottom rounded">
            <Container fluid>
                {/* <CHANGE> Cambiado href por onClick para manejar redirección dinámica */}
                <BSNavbar.Brand
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                >
                    <NavBarLogo title="Club Manager" />
                </BSNavbar.Brand>

                <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

                <BSNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-3">
                        <NavBarDropDown title="Reservar">
                            <NavBarDropDown.Item href="/club-manager/reservar/basquet/calendario">
                                Basquet
                            </NavBarDropDown.Item>
                            <NavBarDropDown.Item href="/club-manager/reservar/futbol/calendario">
                                Futbol
                            </NavBarDropDown.Item>
                            <NavBarDropDown.Item href="/club-manager/reservar/paddle/calendario">
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