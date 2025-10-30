import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const CalendarAdmin = () => {
    const { sport, userId } = useParams();
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // ... existing code ...

    const getMonthInfo = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { year, month, daysInMonth, startingDayOfWeek };
    };

    const { year, month, daysInMonth, startingDayOfWeek } = getMonthInfo(selectedMonth);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const generateCalendarDays = () => {
        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

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

    const changeMonth = (offset) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedMonth(newDate);
    };

    const handleDayClick = (day) => {
        if (!day) return;

        const selectedDate = new Date(year, month, day);
        const dateString = selectedDate.toISOString().split('T')[0];

        navigate(`/admin/reservar/${sport}/${userId}?date=${dateString}`);
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const isPastDay = (day) => {
        if (!day) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(year, month, day);
        return checkDate < today;
    };

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
                padding: "20px 20px 60px 20px", // <CHANGE> Agregado más padding inferior
            }}
        >
            <Card
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    maxWidth: "600px", // <CHANGE> Reducido de 800px a 600px
                    width: "100%",
                    border: "none",
                }}
            >
                <Card.Body className="p-3"> {/* <CHANGE> Reducido padding de p-4 a p-3 */}
                    {/* Header */}
                    <div className="text-center mb-3"> {/* <CHANGE> Reducido margen de mb-4 a mb-3 */}
                        <h3 className="mb-2" style={{ fontWeight: '600', color: '#000' }}> {/* <CHANGE> h2 a h3 */}
                            Reservar {capitalizeFirstLetter(sport)}
                        </h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}> {/* <CHANGE> Reducido tamaño de fuente */}
                            Seleccioná el día para ver las canchas disponibles
                        </p>
                    </div>

                    {/* Navegación de meses */}
                    <div className="d-flex justify-content-between align-items-center mb-3"> {/* <CHANGE> Reducido margen */}
                        <Button
                            variant="outline-dark"
                            onClick={() => changeMonth(-1)}
                            style={{ minWidth: '90px', fontSize: '0.9rem' }} // <CHANGE> Reducido tamaño
                        >
                            ← Anterior
                        </Button>

                        <h5 className="mb-0" style={{ fontWeight: '600', color: '#000' }}> {/* <CHANGE> h4 a h5 */}
                            {monthNames[month]} {year}
                        </h5>

                        <Button
                            variant="outline-dark"
                            onClick={() => changeMonth(1)}
                            style={{ minWidth: '90px', fontSize: '0.9rem' }} // <CHANGE> Reducido tamaño
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
                                    fontSize: '0.8rem', // <CHANGE> Reducido de 0.9rem a 0.8rem
                                    marginBottom: '6px' // <CHANGE> Reducido de 8px a 6px
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
                                                    height: '45px', // <CHANGE> Reducido de 60px a 45px
                                                    fontSize: '1rem', // <CHANGE> Reducido de 1.1rem a 1rem
                                                    fontWeight: isToday(day) ? '600' : '400',
                                                    opacity: isPastDay(day) ? 0.4 : 1,
                                                    cursor: isPastDay(day) ? 'not-allowed' : 'pointer'
                                                }}
                                                onClick={() => handleDayClick(day)}
                                                disabled={isPastDay(day)}
                                            >
                                                {day}
                                                {isToday(day) && (
                                                    <div style={{ fontSize: '0.65rem', marginTop: '2px' }}> {/* <CHANGE> Reducido tamaño */}
                                                        Hoy
                                                    </div>
                                                )}
                                            </Button>
                                        ) : (
                                            <div style={{ height: '45px' }} /> // <CHANGE> Reducido de 60px a 45px
                                        )}
                                    </Col>
                                ))}
                            </Row>
                        ))}
                    </div>

                    {/* Leyenda */}
                    <div className="mt-3 text-center"> {/* <CHANGE> Reducido margen de mt-4 a mt-3 */}
                        <small className="text-muted" style={{ fontSize: '0.85rem' }}> {/* <CHANGE> Reducido tamaño */}
                            Los días en gris ya pasaron. Hacé click en un día disponible para ver las canchas.
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CalendarAdmin;