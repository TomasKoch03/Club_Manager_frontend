import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import ReservationCard from '../components/bookings/ReservationCard';
import PaymentDetailsModal from '../components/bookings/PaymentDetailsModal'; // <CHANGE> Importar el modal de pago
import { getAllReservations, patchPayment } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const AllBookings = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // <CHANGE> Estados para el modal de pago
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const data = await getAllReservations();
                const sortedData = data.sort((a, b) =>
                    new Date(b.start_time) - new Date(a.start_time)
                );
                setReservations(sortedData);
                setError(null);
            } catch (err) {
                console.error('Error al cargar reservas:', err);
                setError('No se pudieron cargar las reservas. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    // <CHANGE> Modificado para abrir el modal con la información del pago
    const handlePayClick = (reservationId) => {
        const reservation = reservations.find(r => r.id === reservationId);
        if (reservation) {
            setSelectedReservation(reservation);
            setShowPaymentModal(true);
        }
    };

    // <CHANGE> Handler para aprobar el pago (placeholder para funcionalidad futura)
    const handleApprovePayment = async (reservationId) => {
        const reservation = reservations.find(r => r.id === reservationId);
        try {
            await patchPayment(reservation.payment.id, { status: 'aprobado' })

            setLoading(true);
            const data = await getAllReservations();
            const sortedData = data.sort((a, b) =>
                new Date(b.start_time) - new Date(a.start_time)
            );
            setReservations(sortedData);
            setError(null);

            setShowPaymentModal(false);
            setSelectedReservation(null);
        } catch (err) {
            console.error('Error al cargar reservas:', err);
            setError('No se pudieron cargar las reservas. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "40px 20px 60px 20px"
        }}>
            <style>
                {`
                    .reservations-container::-webkit-scrollbar {
                        width: 10px;
                    }
                    .reservations-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .reservations-container::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .reservations-container::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                `}
            </style>
            <Container style={{ maxWidth: "900px" }} className="reservations-container">
                {/* ... existing code ... */}

                <div
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        padding: "24px",
                        marginBottom: "24px",
                    }}
                >
                    <h2 className="mb-0" style={{ fontWeight: '600', color: '#000' }}>
                        Reservas
                    </h2>
                    <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.95rem' }}>
                        Aquí puedes ver las reservas de tus clientes y gestionar los pagos
                    </p>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3" style={{ color: '#000' }}>Cargando reservas...</p>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && (
                    <>
                        {reservations.length === 0 ? (
                            <div
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    border: "none",
                                    padding: "48px 24px",
                                    textAlign: "center",
                                }}
                            >
                                <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '0' }}>
                                    No tienes reservas aún
                                </p>
                            </div>
                        ) : (
                            <div>
                                {reservations.map((reservation) => (
                                    <ReservationCard
                                        key={reservation.id}
                                        reservation={reservation}
                                        onPayClick={handlePayClick}
                                        payButtonText={'Ver pago'}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Container>

            {/* <CHANGE> Modal de detalles de pago */}
            <PaymentDetailsModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                reservation={selectedReservation}
                onApprovePayment={handleApprovePayment}
            />
        </div>
    );
};

export default AllBookings;