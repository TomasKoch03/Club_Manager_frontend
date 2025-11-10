import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { IoCheckmarkCircleOutline, IoLockClosedOutline, IoMailOutline, IoPersonOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const UserManagementCard = ({ user }) => {
    const navigate = useNavigate();

    const handleEditUser = () => {
        navigate(`/admin/usuarios/${user.id}/edit`);
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
                <Row className="align-items-center">
                    <Col xs={12} md={6}>
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

                    <Col xs={12} md={3} className="d-flex justify-content-md-center mt-3 mt-md-0">
                        {/* Estado del usuario */}
                        {user.is_active ?(
                            <Badge
                                bg="success"
                                style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '500',
                                    padding: '12px 32px',
                                    borderRadius: '12px',
                                    minWidth: '160px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                }}
                            >
                                <IoCheckmarkCircleOutline style={{ fontSize: '20px', margin: 0, flexShrink: 0 }} />
                                <span style={{ lineHeight: 1 }}>Activo</span>
                            </Badge>
                        )
                        :    <Badge
                                bg="danger"
                                style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '500',
                                    padding: '12px 32px',
                                    borderRadius: '12px',
                                    minWidth: '160px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                }}
                            >
                                <IoLockClosedOutline style={{ fontSize: '20px', margin: 0, flexShrink: 0 }} />
                                <span style={{ lineHeight: 1 }}>Bloqueado</span>
                            </Badge>
                        }
                    </Col>

                    <Col xs={12} md={3} className="d-flex justify-content-end mt-3 mt-md-0">
                        {/* Botón de editar */}
                        <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={handleEditUser}
                            style={{
                                minWidth: '120px',
                                fontWeight: '500',
                            }}
                        >
                            Modificar
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default UserManagementCard;
