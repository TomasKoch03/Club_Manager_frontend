import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar as BSNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FaRegBell, FaRegUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // <CHANGE> Importar useNavigate
import { getUserData, logout } from '../services/api'; // <CHANGE> Importar getUserData y logout
import NavBarItem from './NavBarItems/NavBarItem';
import NavBarLogo from './NavBarItems/NavBarLogo';

const Navbar = () => {
    const navigate = useNavigate(); // <CHANGE> Hook para navegación

    const handleNotificationClick = () => {
        console.log('Notificaciones clicked');
    };

    const handleProfileClick = async () => {
        try {
            const userData = await getUserData();
            if (userData.is_admin) {
                navigate('/admin/perfil');
            } else {
                navigate('/club-manager/perfil');
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            navigate('/club-manager/perfil');
        }
    };

    const handleLogout = () => {
        logout();
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
        <BSNavbar bg="white" expand="lg" className="shadow-sm border-bottom rounded flex-none">
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
                    <Nav className="ms-auto">
                        <NavBarItem
                            onClick={handleNotificationClick}
                            icon={FaRegBell}
                            ariaLabel="Notificaciones"
                        />
                        <NavDropdown
                            title={<FaRegUserCircle size={24} />}
                            id="user-dropdown"
                            align="end"
                            className="no-caret"
                            style={{
                                '--bs-nav-link-padding-x': '0.5rem',
                            }}
                        >
                            <NavDropdown.Item onClick={handleProfileClick}>
                                Perfil
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>
                                Cerrar sesión
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </BSNavbar.Collapse>
            </Container>
        </BSNavbar>
    );
};

export default Navbar;