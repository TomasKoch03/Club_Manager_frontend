import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { IoCalendarOutline, IoTimeOutline, IoLocationOutline, IoPerson, IoLockClosed } from 'react-icons/io5';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditReservationModal = ({
    show,
    onHide,
    reservation,
    courts,
    users,
    onSave,
    isSaving
}) => {
    const [formData, setFormData] = useState({
        court_id: '',
        user_id: '',
        start_time: '',
        end_time: ''
    });
    const [localError, setLocalError] = useState('');

    // Inicializar formulario cuando cambia la reserva
    useEffect(() => {
        if (reservation) {
            // Convertir las fechas ISO a formato datetime-local para el input
            const startDate = new Date(reservation.start_time);
            const endDate = new Date(reservation.end_time);
            
            // Formatear a YYYY-MM-DDTHH:MM para datetime-local input
            const formatForInput = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                court_id: reservation.court.id,
                user_id: reservation.user.id,
                start_time: formatForInput(startDate),
                end_time: formatForInput(endDate)
            });
            setLocalError('');
        }
    }, [reservation]);

    if (!reservation) return null;

    const hasPayment = reservation.payment == "pendiente";

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setLocalError('');
    };

    const validateForm = () => {
        // Validar que la hora de fin sea posterior a la de inicio
        const startDate = new Date(formData.start_time);
        const endDate = new Date(formData.end_time);

        if (endDate <= startDate) {
            setLocalError('La hora de fin debe ser posterior a la hora de inicio');
            return false;
        }

        // Validar que todos los campos estén completos
        if (!formData.court_id || !formData.user_id || !formData.start_time || !formData.end_time) {
            setLocalError('Todos los campos son obligatorios');
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Convertir las fechas del input datetime-local a formato ISO 8601 LOCAL (sin zona horaria)
        // Formato esperado: "2025-11-20T14:00:00" (sin Z ni offset)
        const formatToLocalISO = (dateTimeLocal) => {
            // dateTimeLocal ya está en formato "YYYY-MM-DDTHH:MM"
            // Solo necesitamos agregar :00 para los segundos
            return `${dateTimeLocal}:00`;
        };

        const payload = {
            court_id: parseInt(formData.court_id),
            user_id: parseInt(formData.user_id),
            start_time: formatToLocalISO(formData.start_time),
            end_time: formatToLocalISO(formData.end_time)
        };

        onSave(reservation.id, payload);
    };

    const selectedCourt = courts.find(c => c.id === parseInt(formData.court_id));
    const selectedUser = users.find(u => u.id === parseInt(formData.user_id));

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            backdrop="static"
        >
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
                        {hasPayment ? 'Detalles de la Reserva' : 'Editar Reserva'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: '32px' }}>
                    {/* Alerta si tiene pago asociado */}
                    {hasPayment && (
                        <Alert variant="warning" className="d-flex align-items-center mb-4">
                            <IoLockClosed size={24} style={{ marginRight: '12px' }} />
                            <div>
                                <strong>⚠️ Esta reserva no se puede modificar</strong>
                                <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                                    La reserva tiene un pago asociado y no puede ser editada.
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Error local de validación */}
                    {localError && (
                        <Alert variant="danger" className="mb-4">
                            {localError}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            {/* Columna izquierda - Usuario y Cancha */}
                            <Col xs={12} md={6}>
                                {/* Select de Usuario */}
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '500', color: '#000' }}>
                                        <IoPerson size={18} style={{ marginRight: '8px' }} />
                                        Usuario
                                    </Form.Label>
                                    <Form.Select
                                        value={formData.user_id}
                                        onChange={(e) => handleInputChange('user_id', e.target.value)}
                                        disabled={hasPayment}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px',
                                            opacity: hasPayment ? 0.6 : 1
                                        }}
                                    >
                                        <option value="">Seleccionar usuario...</option>
                                        {users.filter(u => u.is_active).map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name} ({user.email})
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {selectedUser && (
                                        <Form.Text className="text-muted">
                                            Email: {selectedUser.email}
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                {/* Select de Cancha */}
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '500', color: '#000' }}>
                                        <IoLocationOutline size={18} style={{ marginRight: '8px' }} />
                                        Cancha
                                    </Form.Label>
                                    <Form.Select
                                        value={formData.court_id}
                                        onChange={(e) => handleInputChange('court_id', e.target.value)}
                                        disabled={hasPayment}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px',
                                            opacity: hasPayment ? 0.6 : 1
                                        }}
                                    >
                                        <option value="">Seleccionar cancha...</option>
                                        {courts.map(court => (
                                            <option key={court.id} value={court.id}>
                                                {court.name} - {court.sport}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {selectedCourt && (
                                        <Form.Text className="text-muted">
                                            Deporte: {selectedCourt.sport} | Precio: ${selectedCourt.amount}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Columna derecha - Fechas */}
                            <Col xs={12} md={6}>
                                {/* Fecha y Hora de Inicio */}
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '500', color: '#000' }}>
                                        <IoCalendarOutline size={18} style={{ marginRight: '8px' }} />
                                        Fecha y Hora de Inicio
                                    </Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={(e) => handleInputChange('start_time', e.target.value)}
                                        disabled={hasPayment}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px',
                                            opacity: hasPayment ? 0.6 : 1
                                        }}
                                    />
                                </Form.Group>

                                {/* Fecha y Hora de Fin */}
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '500', color: '#000' }}>
                                        <IoTimeOutline size={18} style={{ marginRight: '8px' }} />
                                        Fecha y Hora de Fin
                                    </Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.end_time}
                                        onChange={(e) => handleInputChange('end_time', e.target.value)}
                                        disabled={hasPayment}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px',
                                            opacity: hasPayment ? 0.6 : 1
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Información adicional */}
                        <div 
                            className="mt-3 p-3" 
                            style={{ 
                                backgroundColor: '#f8f9fa', 
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <div className="mb-2">
                                <strong>Reserva ID:</strong> #{reservation.id}
                            </div>
                            <div className="mb-2">
                                <strong>Estado:</strong> {reservation.status}
                            </div>
                            <div>
                                <strong>Creada el:</strong> {formatDate(reservation.created_at)}
                            </div>
                        </div>
                    </Form>
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
                    <Button
                        variant="outline-dark"
                        onClick={onHide}
                        disabled={isSaving}
                        style={{ minWidth: '120px', fontWeight: '500' }}
                    >
                        {hasPayment ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {!hasPayment && (
                        <Button
                            variant="dark"
                            onClick={handleSubmit}
                            disabled={isSaving}
                            style={{ minWidth: '120px', fontWeight: '500' }}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default EditReservationModal;
