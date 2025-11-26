import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import EditReservationModal from '../components/bookings/EditReservationModal';
import ReservationCard from '../components/bookings/ReservationCard';
import { useToast } from '../hooks/useToast';
import { getAllCourts, getMyReservations, updateOwnReservation } from '../services/api';

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
                    getAllCourts()
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
            <div className="max-w-6xl mx-auto pb-20 reservations-container">
                {/* Título */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Mis Reservas
                    </h2>
                    <p className="text-gray-600">
                        Aquí puedes ver todas tus reservas y gestionar los pagos
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3 text-gray-600">Cargando reservas...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                        {error}
                    </div>
                )}

                {/* Lista de reservas */}
                {!loading && !error && (
                    <>
                        {reservations.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    No tienes reservas aún
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
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
            </div>

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