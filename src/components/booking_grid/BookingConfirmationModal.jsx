import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { IoCalendarOutline, IoTimeOutline, IoLocationOutline } from 'react-icons/io5';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';

// Inicializar Mercado Pago con la public key
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
if (MP_PUBLIC_KEY) {
    initMercadoPago(MP_PUBLIC_KEY);
}

const BookingConfirmationModal = ({
                                      show,
                                      onHide,
                                      bookingData,
                                      onPayInClub,
                                      onPayWithMercadoPago,
                                      preferenceId,
                                      isLoadingPreference
                                  }) => {
    const [extras, setExtras] = useState({
        light: false,
        ball: false,
        number_of_rackets: 0
    });
    
    const [timeSelection, setTimeSelection] = useState({
        startTime: '',
        endTime: ''
    });

    // Inicializar tiempos cuando se abre el modal
    useEffect(() => {
        if (bookingData && show) {
            const formatForInput = (dateString) => {
                const date = new Date(dateString);
                const hours = date.getUTCHours().toString().padStart(2, '0');
                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            setTimeSelection({
                startTime: formatForInput(bookingData.startTime),
                endTime: formatForInput(bookingData.endTime)
            });
        }
    }, [bookingData, show]);

    if (!bookingData) return null;

    const { courtName, date, court } = bookingData;

    // Calcular duración en horas basándose en los tiempos seleccionados
    const calculateDuration = () => {
        if (!timeSelection.startTime || !timeSelection.endTime) return 0;
        
        const [startHours, startMinutes] = timeSelection.startTime.split(':').map(Number);
        const [endHours, endMinutes] = timeSelection.endTime.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        const durationMinutes = endTotalMinutes - startTotalMinutes;
        return durationMinutes > 0 ? durationMinutes / 60 : 0;
    };

    // Calcular precio total incluyendo extras y duración
    const calculateTotalPrice = () => {
        const duration = calculateDuration();
        let total = court?.base_price * duration || 0;
        if (extras.light && court?.light_price) total += court.light_price;
        if (extras.ball && court?.ball_price) total += court.ball_price;
        if (extras.number_of_rackets > 0 && court?.racket_price) {
            total += court.racket_price * extras.number_of_rackets;
        }
        return total.toFixed(2);
    };

    const handleExtraChange = (field, value) => {
        setExtras(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTimeChange = (field, value) => {
        setTimeSelection(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const isValidTimeSelection = () => {
        if (!timeSelection.startTime || !timeSelection.endTime) return false;
        
        const [startHours, startMinutes] = timeSelection.startTime.split(':').map(Number);
        const [endHours, endMinutes] = timeSelection.endTime.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        return endTotalMinutes > startTotalMinutes;
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
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
                                <Row className="g-2" style={{ marginLeft: '28px' }}>
                                    <Col xs={12} sm={6}>
                                        <Form.Group>
                                            <Form.Label style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                Hora de inicio
                                            </Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={timeSelection.startTime}
                                                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <Form.Group>
                                            <Form.Label style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                Hora de fin
                                            </Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={timeSelection.endTime}
                                                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {isValidTimeSelection() && (
                                    <p style={{ 
                                        fontSize: '0.9rem', 
                                        color: '#000', 
                                        marginLeft: '28px', 
                                        marginTop: '8px',
                                        marginBottom: '0',
                                        fontWeight: '500'
                                    }}>
                                        Duración: {calculateDuration().toFixed(2)} hora(s)
                                    </p>
                                )}
                                {!isValidTimeSelection() && timeSelection.startTime && timeSelection.endTime && (
                                    <p style={{ 
                                        fontSize: '0.85rem', 
                                        color: '#dc3545', 
                                        marginLeft: '28px', 
                                        marginTop: '8px',
                                        marginBottom: '0'
                                    }}>
                                        La hora de fin debe ser posterior a la de inicio
                                    </p>
                                )}
                            </div>

                            {/* Extras */}
                            <div className="mt-4">
                                <h6 className="mb-3" style={{ fontWeight: '600', color: '#000' }}>
                                    Extras
                                </h6>
                                
                                {/* Luz artificial */}
                                {court?.light_price > 0 && (
                                    <Form.Check 
                                        type="checkbox"
                                        id="light-checkbox"
                                        label={`Luz artificial (+$${court.light_price})`}
                                        checked={extras.light}
                                        onChange={(e) => handleExtraChange('light', e.target.checked)}
                                        className="mb-2"
                                    />
                                )}

                                {/* Pelota */}
                                {court?.ball_price > 0 && (
                                    <Form.Check 
                                        type="checkbox"
                                        id="ball-checkbox"
                                        label={`Pelota (+$${court.ball_price})`}
                                        checked={extras.ball}
                                        onChange={(e) => handleExtraChange('ball', e.target.checked)}
                                        className="mb-2"
                                    />
                                )}

                                {/* Raquetas */}
                                {court?.racket_price > 0 && (
                                    <Form.Group className="mb-2">
                                        <Form.Label style={{ fontSize: '0.9rem' }}>
                                            Cantidad de raquetas (${court.racket_price} c/u)
                                        </Form.Label>
                                        <Form.Select
                                            value={extras.number_of_rackets}
                                            onChange={(e) => handleExtraChange('number_of_rackets', parseInt(e.target.value))}
                                            style={{ maxWidth: '120px' }}
                                        >
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                        </Form.Select>
                                    </Form.Group>
                                )}
                            </div>
                        </Col>

                        {/* Monto a pagar - Derecha */}
                        <Col xs={12} md={5} className="d-flex flex-column justify-content-end">
                            <div className="text-end">
                                <div className="mb-3">
                                    <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>
                                        Precio base (por hora)
                                    </p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#495057', marginBottom: '0' }}>
                                        ${court?.base_price || 0}
                                    </p>
                                </div>
                                {isValidTimeSelection() && (
                                    <div className="mb-3">
                                        <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>
                                            Subtotal cancha ({calculateDuration().toFixed(2)}h)
                                        </p>
                                        <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#495057', marginBottom: '0' }}>
                                            ${((court?.base_price || 0) * calculateDuration()).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                                {(extras.light || extras.ball || extras.number_of_rackets > 0) && (
                                    <div className="mb-3">
                                        <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>
                                            Extras
                                        </p>
                                        {extras.light && court?.light_price > 0 && (
                                            <p style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '2px' }}>
                                                Luz: ${court.light_price}
                                            </p>
                                        )}
                                        {extras.ball && court?.ball_price > 0 && (
                                            <p style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '2px' }}>
                                                Pelota: ${court.ball_price}
                                            </p>
                                        )}
                                        {extras.number_of_rackets > 0 && court?.racket_price > 0 && (
                                            <p style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '2px' }}>
                                                Raquetas ({extras.number_of_rackets}): ${court.racket_price * extras.number_of_rackets}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <hr style={{ borderColor: '#dee2e6', margin: '16px 0' }} />
                                <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '8px' }}>
                                    Total a pagar
                                </p>
                                <p style={{ fontSize: '3rem', fontWeight: '700', color: '#000', marginBottom: '0', lineHeight: '1' }}>
                                    ${calculateTotalPrice()}
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
                        onClick={() => {
                            if (!isValidTimeSelection()) return;
                            const bookingWithTimes = {
                                ...bookingData,
                                startTime: timeSelection.startTime,
                                endTime: timeSelection.endTime
                            };
                            onPayInClub(extras, bookingWithTimes);
                        }}
                        disabled={!isValidTimeSelection()}
                        style={{ minWidth: '180px', fontWeight: '500' }}
                    >
                        Pagar en el club
                    </Button>

                    {/* Botón derecho - Pagar con Mercado Pago */}
                    {preferenceId ? (
                        <div style={{ minWidth: '180px' }}>
                            <Wallet 
                                initialization={{ preferenceId: preferenceId }}
                                customization={{ texts: { valueProp: 'smart_option' } }}
                            />
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (!isValidTimeSelection()) return;
                                const bookingWithTimes = {
                                    ...bookingData,
                                    startTime: timeSelection.startTime,
                                    endTime: timeSelection.endTime
                                };
                                onPayWithMercadoPago(extras, bookingWithTimes);
                            }}
                            disabled={isLoadingPreference || !isValidTimeSelection()}
                            style={{ 
                                minWidth: '180px', 
                                fontWeight: '500',
                                backgroundColor: '#009ee3',
                                borderColor: '#009ee3'
                            }}
                        >
                            {isLoadingPreference ? 'Cargando...' : 'Pagar con Mercado Pago'}
                        </Button>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default BookingConfirmationModal;