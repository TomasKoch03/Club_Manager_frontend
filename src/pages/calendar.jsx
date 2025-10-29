import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const Calendar = () => {
    const { sport } = useParams();
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Obtener primer y último día del mes
    const getMonthInfo = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

        return { year, month, daysInMonth, startingDayOfWeek };
    };

    const { year, month, daysInMonth, startingDayOfWeek } = getMonthInfo(selectedMonth);

    // Nombres de meses y días
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Generar array de días del mes
    const generateCalendarDays = () => {
        const days = [];

        // Días vacíos al inicio
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        // Días vacíos al final para completar la última semana
        const totalCells = days.length;
        const remainingCells = totalCells % 7;
        if (remainingCells !== 0) {
            const cellsToAdd = 7 - remainingCells;
            for (let i = 0; i < cellsToAdd; i++) {
                days.push(null);
            }
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    // Navegar entre meses
    const changeMonth = (offset) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedMonth(newDate);
    };

    // Seleccionar día y redirigir a booking_grid
    const handleDayClick = (day) => {
        if (!day) return;

        const selectedDate = new Date(year, month, day);
        const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Redirigir a la grilla de reservas con la fecha
        navigate(`/club-manager/reservar/${sport}?date=${dateString}`);
    };

    // Verificar si un día es hoy
    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    // Verificar si un día ya pasó
    const isPastDay = (day) => {
        if (!day) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(year, month, day);
        return checkDate < today;
    };

    // Capitalizar primera letra
    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundAttachment: "fixed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <Card
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    maxWidth: "800px",
                    width: "100%",
                    border: "none",
                }}
            >
                <Card.Body className="p-4">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h2 className="mb-2" style={{ fontWeight: '600', color: '#000' }}>
                            Reservar {capitalizeFirstLetter(sport)}
                        </h2>
                        <p className="text-muted">Seleccioná el día para ver las canchas disponibles</p>
                    </div>

                    {/* Navegación de meses */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <Button
                            variant="outline-dark"
                            onClick={() => changeMonth(-1)}
                            style={{ minWidth: '100px' }}
                        >
                            ← Anterior
                        </Button>

                        <h4 className="mb-0" style={{ fontWeight: '600', color: '#000' }}>
                            {monthNames[month]} {year}
                        </h4>

                        <Button
                            variant="outline-dark"
                            onClick={() => changeMonth(1)}
                            style={{ minWidth: '100px' }}
                        >
                            Siguiente →
                        </Button>
                    </div>

                    {/* Días de la semana */}
                    <Row className="mb-2">
                        {dayNames.map((day, index) => (
                            <Col key={index} className="text-center">
                                <div style={{
                                    fontWeight: '600',
                                    color: '#6c757d',
                                    fontSize: '0.9rem',
                                    marginBottom: '8px'
                                }}>
                                    {day}
                                </div>
                            </Col>
                        ))}
                    </Row>

                    {/* Grid del calendario */}
                    <div>
                        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
                            <Row key={weekIndex} className="mb-2">
                                {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                                    <Col key={dayIndex} className="p-1">
                                        {day ? (
                                            <Button
                                                variant={isToday(day) ? 'dark' : 'outline-dark'}
                                                className="w-100"
                                                style={{
                                                    height: '60px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: isToday(day) ? '600' : '400',
                                                    opacity: isPastDay(day) ? 0.4 : 1,
                                                    cursor: isPastDay(day) ? 'not-allowed' : 'pointer'
                                                }}
                                                onClick={() => handleDayClick(day)}
                                                disabled={isPastDay(day)}
                                            >
                                                {day}
                                                {isToday(day) && (
                                                    <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                                                        Hoy
                                                    </div>
                                                )}
                                            </Button>
                                        ) : (
                                            <div style={{ height: '60px' }} />
                                        )}
                                    </Col>
                                ))}
                            </Row>
                        ))}
                    </div>

                    {/* Leyenda */}
                    <div className="mt-4 text-center">
                        <small className="text-muted">
                            Los días en gris ya pasaron. Hacé click en un día disponible para ver las canchas.
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Calendar;
