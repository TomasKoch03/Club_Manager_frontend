import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { getUserData, modifyUser } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useToast } from '../hooks/useToast';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        full_name: '',
        email: ''
    });
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUserData();
            setUserData(data);
            setEditedData({
                full_name: data.full_name,
                email: data.email
            });
        } catch (err) {
            toast.error('Error al cargar los datos del usuario');
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditedData({
            full_name: userData.full_name,
            email: userData.email
        });
    };

    const handleSaveClick = async () => {
        try {
            setSaving(true);
            await modifyUser(editedData);
            const updatedData = await getUserData();
            setUserData(updatedData);
            setIsEditing(false);
            toast.success('Datos actualizados correctamente');
        } catch (err) {
            toast.error('Error al guardar los cambios');
            console.error('Error saving user data:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 20px 60px 20px",
            }}
        >
            <Container fluid style={{ maxWidth: "800px" }}>
                <Row className="justify-content-center">
                    <Col xs={12}>
                        <Card
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "16px",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                border: "none",
                            }}
                        >
                            <Card.Body className="p-5">
                                <h2 className="text-center mb-4" style={{ fontWeight: '600', color: '#000' }}>
                                    Mi Perfil
                                </h2>

                                {userData && (
                                    <Form>
                                        <Form.Group className="mb-4">
                                            <Form.Label column={false} style={{ fontWeight: '600', color: '#000' }}>
                                                Nombre Completo
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="full_name"
                                                value={isEditing ? editedData.full_name : userData.full_name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                style={{
                                                    backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label column={false} style={{ fontWeight: '600', color: '#000' }}>
                                                Email
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={isEditing ? editedData.email : userData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                style={{
                                                    backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </Form.Group>

                                        <div className="d-flex justify-content-center gap-3 mt-4">
                                            {!isEditing ? (
                                                <Button
                                                    variant="outline-dark"
                                                    size="lg"
                                                    onClick={handleEditClick}
                                                    style={{
                                                        borderRadius: '8px',
                                                        padding: '12px 40px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    Modificar
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="outline-dark"
                                                        size="lg"
                                                        onClick={handleSaveClick}
                                                        disabled={saving}
                                                        style={{
                                                            borderRadius: '8px',
                                                            padding: '12px 40px',
                                                            fontWeight: '600',
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
                                                            'Guardar'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline-dark"
                                                        size="lg"
                                                        onClick={handleCancelClick}
                                                        disabled={saving}
                                                        style={{
                                                            borderRadius: '8px',
                                                            padding: '12px 40px',
                                                            fontWeight: '600',
                                                        }}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;
