import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { Container, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BookingGridHeader from '../components/booking_grid/BookingGridHeader.jsx';
import BookingTable from '../components/booking_grid/BookingTable.jsx';

// Configuración de horarios - Modifica estos valores según necesites
const BOOKING_CONFIG = {
    startHour: 9,  // 9 AM
    endHour: 22,   // 10 PM (22:00)
    slotDuration: 60 // minutos
};

// MOCK: Canchas
const MOCK_COURTS = [
    { id: 1, name: 'Cancha 1', sport: 'futbol', created_at: '2025-01-01T00:00:00Z' },
    { id: 2, name: 'Cancha 2', sport: 'futbol', created_at: '2025-01-01T00:00:00Z' },
    { id: 3, name: 'Cancha 3', sport: 'futbol', created_at: '2025-01-01T00:00:00Z' },
    { id: 4, name: 'Cancha 1', sport: 'paddle', created_at: '2025-01-01T00:00:00Z' },
    { id: 5, name: 'Cancha 2', sport: 'paddle', created_at: '2025-01-01T00:00:00Z' },
    { id: 6, name: 'Cancha 1', sport: 'basquet', created_at: '2025-01-01T00:00:00Z' },
];

// MOCK: Reservas ocupadas
const MOCK_BOOKINGS = [
    {
        id: 1,
        court_id: 1,
        start_time: '2025-10-27T10:00:00Z',
        end_time: '2025-10-27T11:00:00Z',
        status: 'confirmed',
        created_at: '2025-10-27T08:00:00Z'
    },
    {
        id: 2,
        court_id: 1,
        start_time: '2025-10-27T13:00:00Z',
        end_time: '2025-10-27T14:00:00Z',
        status: 'confirmed',
        created_at: '2025-10-27T08:00:00Z'
    },
    {
        id: 3,
        court_id: 2,
        start_time: '2025-10-27T10:00:00Z',
        end_time: '2025-10-27T11:00:00Z',
        status: 'confirmed',
        created_at: '2025-10-27T08:00:00Z'
    },
    {
        id: 4,
        court_id: 3,
        start_time: '2025-10-27T11:00:00Z',
        end_time: '2025-10-27T12:00:00Z',
        status: 'confirmed',
        created_at: '2025-10-27T08:00:00Z'
    },
    {
        id: 5,
        court_id: 3,
        start_time: '2025-10-27T12:00:00Z',
        end_time: '2025-10-27T13:00:00Z',
        status: 'confirmed',
        created_at: '2025-10-27T08:00:00Z'
    }
];

const BookingGrid = () => {
    const { sport } = useParams()
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Generar slots de tiempo
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

    // Cargar canchas mock
    useEffect(() => {
        const filteredCourts = MOCK_COURTS.filter(court => court.sport === sport);
        setCourts(filteredCourts);
    }, [sport]);

    // Cargar reservas mock
    useEffect(() => {
        setBookings(MOCK_BOOKINGS);
    }, [selectedDate]);

    // Verificar si un slot está ocupado
    const isSlotOccupied = (courtId, hour) => {
        return bookings.some(booking => {
            if (booking.court_id !== courtId) return false;

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

    // Manejar click en un slot
    const handleSlotClick = (courtId, hour) => {
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, 0, 0, 0);

        console.log('Reservar:', {
            sport: sport,
            court_id: courtId,
            start_time: slotStart.toISOString(),
            date: selectedDate.toLocaleDateString('es-ES')
        });

        alert(`Reservando Cancha ${courtId} a las ${hour}:00`);
    };

    // Navegación de fechas
    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
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
                padding: "20px 20px 60px 20px", // <CHANGE> Reducido margen superior (20px) y aumentado margen inferior (60px)
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
        </div>
    );
};

export default BookingGrid;