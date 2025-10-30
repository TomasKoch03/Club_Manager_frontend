import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { Container, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BookingGridHeader from '../components/booking_grid/BookingGridHeader.jsx';
import BookingTable from '../components/booking_grid/BookingTable.jsx';
import BookingConfirmationModal from '../components/booking_grid/BookingConfirmationModal.jsx'; // <CHANGE> Importar el modal
import { useSearchParams } from "react-router-dom";
import {getCourts, getReservationsBySportAndDay, postReservation} from "../services/api.js";

const BOOKING_CONFIG = {
    startHour: 9,
    endHour: 22,
    slotDuration: 60
};

const BookingGrid = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const date = searchParams.get("date")
    const { sport } = useParams()
    const [selectedDate, setSelectedDate] = useState(new Date(`${date}T00:00:00`));
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);


    const getCourtsBySport = async (sport) => {
        try {
            return await getCourts(sport);
        } catch (error) {
            console.error("Error al obtener canchas:", error);
            alert("Error al obtener canchas. Por favor verifica tus credenciales.");
        }
    }

    const getReservationsBySportAndDate = async (sport, date) => {
        try {
            return await getReservationsBySportAndDay(sport, date);
        } catch (error) {
            console.error("Error al obtener reservas:", error);
            alert("Error al obtener reservas. Por favor verifica tus credenciales.");
        }
    }

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = BOOKING_CONFIG.startHour; hour < BOOKING_CONFIG.endHour; hour++) {
            slots.push({
                hour,
                label: hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
            });
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                const filteredCourts = await getCourtsBySport(sport);
                setCourts(filteredCourts);
            } catch (error) {
                console.error("Error al obtener canchas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [sport]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const filteredReservations = await getReservationsBySportAndDate(sport, selectedDate.toISOString().split('T')[0]);
                setBookings(filteredReservations);
            } catch (error) {
                console.error("Error al obtener reservas:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReservations();
    }, [sport, selectedDate]);

    const isSlotOccupied = (courtId, hour) => {
        return bookings.some(booking => {
            if (booking.court.id !== courtId) return false;

            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);
            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            return (
                (slotStart >= bookingStart && slotStart < bookingEnd) ||
                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                (slotStart <= bookingStart && slotEnd >= bookingEnd)
            );
        });
    };

    // <CHANGE> Modificado para abrir el modal en lugar de crear la reserva directamente
    const handleSlotClick = (courtId, hour) => {
        const slotStart = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            hour, 0, 0, 0
        ));

        const slotEnd = new Date(slotStart);
        slotEnd.setUTCHours(slotEnd.getUTCHours() + 1);

        // Encontrar la cancha seleccionada para obtener el monto
        const selectedCourt = courts.find(court => court.id === courtId);

        setSelectedBooking({
            courtId,
            courtName: selectedCourt?.name || `Cancha ${courtId}`,
            date: selectedDate.toISOString(),
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            amount: selectedCourt?.amount || 0
        });

        setShowModal(true);
    };

    // <CHANGE> Handler para pagar en el club (crea la reserva)
    const handlePayInClub = async () => {
        if (!selectedBooking) return;

        try {
            await postReservation({
                court_id: selectedBooking.courtId,
                start_time: selectedBooking.startTime,
                end_time: selectedBooking.endTime
            });

            alert('Reserva creada exitosamente. Podrás pagar en el club.');

            // Recargar reservas
            setLoading(true);
            const updatedReservations = await getReservationsBySportAndDate(
                sport,
                selectedDate.toISOString().split('T')[0]
            );
            setBookings(updatedReservations);

            setShowModal(false);
            setSelectedBooking(null);
        } catch (error) {
            console.error('Error al crear reserva:', error);
            alert('No se pudo realizar la reserva.');
        } finally {
            setLoading(false);
        }
    };

    // <CHANGE> Handler para pagar con Mercado Pago (placeholder para funcionalidad futura)
    const handlePayWithMercadoPago = () => {
        console.log('Pagar con Mercado Pago:', selectedBooking);
        // TODO: Implementar integración con Mercado Pago
        alert('Funcionalidad de Mercado Pago próximamente disponible');
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
        <div
            style={{
                minHeight: "100vh",
                backgroundAttachment: "fixed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 20px 60px 20px",
            }}
        >
            <Card
                style={{
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    maxWidth: "1400px",
                    width: "100%",
                    border: "none",
                }}
                className={`d-flex align-items-center justify-content-center text-center`}
            >
                <Container fluid className="py-4">
                    <BookingGridHeader
                        sport={sport}
                        selectedDate={selectedDate}
                        formatDate={formatDate}
                        onPrevDate={() => changeDate(-1)}
                        onNextDate={() => changeDate(1)}
                    />

                    {loading ? (
                        <div className="text-center py-5">Cargando...</div>
                    ) : (
                        <BookingTable
                            courts={courts}
                            timeSlots={timeSlots}
                            isSlotOccupied={isSlotOccupied}
                            onSlotClick={handleSlotClick}
                        />
                    )}
                </Container>
            </Card>

            {/* <CHANGE> Modal de confirmación de reserva */}
            <BookingConfirmationModal
                show={showModal}
                onHide={() => setShowModal(false)}
                bookingData={selectedBooking}
                onPayInClub={handlePayInClub}
                onPayWithMercadoPago={handlePayWithMercadoPago}
            />
        </div>
    );
};

export default BookingGrid;