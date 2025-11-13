import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import ReservationCard from '../components/bookings/ReservationCard';
import EditReservationModal from '../components/bookings/EditReservationModal';
import { getMyReservations, getCourts, updateOwnReservation } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useToast } from '../hooks/useToast';

const MyBookings = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [courts, setCourts] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

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

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const allCourts = await Promise.all([
                    getCourts('futbol'),
                    getCourts('tenis'),
                    getCourts('padel')
                ]);
                setCourts(allCourts.flat());
            } catch (err) {
                console.error('Error al cargar canchas:', err);
            }
        };

        fetchCourts();
    }, []);

    const handlePayClick = (reservationId) => {
        console.log('Pagar reserva:', reservationId);
        toast.info(`Procesando pago para reserva #${reservationId}`);
    };

    const handleEditClick = (reservationId) => {
        // Buscar la reserva en el estado local en lugar de hacer otra llamada a la API
        const reservation = reservations.find(r => r.id === reservationId);
        if (reservation) {
            setSelectedReservation(reservation);
            setShowEditModal(true);
        } else {
            toast.error('No se pudo cargar la reserva para editar');
        }
    };

    const handleSaveReservation = async (reservationId, updatedData) => {
        try {
            setIsSaving(true);
            await updateOwnReservation(reservationId, updatedData);
            
            // Recargar las reservas
            const data = await getMyReservations();
            const sortedData = data.sort((a, b) =>
                new Date(b.start_time) - new Date(a.start_time)
            );
            setReservations(sortedData);
            
            setShowEditModal(false);
            setSelectedReservation(null);
            toast.success('Reserva actualizada exitosamente');
        } catch (err) {
            console.error('Error al actualizar la reserva:', err);
            const errorMessage = err.detail || 'No se pudo actualizar la reserva';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setSelectedReservation(null);
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
                                        payButtonText={'Pagar'}
                                        onEditClick={handleEditClick}
                                        isAdmin={false}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Container>

            {/* Modal de edición */}
            {showEditModal && selectedReservation && (
                <EditReservationModal
                    show={showEditModal}
                    onHide={handleCloseModal}
                    reservation={selectedReservation}
                    courts={courts}
                    users={[]} // Los usuarios no necesitan ver la lista de usuarios
                    onSave={handleSaveReservation}
                    isSaving={isSaving}
                    isUserMode={true}
                />
            )}
        </div>
    );
};

export default MyBookings;