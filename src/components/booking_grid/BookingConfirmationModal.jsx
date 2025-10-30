import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { IoCalendarOutline, IoTimeOutline, IoLocationOutline } from 'react-icons/io5';
import 'bootstrap/dist/css/bootstrap.min.css';

const BookingConfirmationModal = ({
                                      show,
                                      onHide,
                                      bookingData,
                                      onPayInClub,
                                      onPayWithMercadoPago
                                  }) => {
    if (!bookingData) return null;

    const { courtName, date, startTime, endTime, amount } = bookingData;

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Formatear hora (HH:MM)
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            backdrop="static"
            style={{
                backdropFilter: 'blur(8px)',
            }}
        >
            <style>
                {`
                    .modal-backdrop.show {
                        backdrop-filter: blur(8px);
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                `}
            </style>
            <div
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: "none",
                }}
            >
                <Modal.Header
                    closeButton
                    style={{
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: 'transparent',
                    }}
                >
                    <Modal.Title style={{ fontWeight: '600', color: '#000' }}>
                        Confirmar Reserva
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: '32px' }}>
                    <Row>
                        {/* Información de la reserva - Izquierda */}
                        <Col xs={12} md={7} className="mb-4 mb-md-0">
                            <h5 className="mb-4" style={{ fontWeight: '600', color: '#000' }}>
                                Detalles de la Reserva
                            </h5>

                            {/* Cancha */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <IoLocationOutline size={20} style={{ marginRight: '8px', color: '#6c757d' }} />
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                        Cancha
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.1rem', color: '#000', marginLeft: '28px', marginBottom: '0' }}>
                                    {courtName}
                                </p>
                            </div>

                            {/* Fecha */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <IoCalendarOutline size={20} style={{ marginRight: '8px', color: '#6c757d' }} />
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                        Fecha
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.1rem', color: '#000', marginLeft: '28px', marginBottom: '0' }}>
                                    {formatDate(date)}
                                </p>
                            </div>

                            {/* Horario */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <IoTimeOutline size={20} style={{ marginRight: '8px', color: '#6c757d' }} />
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                        Horario
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.1rem', color: '#000', marginLeft: '28px', marginBottom: '0', fontWeight: '500' }}>
                                    {formatTime(startTime)} - {formatTime(endTime)}
                                </p>
                            </div>
                        </Col>

                        {/* Monto a pagar - Derecha */}
                        <Col xs={12} md={5} className="d-flex flex-column justify-content-end">
                            <div className="text-end">
                                <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '8px' }}>
                                    Total a pagar
                                </p>
                                <p style={{ fontSize: '3rem', fontWeight: '700', color: '#000', marginBottom: '0', lineHeight: '1' }}>
                                    ${amount}
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer
                    style={{
                        borderTop: '1px solid #dee2e6',
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '20px 32px',
                    }}
                >
                    {/* Botón izquierdo - Pagar en el club */}
                    <Button
                        variant="outline-dark"
                        onClick={onPayInClub}
                        style={{ minWidth: '180px', fontWeight: '500' }}
                    >
                        Pagar en el club
                    </Button>

                    {/* Botón derecho - Pagar con Mercado Pago */}
                    <Button
                        variant="outline-dark"
                        onClick={onPayWithMercadoPago}
                        style={{ minWidth: '180px', fontWeight: '500' }}
                    >
                        Pagar con Mercado Pago
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default BookingConfirmationModal;