import React from "react";
import { Container, Row, Col, Card } from 'react-bootstrap';
import { IoCalendarOutline } from 'react-icons/io5';
import { FaRegUserCircle } from 'react-icons/fa';
import HomeActionButton from '../components/home/HomeActionButton';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminHome = () => {
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
            <Container fluid style={{ maxWidth: "1400px" }}>
                <Row className="g-4">
                    {/* Tarjeta izquierda - Reservar deportes */}
                    <Col xs={12} lg={6}>
                        <Card
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "16px",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                border: "none",
                                height: "100%",
                                minHeight: "500px",
                            }}
                        >
                            <Card.Body className="p-4 d-flex flex-column">
                                <h3 className="text-center mb-4" style={{ fontWeight: '600', color: '#000' }}>
                                    Gestionar Usuarios
                                </h3>
                                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                                    <div style={{ width: '100%', maxWidth: '400px' }}>
                                        <HomeActionButton
                                            icon={FaRegUserCircle}
                                            text="Usuarios"
                                            href="/admin/usuarios"
                                        />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Tarjeta derecha - Mis reservas */}
                    <Col xs={12} lg={6}>
                        <Card
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "16px",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                border: "none",
                                height: "100%",
                                minHeight: "500px",
                            }}
                        >
                            <Card.Body className="p-4">
                                <h3 className="text-center mb-4" style={{ fontWeight: '600', color: '#000' }}>
                                    Gestionar Reservas
                                </h3>
                                <Row className="g-3 h-100">
                                    <Col xs={12} md={6} className={ "my-5" }>
                                        <HomeActionButton
                                            icon={IoCalendarOutline}
                                            text="Todas las reservas"
                                            href="/admin/reservas"
                                        />
                                    </Col>
                                    <Col xs={12} md={6} className={ "my-5" }>
                                        <HomeActionButton
                                            icon={IoCalendarOutline}
                                            text="Nueva Reserva"
                                            href="/admin/reservar"
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminHome;