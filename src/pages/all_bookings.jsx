import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import ReservationCard from '../components/bookings/ReservationCard';
import PaymentDetailsModal from '../components/bookings/PaymentDetailsModal';
import { getAllReservations, patchPayment, getPaidReservationsByRange, getAllReservationsFiltered } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';



const AllBookings = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    // Filtros
    const [filterType, setFilterType] = useState('');
    const [filterValue, setFilterValue] = useState('');

    // Estados para el rango de fechas
    const [showRangeFilter, setShowRangeFilter] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rangeReservations, setRangeReservations] = useState([]);
    const [totalIncome, setTotalIncome] = useState(null);

    // Estilo compartido para botón y barra de filtros
    const filterPanelStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        marginBottom: '24px',
    };

    const actionButtonStyle = {
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '6px 14px',
        fontWeight: '500',
        color: '#000',
    };

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const data = await getAllReservations();
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

    const handlePayClick = (reservationId) => {
        const reservation = reservations.find((r) => r.id === reservationId);
        if (reservation) {
            setSelectedReservation(reservation);
            setShowPaymentModal(true);
        }
    };

    const handleApprovePayment = async (reservationId) => {
        const reservation = reservations.find((r) => r.id === reservationId);
        try {
            await patchPayment(reservation.payment.id, { status: 'pagado' });
            const data = await getAllReservations();
            const sortedData = data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
            setReservations(sortedData);
            setShowPaymentModal(false);
            setSelectedReservation(null);
        } catch (err) {
            console.error('Error al actualizar pago:', err);
            setError('No se pudo actualizar el pago.');
        } finally {
            setLoading(false);
        }
    };

    // Filtro dinámico
    const filteredReservations = reservations.filter((r) => {
        if (!filterType || filterValue === '' || filterValue === 'todos') return true;
        switch (filterType) {
            case 'deporte':
                return r.court.sport.toLowerCase() === filterValue.toLowerCase();
            case 'estado':
                if (!r.payment) return false;
                return r.payment.status.toLowerCase() === filterValue.toLowerCase();
            case 'fecha':
                const reservationDate = new Date(r.start_time).toISOString().split('T')[0];
                return reservationDate === filterValue;
            default:
                return true;
        }
    });

    // Obtener reservas pagadas en un rango
    const handleGetRangeIncome = async () => {

        setRangeReservations([]);
        setTotalIncome(null);
        setError(null);

        if (!startDate || !endDate) return;

        // Validar orden de fechas
        if (new Date(startDate) > new Date(endDate)) {
            setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
            return;
        }

        // Convertir a ISO completo
        const isoStart = new Date(startDate).toISOString(); // 00:00:00 del startDate
        const isoEnd = new Date(new Date(endDate).getTime() + 24*60*60*1000 - 1).toISOString(); // 23:59:59 del endDate
        try {
            const data = await getPaidReservationsByRange(isoStart, isoEnd);
            setRangeReservations(data.reservations);
            setTotalIncome(data.total_income);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al obtener ingresos');
        }
    };

    return (
        <div
            style={{
                height: 'calc(100vh - 80px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '40px 20px 60px 20px',
            }}
        >
            <Container style={{ maxWidth: '900px' }} className="reservations-container">

            {/* ENCABEZADO */}
                <div
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                        marginBottom: '24px',
                    }}
                >
                    <h2 style={{ fontWeight: '600', color: '#000' }}>Reservas</h2>
                    <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.95rem' }}>
                        Aquí puedes ver las reservas de tus clientes y gestionar los pagos
                    </p>
                </div>

                {/* BOTÓN DE INGRESOS (IZQUIERDA, SIN BLUR Y ESTILO LIMPIO) */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginBottom: '20px',
                        position: 'relative',
                        zIndex: 10, // fuerza que quede por encima del blur
                    }}
                >
                    <Button
                        onClick={() => setShowRangeFilter(!showRangeFilter)}
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #d1d1d1',
                            borderRadius: '8px',
                            fontWeight: '500',
                            color: '#000',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                            padding: '8px 18px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                        }}
                    >
                        Ingresos por rango
                    </Button>
                </div>

                {/* BARRA DE FILTROS */}
                <div style={filterPanelStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <label style={{ fontWeight: '500', color: '#000', marginRight: '10px' }}>
                                Filtrar por:
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setFilterValue('');
                                }}
                                style={{
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                }}
                            >
                                <option value="">Selecciona filtro</option>
                                <option value="deporte">Deporte</option>
                                <option value="estado">Estado de pago</option>
                                <option value="fecha">Fecha</option>
                            </select>
                        </div>

                        {/* espacio reservado si necesitas otro control a la derecha */}
                        <div style={{ width: '120px' }} />
                    </div>

                    {/* Campos del filtro dinámico */}
                    {filterType === 'deporte' && (
                        <div style={{ marginTop: '12px' }}>
                            <label style={{ marginRight: '10px', color: '#000' }}>Deporte:</label>
                            <select
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                }}
                            >
                                <option value="todos">Todos</option>
                                <option value="futbol">Futbol</option>
                                <option value="basquet">Basquet</option>
                                <option value="paddle">Paddle</option>
                            </select>
                        </div>
                    )}

                    {filterType === 'estado' && (
                        <div style={{ marginTop: '12px' }}>
                            <label style={{ marginRight: '10px', color: '#000' }}>Estado:</label>
                            <select
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                }}
                            >
                                <option value="todos">Todos</option>
                                <option value="pagado">Pagado</option>
                                <option value="pendiente">Pendiente</option>
                            </select>
                        </div>
                    )}

                    {filterType === 'fecha' && (
                        <div style={{ marginTop: '12px' }}>
                            <label style={{ marginRight: '10px', color: '#000' }}>Fecha:</label>
                            <input
                                type="date"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* SECCIÓN DE INGRESOS POR RANGO */}
                {showRangeFilter && (
                    <div
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            padding: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        <h5 style={{ color: '#000', fontWeight: '600' }}>Ingresos por rango de fechas</h5>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                }}
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                }}
                            />
                            <Button
                                onClick={handleGetRangeIncome}
                                style={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    color: '#000',
                                }}
                            >
                                Consultar
                            </Button>
                        </div>

                        {totalIncome !== null && (
                            <p style={{ color: '#000', marginTop: '16px', fontWeight: '500' }}>
                                INGRESOS TOTALES: ${totalIncome.toFixed(2)}
                            </p>
                        )}

                        {rangeReservations.length > 0 &&
                            rangeReservations.map((r) => (
                                <ReservationCard
                                    key={r.id}
                                    reservation={r}
                                    onPayClick={handlePayClick}
                                    payButtonText={'Ver pago'}
                                />
                            ))}
                    </div>
                )}

                {/* LISTADO DE RESERVAS */}
                {!showRangeFilter && !loading && !error && (
                    <>
                        {filteredReservations.length === 0 ? (
                            <div
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '16px',
                                    padding: '48px 24px',
                                    textAlign: 'center',
                                }}
                            >
                                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                                    No hay reservas para este filtro
                                </p>
                            </div>
                        ) : (
                            filteredReservations.map((reservation) => (
                                <ReservationCard
                                    key={reservation.id}
                                    reservation={reservation}
                                    onPayClick={handlePayClick}
                                    payButtonText={'Ver pago'}
                                />
                            ))
                        )}
                    </>
                )}

                {/* LOADING / ERROR */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3" style={{ color: '#000' }}>
                            Cargando...
                        </p>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                        {error}
                    </Alert>
                )}
            </Container>

            {/* MODAL DE PAGO */}
            <PaymentDetailsModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                reservation={selectedReservation}
                onApprovePayment={handleApprovePayment}
            />
        </div>
    );
};

export default AllBookings;