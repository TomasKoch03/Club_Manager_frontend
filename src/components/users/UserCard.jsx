import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { IoPersonOutline, IoMailOutline } from 'react-icons/io5';
import {useNavigate, useParams} from 'react-router-dom';

const UserCard = ({ user }) => {
    const { sport } = useParams();
    const navigate = useNavigate();

    const handleSelectUser = () => {
        navigate(`/admin/reservar/${sport}/${user.id}/calendar`);
    };

    return (
        <Card
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                border: "none",
                marginBottom: "16px",
            }}
        >
            <Card.Body className="p-4">
                <Row>
                    <Col xs={12} md={8}>
                        {/* Nombre completo */}
                        <div className="mb-3">
                            <h5 className="mb-1" style={{ fontWeight: '600', color: '#000' }}>
                                <IoPersonOutline size={20} style={{ marginRight: '8px', marginBottom: '2px' }} />
                                {user.full_name}
                            </h5>
                        </div>

                        {/* Email */}
                        <div className="mb-2">
                            <IoMailOutline size={18} style={{ marginRight: '8px', color: '#6c757d' }} />
                            <span style={{ color: '#495057', fontSize: '0.95rem' }}>
                                {user.email}
                            </span>
                        </div>
                    </Col>

                    <Col xs={12} md={4} className="d-flex flex-column justify-content-end align-items-end mt-3 mt-md-0">
                        {/* Botón de seleccionar */}
                        <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={handleSelectUser}
                            style={{
                                minWidth: '120px',
                                fontWeight: '500',
                            }}
                        >
                            Seleccionar
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default UserCard;