import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { IoCheckmarkCircleOutline, IoLockClosedOutline, IoMailOutline, IoPersonOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { blockUser, getUserById, unblockUser, updateUserById } from '../services/api';

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const data = await getUserById(userId);
                setUser(data);
                setFormData({
                    full_name: data.full_name || '',
                    email: data.email || '',
                });
                setError(null);
            } catch (err) {
                console.error('Error al cargar usuario:', err);
                setError('No se pudo cargar la información del usuario.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            await updateUserById(userId, formData);
            toast.success('Usuario actualizado exitosamente');
            navigate('/admin/usuarios');
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            toast.error('Error al actualizar el usuario');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleBlock = async () => {
        try {
            setSaving(true);
            console.log('Estado actual:', user.is_active);

            if (!user.is_active) {
                await unblockUser(userId);
                console.log('Usuario desbloqueado - nuevo estado: true');
                setUser({
                    ...user,
                    is_active: true
                });
                toast.success('Usuario desbloqueado exitosamente');
            } else {
                await blockUser(userId);
                console.log('Usuario bloqueado - nuevo estado: false');
                setUser({
                    ...user,
                    is_active: false
                });
                toast.success('Usuario bloqueado exitosamente');
            }
        } catch (err) {
            console.error('Error al cambiar estado del usuario:', err);
            toast.error('Error al cambiar el estado del usuario');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/usuarios');
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}>
                <div className="text-center">
                    <Spinner animation="border" variant="dark" />
                    <p className="mt-3" style={{ color: '#000' }}>Cargando información del usuario...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}>
                <Container style={{ maxWidth: "600px" }}>
                    <Alert variant="danger">
                        {error || 'Usuario no encontrado'}
                    </Alert>
                    <Button variant="outline-dark" onClick={handleCancel}>
                        Volver
                    </Button>
                </Container>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px 60px 20px",
        }}>
            <Container style={{ maxWidth: "700px" }}>
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
                        <IoPersonOutline size={28} style={{ marginRight: '12px', marginBottom: '4px' }} />
                        Editar Usuario
                    </h2>
                    <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.95rem' }}>
                        Modifica la información del usuario
                    </p>
                </div>

                {/* Estado del usuario */}
                <Card
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        marginBottom: "24px",
                    }}
                >
                    <Card.Body className="p-4">
                        <h6 style={{ fontWeight: '600', color: '#000', marginBottom: '12px' }}>
                            Estado del Usuario
                        </h6>
                        <div className="d-flex justify-content-between align-items-center">
                            {user.is_active ? (
                                <Badge
                                    bg="success"
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        padding: '8px 20px',
                                        borderRadius: '8px',
                                        minWidth: '140px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <IoCheckmarkCircleOutline style={{ fontSize: '18px', margin: 0, flexShrink: 0 }} />
                                    <span style={{ lineHeight: 1 }}>Activo</span>
                                </Badge>
                            ) : (
                                <Badge
                                    bg="danger"
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        padding: '8px 20px',
                                        borderRadius: '8px',
                                        minWidth: '140px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <IoLockClosedOutline style={{ fontSize: '18px', margin: 0, flexShrink: 0 }} />
                                    <span style={{ lineHeight: 1 }}>Bloqueado</span>
                                </Badge>
                            )}
                            <Button
                                variant={user.is_active ? "danger" : "success"}
                                onClick={handleToggleBlock}
                                disabled={saving}
                                style={{
                                    minWidth: '140px',
                                    fontWeight: '500',
                                }}
                            >
                                {user.is_active ? 'Bloquear' : 'Desbloquear'}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
                {/* Formulario */}
                <Card
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        border: "none",
                    }}
                >
                    <Card.Body className="p-4">
                        <Form onSubmit={handleSubmit}>
                            {/* Nombre completo */}
                            <Form.Group className="mb-4">
                                <Form.Label style={{ fontWeight: '600', color: '#000' }}>
                                    <IoPersonOutline size={18} style={{ marginRight: '8px', marginBottom: '2px' }} />
                                    Nombre Completo
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        borderRadius: '8px',
                                        padding: '12px',
                                        border: '1px solid #dee2e6',
                                    }}
                                    placeholder="Ingresa el nombre completo"
                                />
                            </Form.Group>

                            {/* Email */}
                            <Form.Group className="mb-4">
                                <Form.Label style={{ fontWeight: '600', color: '#000' }}>
                                    <IoMailOutline size={18} style={{ marginRight: '8px', marginBottom: '2px' }} />
                                    Correo Electrónico
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        borderRadius: '8px',
                                        padding: '12px',
                                        border: '1px solid #dee2e6',
                                    }}
                                    placeholder="usuario@example.com"
                                />
                            </Form.Group>

                            {/* Botones */}
                            <div className="d-flex gap-3 mt-4">
                                <Button
                                    variant="dark"
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        fontWeight: '500',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {saving ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar Cambios'
                                    )}
                                </Button>
                                <Button
                                    variant="outline-dark"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        fontWeight: '500',
                                        borderRadius: '8px',
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default EditUser;
