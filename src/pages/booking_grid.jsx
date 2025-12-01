import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BookingConfirmationModal from '../components/booking_grid/BookingConfirmationModal.jsx'; // <CHANGE> Importar el modal
import BookingGridHeader from '../components/booking_grid/BookingGridHeader.jsx';
import BookingTable from '../components/booking_grid/BookingTable.jsx';
import { useToast } from '../hooks/useToast';
import { createMercadoPagoPreference, getCourts, getReservationsBySportAndDay, getUserById, getUserData, postPayment, postReservation, postReservationForUser } from "../services/api.js";

const BOOKING_CONFIG = {
    startHour: 9,
    endHour: 22,
    slotDuration: 30 // Cambiado a 30 minutos
};

const BookingGrid = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const date = searchParams.get("date")
    const { sport, userId } = useParams()
    const [selectedDate, setSelectedDate] = useState(new Date(`${date}T00:00:00`));
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [preferenceId, setPreferenceId] = useState(null);
    const [isLoadingPreference, setIsLoadingPreference] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const toast = useToast();

    const generateTimeSlots = () => {
        const slots = [];
        // Generar slots de 30 minutos
        for (let hour = BOOKING_CONFIG.startHour; hour < BOOKING_CONFIG.endHour; hour++) {
            for (let minute = 0; minute < 60; minute += BOOKING_CONFIG.slotDuration) {
                const time = hour + minute / 60;
                const label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({
                    time,
                    hour,
                    minute,
                    label
                });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userData = await getUserData();
                setCurrentUser({
                    ...userData,
                    is_blocked: !userData.is_active // Si no está activo, está bloqueado
                });
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const fetchSelectedUser = async () => {
            if (userId) {
                try {
                    const userData = await getUserById(userId);
                    setSelectedUser({
                        ...userData,
                        is_blocked: !userData.is_active // Si no está activo, está bloqueado
                    });
                } catch (error) {
                    console.error('Error al obtener datos del usuario seleccionado:', error);
                }
            }
        };

        fetchSelectedUser();
    }, [userId]);

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                const filteredCourts = await getCourts(sport);
                setCourts(filteredCourts);
            } catch (error) {
                console.error("Error al obtener canchas:", error);
                toast.error("Error al obtener canchas. Por favor verifica tus credenciales.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [sport, toast]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const filteredReservations = await getReservationsBySportAndDay(sport, selectedDate.toISOString().split('T')[0]);
                setBookings(filteredReservations);
            } catch (error) {
                console.error("Error al obtener reservas:", error);
                toast.error("Error al obtener reservas. Por favor verifica tus credenciales.");
            } finally {
                setLoading(false);
            }
        }
        fetchReservations();
    }, [sport, selectedDate, toast]);

    const isSlotOccupied = (courtId, time) => {
        return bookings.some(booking => {
            if (booking.court.id !== courtId) return false;

            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);

            const hour = Math.floor(time);
            const minute = Math.round((time - hour) * 60);

            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, minute, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + BOOKING_CONFIG.slotDuration);

            return (
                (slotStart >= bookingStart && slotStart < bookingEnd) ||
                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                (slotStart <= bookingStart && slotEnd >= bookingEnd)
            );
        });
    };

    // <CHANGE> Modificado para aceptar tiempo de inicio y fin desde la selección
    const handleSlotClick = (courtId, startTime, endTime) => {
        // Convertir tiempo decimal a horas y minutos
        const startHour = Math.floor(startTime);
        const startMinute = Math.round((startTime - startHour) * 60);
        const endHour = Math.floor(endTime);
        const endMinute = Math.round((endTime - endHour) * 60);

        // Crear fecha de inicio
        const slotStart = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            startHour, startMinute, 0, 0
        ));

        // Validar que la hora de inicio no sea pasada
        const now = new Date();
        const localSlotStart = new Date(selectedDate);
        localSlotStart.setHours(startHour, startMinute, 0, 0);

        if (localSlotStart < now) {
            toast.error('No se pueden realizar reservas en horarios pasados');
            return;
        }

        // Crear fecha de fin
        const slotEnd = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            endHour, endMinute, 0, 0
        ));

        // Encontrar la cancha seleccionada para obtener el monto
        const selectedCourt = courts.find(court => court.id === courtId);

        setSelectedBooking({
            courtId,
            courtName: selectedCourt?.name || `Cancha ${courtId}`,
            date: selectedDate.toISOString(),
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            court: selectedCourt  // Agregar el objeto court completo
        });

        // Resetear el preferenceId al abrir un nuevo modal
        setPreferenceId(null);
        setShowModal(true);
    };

    // <CHANGE> Handler para pagar en el club (crea la reserva)
    const handlePayInClub = async (extras, bookingWithTimes) => {
        if (!bookingWithTimes) return;

        try {
            // Construir las fechas completas usando la fecha seleccionada y las horas del formulario
            const selectedDateStr = selectedDate.toISOString().split('T')[0];
            const startTimeISO = `${selectedDateStr}T${bookingWithTimes.startTime}:00`;
            const endTimeISO = `${selectedDateStr}T${bookingWithTimes.endTime}:00`;

            // Si hay userId en los params, es admin haciendo reserva para un usuario
            const data = userId
                ? await postReservationForUser(userId, {
                    court_id: bookingWithTimes.courtId,
                    start_time: startTimeISO,
                    end_time: endTimeISO,
                    light: extras.light,
                    equipment_items: extras.equipment_items || []
                })
                : await postReservation({
                    court_id: bookingWithTimes.courtId,
                    start_time: startTimeISO,
                    end_time: endTimeISO,
                    light: extras.light,
                    equipment_items: extras.equipment_items || []
                });

            // El backend NO devuelve payment en la respuesta de creación
            // Así que siempre necesitamos crear el pago
            await postPayment({
                method: 'efectivo',
                status: 'pendiente',
                amount: extras.totalAmount, // Usar el monto calculado en el frontend
                reservation_id: data.id
            });

            toast.success('Reserva creada exitosamente. Podrás pagar en el club.');

            // Recargar reservas
            setLoading(true);
            const updatedReservations = await getReservationsBySportAndDay(
                sport,
                selectedDate.toISOString().split('T')[0]
            );
            setBookings(updatedReservations);

            setShowModal(false);
            setSelectedBooking(null);
        } catch (error) {
            console.error('Error al crear reserva:', error);
            toast.error('No se pudo realizar la reserva.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayWithMercadoPago = async (extras, bookingWithTimes) => {
        if (!bookingWithTimes) return;

        try {
            setIsLoadingPreference(true);

            // Construir las fechas completas usando la fecha seleccionada y las horas del formulario
            const selectedDateStr = selectedDate.toISOString().split('T')[0];
            const startTimeISO = `${selectedDateStr}T${bookingWithTimes.startTime}:00`;
            const endTimeISO = `${selectedDateStr}T${bookingWithTimes.endTime}:00`;

            // Primero crear la reserva
            const data = userId
                ? await postReservationForUser(userId, {
                    court_id: bookingWithTimes.courtId,
                    start_time: startTimeISO,
                    end_time: endTimeISO,
                    light: extras.light,
                    equipment_items: extras.equipment_items || []
                })
                : await postReservation({
                    court_id: bookingWithTimes.courtId,
                    start_time: startTimeISO,
                    end_time: endTimeISO,
                    light: extras.light,
                    equipment_items: extras.equipment_items || []
                });

            // El backend NO devuelve payment en la respuesta
            // Crear el pago con el monto calculado en el frontend
            await postPayment({
                method: 'mercadopago',
                status: 'pendiente',
                amount: extras.totalAmount, // Usar el monto calculado en el frontend
                reservation_id: data.id
            });

            // Crear la preferencia de Mercado Pago
            const preference = await createMercadoPagoPreference(data.id);

            // Establecer el preferenceId para mostrar el botón de MP
            setPreferenceId(preference.id);

        } catch (error) {
            console.error('Error al crear preferencia de Mercado Pago:', error);
            toast.error('No se pudo crear la preferencia de pago.');
            setShowModal(false);
            setSelectedBooking(null);
            setPreferenceId(null);
        } finally {
            setIsLoadingPreference(false);
        }
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);

        const formattedDate = newDate.toISOString().split('T')[0];
        setSearchParams({ date: formattedDate });
    };

    const formatDate = (date) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = days[date.getDay()];
        const dayNumber = date.getDate();
        return `${dayName} ${dayNumber}`;
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-[1400px] bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/20">
                <div className="w-full">
                    <BookingGridHeader
                        sport={sport}
                        selectedDate={selectedDate}
                        formatDate={formatDate}
                        onPrevDate={() => changeDate(-1)}
                        onNextDate={() => changeDate(1)}
                    />

                    {loading ? (
                        <div className="text-center py-12 text-gray-500 font-medium">Cargando...</div>
                    ) : (
                        <BookingTable
                            courts={courts}
                            timeSlots={timeSlots}
                            isSlotOccupied={isSlotOccupied}
                            onSlotClick={handleSlotClick}
                            bookings={bookings}
                            selectedDate={selectedDate}
                        />
                    )}
                </div>
            </div>

            {/* <CHANGE> Modal de confirmación de reserva */}
            <BookingConfirmationModal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    setPreferenceId(null);
                    setIsLoadingPreference(false);
                }}
                bookingData={selectedBooking}
                onPayInClub={handlePayInClub}
                onPayWithMercadoPago={handlePayWithMercadoPago}
                preferenceId={preferenceId}
                isLoadingPreference={isLoadingPreference}
                isUserBlocked={(selectedUser || currentUser)?.is_blocked || false}
            />
        </div>
    );
};

export default BookingGrid;