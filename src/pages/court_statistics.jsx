import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { IoCalendarOutline, IoStatsChartOutline, IoTrophyOutline } from 'react-icons/io5';
import { getAllReservationsFiltered } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const CourtStatistics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statistics, setStatistics] = useState([]);
    const [totalReservations, setTotalReservations] = useState(0);

    // Inicializar con el mes actual
    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }, []);

    const fetchStatistics = async () => {
        if (!startDate || !endDate) return;

        try {
            setLoading(true);
            setError(null);

            // Convertir las fechas a formato ISO como en all_bookings.jsx
            const isoStart = new Date(startDate).toISOString();
            const isoEnd = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();

            const filters = {
                start_date: isoStart,
                end_date: isoEnd,
            };

            const reservations = await getAllReservationsFiltered(filters);

            // Procesar las reservas para obtener estadísticas por cancha
            const courtMap = {};

            reservations.forEach(reservation => {
                const courtId = reservation.court.id;
                const courtName = reservation.court.name;
                const courtSport = reservation.court.sport;

                if (!courtMap[courtId]) {
                    courtMap[courtId] = {
                        id: courtId,
                        name: courtName,
                        sport: courtSport,
                        totalReservations: 0,
                        paidReservations: 0,
                        pendingReservations: 0,
                        totalRevenue: 0,
                    };
                }

                courtMap[courtId].totalReservations++;

                if (reservation.payment?.status === "pagado" || reservation.payment?.status === "paid") {
                    courtMap[courtId].paidReservations++;
                    // Usar el monto del pago, no el de la cancha (incluye extras)
                    courtMap[courtId].totalRevenue += parseFloat(reservation.payment.amount);
                } else {
                    courtMap[courtId].pendingReservations++;
                }
            });

            // Convertir a array y ordenar por número de reservas (descendente)
            const statsArray = Object.values(courtMap).sort((a, b) =>
                b.totalReservations - a.totalReservations
            );

            setStatistics(statsArray);
            setTotalReservations(reservations.length);
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
            setError('No se pudieron cargar las estadísticas. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchStatistics();
        }
    }, [startDate, endDate]);

    const getSportBadgeColor = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') return 'success';
        if (sportLower === 'paddle') return 'warning';
        if (sportLower === 'basquet' || sportLower === 'básquet') return 'danger';
        return 'secondary';
    };

    const getOccupancyPercentage = (reservations) => {
        if (totalReservations === 0) return 0;
        return ((reservations / totalReservations) * 100).toFixed(1);
    };

    return (
        <div style={{
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "40px 20px 60px 20px"
        }}>
            <style>
                {`
                    .statistics-container::-webkit-scrollbar {
                        width: 10px;
                    }
                    .statistics-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .statistics-container::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .statistics-container::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                `}
            </style>
            <Container style={{ maxWidth: "1100px" }} className="statistics-container">
                {/* Título y Filtros */}
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
                    <Row className="align-items-center mb-3">
                        <Col xs={12}>
                            <h2 className="mb-0" style={{ fontWeight: '600', color: '#000' }}>
                                <IoStatsChartOutline size={32} style={{ marginRight: '12px', marginBottom: '4px' }} />
                                Estadísticas de Canchas
                            </h2>
                            <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.95rem' }}>
                                Ranking y ocupación de canchas por período
                            </p>
                        </Col>
                    </Row>

                    <Row className="align-items-end">
                        <Col xs={12} md={5}>
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                    <IoCalendarOutline style={{ marginRight: '6px' }} />
                                    Fecha de Inicio
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #000',
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={5} className="mt-3 mt-md-0">
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                    <IoCalendarOutline style={{ marginRight: '6px' }} />
                                    Fecha de Fin
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #000',
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={2} className="mt-3 mt-md-0">
                            <div style={{
                                textAlign: 'center',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                            }}>
                                <small style={{ fontWeight: '500', color: '#6c757d' }}>Total</small>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#000' }}>
                                    {totalReservations}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3" style={{ color: '#000' }}>Cargando estadísticas...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <Alert variant="danger" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
                        {error}
                    </Alert>
                )}

                {/* Estadísticas */}
                {!loading && !error && (
                    <>
                        {statistics.length === 0 ? (
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
                                    No hay reservas en el período seleccionado
                                </p>
                            </div>
                        ) : (
                            <div>
                                {/* Tabla de Ranking */}
                                <Card
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                                        backdropFilter: "blur(10px)",
                                        borderRadius: "16px",
                                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                        border: "none",
                                        marginBottom: "24px",
                                    }}
                                >
                                    <Card.Body className="p-4">
                                        <h4 className="mb-4" style={{ fontWeight: '600', color: '#000' }}>
                                            <IoTrophyOutline size={24} style={{ marginRight: '10px', marginBottom: '2px' }} />
                                            Ranking de Canchas Más Solicitadas
                                        </h4>

                                        <div style={{ overflowX: 'auto' }}>
                                            <Table hover responsive style={{ marginBottom: 0 }}>
                                                <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                    <tr>
                                                        <th style={{ fontWeight: '600', padding: '12px' }}>#</th>
                                                        <th style={{ fontWeight: '600', padding: '12px' }}>Cancha</th>
                                                        <th style={{ fontWeight: '600', padding: '12px' }}>Deporte</th>
                                                        <th style={{ fontWeight: '600', padding: '12px', textAlign: 'center' }}>Total Reservas</th>
                                                        <th style={{ fontWeight: '600', padding: '12px', textAlign: 'center' }}>Ocupación</th>
                                                        <th style={{ fontWeight: '600', padding: '12px', textAlign: 'center' }}>Pagadas</th>
                                                        <th style={{ fontWeight: '600', padding: '12px', textAlign: 'center' }}>Pendientes</th>
                                                        <th style={{ fontWeight: '600', padding: '12px', textAlign: 'right' }}>Ingresos</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {statistics.map((stat, index) => (
                                                        <tr key={stat.id}>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                                <div style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e9ecef',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: '700',
                                                                    color: index < 3 ? '#fff' : '#000',
                                                                }}>
                                                                    {index + 1}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', fontWeight: '500' }}>
                                                                {stat.name}
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                                <Badge bg={getSportBadgeColor(stat.sport)}>
                                                                    {stat.sport}
                                                                </Badge>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center', fontWeight: '600', fontSize: '1.1rem' }}>
                                                                {stat.totalReservations}
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                                <div style={{ position: 'relative' }}>
                                                                    <div style={{
                                                                        width: '100%',
                                                                        height: '24px',
                                                                        backgroundColor: '#e9ecef',
                                                                        borderRadius: '12px',
                                                                        overflow: 'hidden',
                                                                    }}>
                                                                        <div style={{
                                                                            width: `${getOccupancyPercentage(stat.totalReservations)}%`,
                                                                            height: '100%',
                                                                            backgroundColor: '#28a745',
                                                                            borderRadius: '12px',
                                                                            transition: 'width 0.3s ease',
                                                                        }}></div>
                                                                    </div>
                                                                    <span style={{
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        left: '50%',
                                                                        transform: 'translate(-50%, -50%)',
                                                                        fontWeight: '600',
                                                                        fontSize: '0.75rem',
                                                                        color: '#000',
                                                                    }}>
                                                                        {getOccupancyPercentage(stat.totalReservations)}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                                <Badge bg="success" style={{ fontSize: '0.9rem' }}>
                                                                    {stat.paidReservations}
                                                                </Badge>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                                <Badge bg="warning" style={{ fontSize: '0.9rem' }}>
                                                                    {stat.pendingReservations}
                                                                </Badge>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>
                                                                ${formatCurrency(stat.totalRevenue)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Resumen General */}
                                <Row className="g-3">
                                    <Col xs={12} md={4}>
                                        <Card style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                                            border: "none",
                                        }}>
                                            <Card.Body className="text-center p-4">
                                                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#000' }}>
                                                    {statistics.length}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: '500' }}>
                                                    Canchas Activas
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <Card style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                                            border: "none",
                                        }}>
                                            <Card.Body className="text-center p-4">
                                                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#28a745' }}>
                                                    {statistics.reduce((sum, stat) => sum + stat.paidReservations, 0)}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: '500' }}>
                                                    Reservas Pagadas
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <Card style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                                            border: "none",
                                        }}>
                                            <Card.Body className="text-center p-4">
                                                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#28a745' }}>
                                                    ${formatCurrency(statistics.reduce((sum, stat) => sum + stat.totalRevenue, 0))}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: '500' }}>
                                                    Ingresos Totales
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default CourtStatistics;
