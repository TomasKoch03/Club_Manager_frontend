import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import ReservationCard from '../components/bookings/ReservationCard';
import PaymentDetailsModal from '../components/bookings/PaymentDetailsModal';
import EditReservationModal from '../components/bookings/EditReservationModal';
import { getAllReservations, patchPayment, getReservationById, updateReservation, getCourts, getAllUsers, getUserData, getPaidReservationsByRange, getAllReservationsFiltered } from '../services/api';
import { useToast } from '../hooks/useToast';
import 'bootstrap/dist/css/bootstrap.min.css';


const AllBookings = () => {

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const toast = useToast();

    // Estados para el modal de pago
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    // Estados para el modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [courts, setCourts] = useState([]);
    const [users, setUsers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

     // Estados de filtro
    const [filterType, setFilterType] = useState('');
    const [filterValue, setFilterValue] = useState('');

    // Estados del rango de fechas
    const [showRangeFilter, setShowRangeFilter] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rangeReservations, setRangeReservations] = useState([]);
    const [totalIncome, setTotalIncome] = useState(null);

    // Estilos comunes
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

    // Cargar datos del usuario actual
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userData = await getUserData();
                setCurrentUser(userData);
            } catch (err) {
                console.error('Error al obtener datos del usuario:', err);
                toast.error('Error al verificar permisos de usuario');
            }
        };
        fetchCurrentUser();
    }, [toast]);

    // Cargar reservas
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
                toast.error('Error al cargar las reservas');
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, [toast]);

    // Cargar canchas y usuarios cuando se necesita editar (solo para admins)
    useEffect(() => {
        const fetchCourtsAndUsers = async () => {
            if (currentUser?.is_admin && showEditModal) {
                try {
                    const [courtsData, usersData] = await Promise.all([
                        getCourts(''),
                        getAllUsers()
                    ]);
                    setCourts(courtsData);
                    setUsers(usersData);
                } catch (err) {
                    console.error('Error al cargar canchas/usuarios:', err);
                    toast.error('Error al cargar datos para edición');
                }
            }
        };
        fetchCourtsAndUsers();
    }, [currentUser, showEditModal, toast]);

    // Handler para abrir modal de pago
    const handlePayClick = (reservationId) => {
        const reservation = reservations.find((r) => r.id === reservationId);
        if (reservation) {
            setSelectedReservation(reservation);
            setShowPaymentModal(true);
        }
    };

    // Handler para aprobar el pago
    const handleApprovePayment = async (reservationId) => {
        const reservation = reservations.find((r) => r.id === reservationId);
        try {
            await patchPayment(reservation.payment.id, { status: 'pagado' });
            toast.success('Pago aprobado exitosamente');

            setLoading(true);
            const data = await getAllReservations();
            const sortedData = data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
            setReservations(sortedData);
            setShowPaymentModal(false);
            setSelectedReservation(null);
        } catch (err) {
            console.error('Error al aprobar pago:', err);
            toast.error('Error al aprobar el pago');
        } finally {
            setLoading(false);
        }
    };

    // Handler para abrir modal de edición (solo admins)
    const handleEditClick = async (reservationId) => {
        if (!currentUser?.is_admin) {
            toast.error('No tienes permisos para modificar reservas');
            return;
        }

        try {
            setLoading(true);
            const reservationDetails = await getReservationById(reservationId);
            setEditingReservation(reservationDetails);
            setShowEditModal(true);
        } catch (err) {
            console.error('Error al cargar detalles de la reserva:', err);
            toast.error('Error al cargar los detalles de la reserva');
        } finally {
            setLoading(false);
        }
    };

    // Handler para guardar cambios de edición
    const handleSaveEdit = async (reservationId, payload) => {
        setIsSaving(true);
        try {
            await updateReservation(reservationId, payload);
            
            // ✅ ÉXITO: Reserva actualizada correctamente
            toast.success('Reserva actualizada exitosamente');

            // Recargar reservas SOLO si fue exitoso
            const data = await getAllReservations();
            const sortedData = data.sort((a, b) =>
                new Date(b.start_time) - new Date(a.start_time)
            );
            setReservations(sortedData);

            // Cerrar modal SOLO si fue exitoso
            setShowEditModal(false);
            setEditingReservation(null);
        } catch (err) {
            console.error('Error al actualizar reserva:', err);
            
            // ❌ ERROR: Manejo de errores específicos usando el código de estado
            const status = err.status || 0;
            
            if (status === 401) {
                toast.error('No tienes permisos para modificar reservas');
            } else if (status === 403) {
                toast.error('No se puede modificar esta reserva porque tiene un pago asociado o el usuario está inactivo');
            } else if (status === 404) {
                toast.error('La reserva, cancha o usuario no fue encontrado');
            } else if (status === 409) {
                // 🚨 CRÍTICO: Conflicto de horario - NO hacer nada más
                toast.error('El horario seleccionado se solapa con otra reserva existente. Por favor, elige otro horario.');
                // ❌ NO cerrar modal
                // ❌ NO recargar reservas
                // ❌ NO modificar ninguna reserva
                // ✅ El usuario puede corregir el horario y volver a intentar
            } else {
                toast.error('Error al actualizar la reserva. Por favor, intenta nuevamente.');
            }
            
            // IMPORTANTE: NO cerrar el modal ni recargar reservas cuando hay error
            // El modal permanece abierto para que el usuario corrija los datos
        } finally {
            setIsSaving(false);
        }
    };

    // Filtro 
    const handleApplyFilters = async () => {
        const filters = {};

        if (filterType === 'deporte' && filterValue !== 'todos') {
            filters.sport = filterValue;
        } else if (filterType === 'estado' && filterValue !== 'todos') {
            filters.status = filterValue;
        } else if (filterType === 'fecha' && filterValue) {
            const isoDate = new Date(filterValue).toISOString();
            filters.start_date = isoDate;
            filters.end_date = isoDate;
        }

        try {
            const data = await getAllReservationsFiltered(filters);
            const sortedData = data.sort((a, b) =>
                new Date(b.start_time) - new Date(a.start_time)
            );
            setReservations(sortedData);
            setError(null);
        } catch (err) {
            console.error('Error al aplicar filtros:', err);
            setError('No se pudieron obtener las reservas filtradas.');
        }
    };


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

                {/* BOTÓN DE INGRESOS / VOLVER */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginBottom: '20px',
                        position: 'relative',
                        zIndex: 10,
                    }}
                >
                    {!showRangeFilter ? (
                        <Button
                            onClick={() => {
                                setShowRangeFilter(true);
                                // limpiar filtros al entrar a ingresos
                                setFilterType('');
                                setFilterValue('');
                            }}
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
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = '#ffffff')}
                        >
                            Ingresos por rango
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                // salir del modo rango
                                setShowRangeFilter(false);
                                setStartDate('');
                                setEndDate('');
                                setRangeReservations([]);
                                setTotalIncome(null);
                                setError(null);
                            }}
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
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = '#ffffff')}
                        >
                            ← Volver
                        </Button>
                    )}
                </div>

                {/* BARRA DE FILTROS (solo si NO estamos en ingresos) */}
                {!showRangeFilter && (
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
                            <div style={{ width: '120px' }} />
                        </div>

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

                        {/* BOTÓN PARA APLICAR FILTROS */}
                        <div style={{ marginTop: '16px' }}>
                            <Button
                                onClick={handleApplyFilters}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    color: '#000',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    padding: '6px 14px',
                                }}
                                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                                onMouseLeave={(e) => (e.target.style.backgroundColor = '#ffffff')}
                            >
                                Aplicar filtros
                            </Button>
                        </div>
                        {/* 🔚 FIN DEL NUEVO BOTÓN */}
                    </div>
                )}

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
                        {reservations.length === 0 ? (
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
                            <div>
                                {reservations.map((reservation) => (
                                    <ReservationCard
                                        key={reservation.id}
                                        reservation={reservation}
                                        onPayClick={handlePayClick}
                                        payButtonText={'Ver pago'}
                                        onEditClick={handleEditClick}
                                        isAdmin={currentUser?.is_admin}
                                    />
                                ))}
                            </div>
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

            {/* Modal de detalles de pago */}
            <PaymentDetailsModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                reservation={selectedReservation}
                onApprovePayment={handleApprovePayment}
            />

            {/* Modal de edición de reserva (solo admins) */}
            {currentUser?.is_admin && (
                <EditReservationModal
                    show={showEditModal}
                    onHide={() => {
                        setShowEditModal(false);
                        setEditingReservation(null);
                    }}
                    reservation={editingReservation}
                    courts={courts}
                    users={users}
                    onSave={handleSaveEdit}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
};

export default AllBookings;