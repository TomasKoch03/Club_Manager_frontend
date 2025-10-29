import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import ReservationCard from '../components/bookings/ReservationCard';
import { getMyReservations } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const MyBookings = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const data = await getMyReservations();
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

    const handlePayClick = (reservationId) => {
        console.log('Pagar reserva:', reservationId);
        alert(`Procesando pago para reserva #${reservationId}`);
    };

    return (
        // <CHANGE> Contenedor con altura fija y overflow para permitir scroll
        <div style={{
            height: 'calc(100vh - 80px)', // Altura del viewport menos el navbar aproximadamente
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "40px 20px 60px 20px"
        }}>
            {/* <CHANGE> Estilos personalizados para el scrollbar */}
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
                {/* Título */}
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
                        Mis Reservas
                    </h2>
                    <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.95rem' }}>
                        Aquí puedes ver todas tus reservas y gestionar los pagos
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3" style={{ color: '#000' }}>Cargando reservas...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <Alert variant="danger" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
                        {error}
                    </Alert>
                )}

                {/* Lista de reservas */}
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
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default MyBookings;