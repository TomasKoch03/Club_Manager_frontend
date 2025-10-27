import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        <Container fluid className="py-4">
            {/* <CHANGE> Título del deporte y navegación de fechas en la misma fila */}
            <Row className="mb-4 align-items-center">
                <Col xs={12} md={4}>
                    <h2 className="text-capitalize mb-0">{sport}</h2>
                </Col>
                <Col xs={12} md={4} className="text-center">
                    <ButtonGroup>
                        <Button variant="outline-dark" onClick={() => changeDate(-1)}>
                            ←
                        </Button>
                        <Button variant="outline-dark" disabled>
                            {formatDate(selectedDate)}
                        </Button>
                        <Button variant="outline-dark" onClick={() => changeDate(1)}>
                            →
                        </Button>
                    </ButtonGroup>
                </Col>
                <Col xs={12} md={4}>
                    {/* Columna vacía para balance */}
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">Cargando...</div>
            ) : (
                <div style={{
                    overflowX: 'auto',
                    overflowY: 'auto',
                    // Calcula la altura: 100vh - navbar (60px) - padding del container (32px) - título (60px) - navegación de fechas (60px) - margen extra (20px)
                    maxHeight: 'calc(100vh - 232px)',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                }}>
                    <table className="table table-bordered mb-0" style={{ minWidth: '800px' }}>
                        <thead style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            backgroundColor: '#f8f9fa'
                        }}>
                        <tr>
                            <th style={{
                                width: '100px',
                                backgroundColor: '#f8f9fa',
                                position: 'sticky',
                                left: 0,
                                zIndex: 11
                            }}></th>
                            {courts.map(court => (
                                <th key={court.id} className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
                                    {court.name}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {timeSlots.map(slot => (
                            <tr key={slot.hour}>
                                <td
                                    className="text-center align-middle"
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: '500',
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 5
                                    }}
                                >
                                    {slot.label}
                                </td>
                                {courts.map(court => {
                                    const occupied = isSlotOccupied(court.id, slot.hour);
                                    return (
                                        <td key={court.id} className="p-2">
                                            <Button
                                                variant={occupied ? 'secondary' : 'outline-dark'}
                                                disabled={occupied}
                                                onClick={() => handleSlotClick(court.id, slot.hour)}
                                                className="w-100"
                                                style={{
                                                    minHeight: '50px',
                                                    // ❌ Solo aplicamos colores cuando está ocupado
                                                    ...(occupied && {
                                                        backgroundColor: '#e9ecef',
                                                        color: '#6c757d',
                                                        borderColor: '#e9ecef',
                                                        cursor: 'not-allowed'
                                                    }),
                                                    // ✅ En caso contrario, dejamos que Bootstrap maneje los estilos del hover
                                                    ...(!occupied && {
                                                        cursor: 'pointer'
                                                    })
                                                }}
                                            >
                                                {occupied ? 'Ocupado' : 'Disponible'}
                                            </Button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Container>
    );
};

export default BookingGrid;