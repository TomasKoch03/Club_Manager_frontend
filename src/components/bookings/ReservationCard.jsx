import React from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { IoCalendarOutline, IoTimeOutline, IoLocationOutline } from 'react-icons/io5';

const ReservationCard = ({ reservation, onPayClick, payButtonText }) => {
    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Formatear hora
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Capitalizar primera letra
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const isPaid = reservation.payment?.status === "pagado";
    const paymentStatus = reservation.payment
        ? reservation.payment.status.toUpperCase()
        : "SIN PAGAR";

    // Obtener monto
    const paymentAmount = Number(reservation.payment?.amount ?? reservation.court?.price ?? 0);

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
                        {/* Nombre de la cancha y deporte */}
                        <div className="mb-3">
                            <h5 className="mb-1" style={{ fontWeight: '600', color: '#000' }}>
                                <IoLocationOutline size={20} style={{ marginRight: '8px', marginBottom: '2px' }} />
                                {reservation.court.name}
                            </h5>
                            <Badge bg="dark" style={{ fontSize: '0.85rem' }}>
                                {capitalize(reservation.court.sport)}
                            </Badge>
                        </div>

                        {/* Fecha del turno */}
                        <div className="mb-2">
                            <IoCalendarOutline size={18} style={{ marginRight: '8px', color: '#6c757d' }} />
                            <span style={{ color: '#495057', fontSize: '0.95rem' }}>
                                {formatDate(reservation.start_time)}
                            </span>
                        </div>

                        {/* Horario */}
                        <div className="mb-2">
                            <IoTimeOutline size={18} style={{ marginRight: '8px', color: '#6c757d' }} />
                            <span style={{ color: '#495057', fontSize: '0.95rem', fontWeight: '500' }}>
                                {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                            </span>
                        </div>

                        {/* Fecha de solicitud */}
                        <div>
                            <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                                Solicitado el {formatDate(reservation.created_at)}
                            </small>
                        </div>
                    </Col>

                    {/* Lado derecho: estado + monto + botón */}
                    <Col xs={12} md={4} className="d-flex flex-column justify-content-between align-items-end mt-3 mt-md-0">
                        {/* Estado de pago */}
                        <div className="text-end mb-2">
                            <span
                                style={{
                                    color: isPaid ? '#28a745' : '#dc3545',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                }}
                            >
                                {paymentStatus}
                            </span>

                            {/* Monto */}
                            <div style={{ marginTop: '6px', color: '#000', fontWeight: '500', fontSize: '0.95rem' }}>
                                ${paymentAmount.toFixed(2)}
                            </div>
                        </div>

                        {/* Botón de pagar / ver pago */}
                        <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={() => onPayClick(reservation.id)}
                            style={{
                                minWidth: '100px',
                                fontWeight: '500',
                            }}
                        >
                            {payButtonText}
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ReservationCard;