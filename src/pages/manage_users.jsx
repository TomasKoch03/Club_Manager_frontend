import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Alert, Container, Spinner } from 'react-bootstrap';
import UserManagementCard from '../components/users/UserManagementCard';
import { getAllUsers } from '../services/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers();
                // Ordenar por fecha de creación (más reciente primero)
                const sortedData = data.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setUsers(sortedData);
                setError(null);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
                setError('No se pudieron cargar los usuarios. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div style={{
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "40px 20px 60px 20px"
        }}>
            <style>
                {`
                    .users-container::-webkit-scrollbar {
                        width: 10px;
                    }
                    .users-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .users-container::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .users-container::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                `}
            </style>
            <Container style={{ maxWidth: "900px" }} className="users-container">
                {/* Título */}
                <div
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        padding: "24px",
                        marginBottom: "24px",
                    }}
                >
                    <h2 className="mb-0" style={{ fontWeight: '600', color: '#000' }}>
                        Gestión de Usuarios
                    </h2>
                    <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.95rem' }}>
                        Administra los usuarios y su estado de acceso
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3" style={{ color: '#000' }}>Cargando usuarios...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <Alert variant="danger" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
                        {error}
                    </Alert>
                )}

                {/* Lista de usuarios */}
                {!loading && !error && (
                    <>
                        {users.length === 0 ? (
                            <div
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    border: "none",
                                    padding: "48px 24px",
                                    textAlign: "center",
                                }}
                            >
                                <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '0' }}>
                                    No hay usuarios registrados
                                </p>
                            </div>
                        ) : (
                            <div>
                                {users.map((user) => (
                                    <UserManagementCard
                                        key={user.id}
                                        user={user}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default ManageUsers;
