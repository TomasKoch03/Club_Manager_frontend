import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IoWarningOutline, IoCalendarOutline, IoTimeOutline, IoLocationOutline } from 'react-icons/io5';
import 'bootstrap/dist/css/bootstrap.min.css';

const CancelReservationModal = ({ 
    show, 
    onHide, 
    reservation, 
    onConfirm, 
    isProcessing 
}) => {
    if (!reservation) return null;

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const day = days[date.getDay()];
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('es-AR', { month: 'long' });
        return `${day} ${dayNum} de ${month}`;
    };

    // Formatear hora
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static" 
        >
            <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "none",
                overflow: "hidden"
            }}>
                <Modal.Header 
                    closeButton 
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                >
                    <Modal.Title className="text-danger d-flex align-items-center gap-2" style={{ fontWeight: '600', fontSize: '1.2rem' }}>
                        <IoWarningOutline size={24} />
                        Cancelar Reserva
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-4">
                    <p className="mb-4 text-gray-600">
                        ¿Estás seguro que deseas cancelar esta reserva? Esta acción <strong>no se puede deshacer</strong>.
                    </p>

                    {/* Tarjeta de resumen de la reserva */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex items-start gap-3 mb-2">
                            <IoLocationOutline className="mt-1 text-blue-600" />
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cancha</span>
                                <p className="font-semibold text-gray-900 m-0">{reservation.court.name} ({reservation.court.sport})</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mb-2">
                            <IoCalendarOutline className="mt-1 text-purple-600" />
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</span>
                                <p className="font-semibold text-gray-900 m-0">{formatDate(reservation.start_time)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <IoTimeOutline className="mt-1 text-orange-600" />
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horario</span>
                                <p className="font-semibold text-gray-900 m-0">
                                    {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer style={{ borderTop: '1px solid #f0f0f0', padding: '1rem 1.5rem' }}>
                    <Button 
                        variant="light" 
                        onClick={onHide}
                        disabled={isProcessing}
                        className="rounded-lg px-4 font-medium"
                    >
                        Volver
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => onConfirm(reservation.id)}
                        disabled={isProcessing}
                        className="rounded-lg px-4 font-medium d-flex align-items-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Cancelando...
                            </>
                        ) : (
                            'Confirmar Cancelación'
                        )}
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default CancelReservationModal;