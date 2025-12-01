import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IoCashOutline, IoCheckmarkCircleOutline, IoCardOutline } from 'react-icons/io5';
import 'bootstrap/dist/css/bootstrap.min.css';
import { formatCurrency } from '../../utils/formatCurrency';

const PaymentDetailsModal = ({
                                 show,
                                 onHide,
                                 reservation,
                                 onApprovePayment
                             }) => {
    if (!reservation) return null;

    const { payment } = reservation;

    // Mapeo de métodos de pago
    const paymentMethodLabels = {
        'MP': 'Mercado Pago',
        'cash': 'Efectivo',
        'card': 'Tarjeta',
        'transfer': 'Transferencia'
    };

    // Mapeo de estados de pago
    const paymentStatusLabels = {
        'aprobado': 'Aprobado',
        'pendiente': 'Pendiente',
        'rechazado': 'Rechazado',
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'pagado': 'Pagado',
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="md"
            backdrop="static"
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
                        Detalles del Pago
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: '32px' }}>
                    {payment ? (
                        <>
                            {/* Estado del pago */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <IoCheckmarkCircleOutline size={20} style={{ marginRight: '8px', color: '#6c757d' }} />
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                        Estado
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.1rem', color: '#000', marginLeft: '28px', marginBottom: '0', fontWeight: '500' }}>
                                    {paymentStatusLabels[payment.status] || payment.status}
                                </p>
                            </div>

                            {/* Monto */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <IoCashOutline size={20} style={{ marginRight: '8px', color: '#6c757d' }} />
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                        Monto
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.5rem', color: '#000', marginLeft: '28px', marginBottom: '0', fontWeight: '700' }}>
                                    ${formatCurrency(payment.amount)}
                                </p>
                            </div>

                            {/* Método de pago */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <IoCardOutline size={20} style={{ marginRight: '8px', color: '#6c757d' }} />
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                        Método de Pago
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.1rem', color: '#000', marginLeft: '28px', marginBottom: '0' }}>
                                    {paymentMethodLabels[payment.method] || payment.method}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <p style={{ fontSize: '1.1rem', color: '#6c757d', marginBottom: '0' }}>
                                No se estableció pago
                            </p>
                        </div>
                    )}
                </Modal.Body>

                {payment && (
                    <Modal.Footer
                        style={{
                            borderTop: '1px solid #dee2e6',
                            backgroundColor: 'transparent',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            padding: '20px 32px',
                        }}
                    >
                        <Button
                            variant="outline-dark"
                            onClick={() => onApprovePayment(reservation.id)}
                            style={{ minWidth: '150px', fontWeight: '500' }}
                        >
                            Aprobar Pago
                        </Button>
                    </Modal.Footer>
                )}
            </div>
        </Modal>
    );
};

export default PaymentDetailsModal;