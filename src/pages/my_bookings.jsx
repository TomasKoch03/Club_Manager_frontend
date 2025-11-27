import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import BookingConfirmationModal from '../components/booking_grid/BookingConfirmationModal';
import EditReservationModal from '../components/bookings/EditReservationModal';
import ReservationCard from '../components/bookings/ReservationCard';
import { useToast } from '../hooks/useToast';
import { createMercadoPagoPreference, getAllCourts, getMyReservations, postPayment, updateOwnReservation } from '../services/api';

const MyBookings = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [courts, setCourts] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentReservation, setSelectedPaymentReservation] = useState(null);
    const [preferenceId, setPreferenceId] = useState(null);
    const [isLoadingPreference, setIsLoadingPreference] = useState(false);
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
        const reservation = reservations.find(r => r.id === reservationId);
        if (reservation) {
            // Verificar si ya tiene un pago aprobado o pagado
            if (reservation.payment && (reservation.payment.status === 'pagado' || reservation.payment.status === 'aprobado' || reservation.payment.status === 'approved')) {
                toast.info('Esta reserva ya está pagada');
                return;
            }

            // La cancha ya viene en el objeto de reserva desde el backend
            const court = reservation.court;
            
            if (!court) {
                toast.error('No se pudo cargar la información de la cancha');
                return;
            }

            // Preparar los datos para el modal
            const bookingData = {
                courtId: court.id,
                courtName: court.name,
                date: reservation.start_time,
                startTime: reservation.start_time,
                endTime: reservation.end_time,
                court: court,
                reservationId: reservation.id,
                payment: reservation.payment, // Incluir el pago existente si lo hay
                // Incluir los extras de la reserva existente
                initialExtras: {
                    light: reservation.light || false,
                    ball: reservation.ball || false,
                    number_of_rackets: reservation.number_of_rackets || 0
                },
                isExistingReservation: true // Flag para indicar que es una reserva existente
            };

            setSelectedPaymentReservation(bookingData);
            setPreferenceId(null);
            setShowPaymentModal(true);
        } else {
            toast.error('No se pudo cargar la reserva para pagar');
        }
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

    const handlePayInClub = async (extras) => {
        if (!selectedPaymentReservation) return;

        try {
            // Calcular duración en horas
            const startTime = new Date(selectedPaymentReservation.startTime);
            const endTime = new Date(selectedPaymentReservation.endTime);
            const durationHours = (endTime - startTime) / (1000 * 60 * 60);

            // Calcular el monto total: precio_base * duración + extras
            const court = selectedPaymentReservation.court;
            let totalAmount = court.base_price * durationHours;
            if (extras.light && court.light_price) totalAmount += court.light_price;
            if (extras.ball && court.ball_price) totalAmount += court.ball_price;
            if (extras.number_of_rackets > 0 && court.racket_price) {
                totalAmount += court.racket_price * extras.number_of_rackets;
            }

            await postPayment({
                method: 'efectivo',
                status: 'pendiente',
                amount: totalAmount,
                reservation_id: selectedPaymentReservation.reservationId
            });

            toast.success('Reserva registrada exitosamente. Podrás pagar en el club.');

            // Recargar reservas
            const data = await getMyReservations();
            const sortedData = data.sort((a, b) =>
                new Date(b.start_time) - new Date(a.start_time)
            );
            setReservations(sortedData);

            setShowPaymentModal(false);
            setSelectedPaymentReservation(null);
        } catch (error) {
            console.error('Error al registrar pago:', error);
            toast.error('No se pudo registrar el pago.');
        }
    };

    const handlePayWithMercadoPago = async (extras) => {
        if (!selectedPaymentReservation) return;

        try {
            setIsLoadingPreference(true);

            // Si ya existe un pago con método mercadopago, intentar crear la preferencia directamente
            const preference = await createMercadoPagoPreference(selectedPaymentReservation.reservationId);
            
            if (preference && (preference.id || preference.preference_id)) {
                // El backend devuelve 'id', pero por compatibilidad verificamos ambos
                setPreferenceId(preference.id || preference.preference_id);
            } else {
                throw new Error('No se recibió preference_id del servidor');
            }

        } catch (error) {
            console.error('Error al crear preferencia de Mercado Pago:', error);
            const errorMessage = error?.detail || error?.message || 'No se pudo iniciar el pago con Mercado Pago.';
            toast.error(errorMessage);
        } finally {
            setIsLoadingPreference(false);
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

            {/* Modal de pago */}
            {showPaymentModal && selectedPaymentReservation && (
                <BookingConfirmationModal
                    show={showPaymentModal}
                    onHide={() => {
                        setShowPaymentModal(false);
                        setSelectedPaymentReservation(null);
                        setPreferenceId(null);
                    }}
                    bookingData={selectedPaymentReservation}
                    onPayInClub={handlePayInClub}
                    onPayWithMercadoPago={handlePayWithMercadoPago}
                    preferenceId={preferenceId}
                    isLoadingPreference={isLoadingPreference}
                />
            )}
        </div>
    );
};

export default MyBookings;