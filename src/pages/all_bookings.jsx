import { useEffect, useState } from 'react';
import { IoCalendarOutline, IoFilterOutline, IoTrendingUpOutline } from 'react-icons/io5';
import EditReservationModal from '../components/bookings/EditReservationModal';
import PaymentDetailsModal from '../components/bookings/PaymentDetailsModal';
import ReservationCard from '../components/bookings/ReservationCard';
import { useToast } from '../hooks/useToast';
import { getAllReservations, getAllReservationsFiltered, getAllUsers, getCourts, getPaidReservationsByRange, getReservationById, getUserData, patchPayment, updateReservation } from '../services/api';


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
    const [filterTypeToday, setFilterTypeToday] = useState('');
    const [filterValueToday, setFilterValueToday] = useState('todos');

    // Estados del rango de fechas
    const [showRangeFilter, setShowRangeFilter] = useState(false);
    const [showToday, setShowToday] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rangeReservations, setRangeReservations] = useState([]);
    const [totalIncome, setTotalIncome] = useState(null);
    const [todayReservations, setTodayReservations] = useState([]);
    const [todayLoading, setTodayLoading] = useState(false);
    const [dateRangeError, setDateRangeError] = useState(null);

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

            // Si la vista 'Hoy' está activa, refrescar también las reservas de hoy
            if (showToday) {
                try {
                    await handleGetTodayReservations();
                    // Asegurarse de que la UI de filtros para 'Hoy' quede limpia
                    setFilterTypeToday('');
                    setFilterValueToday('todos');
                } catch (err) {
                    // No bloquear el flujo ante un error al refrescar 'hoy'
                    console.error('Error al refrescar reservas de hoy después del pago:', err);
                }
            }
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

            // Si la vista 'Hoy' está activa, refrescar también las reservas de hoy para reflejar cambios inmediatos
            if (showToday) {
                try {
                    await handleGetTodayReservations();
                } catch (err) {
                    console.error('Error al refrescar reservas de hoy después de editar:', err);
                }
            }

            // Limpiar filtros (que no quede ningún selector seleccionado en el panel)
            setFilterType('');
            setFilterValue('');
            setFilterTypeToday('');
            setFilterValueToday('todos');
            setStartDate('');
            setEndDate('');

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
                toast.error(`Error al actualizar la reserva. Por favor, intenta nuevamente.`);
            }

            // IMPORTANTE: NO cerrar el modal ni recargar reservas cuando hay error
            // El modal permanece abierto para que el usuario corrija los datos
        } finally {
            setIsSaving(false);
        }
    };

    // Filtro 
    const handleApplyFilters = async () => {
        setDateRangeError(null);
        setLoading(true);
        const filters = {};

        if (filterType === 'deporte' && filterValue !== 'todos') {
            filters.sport = filterValue;
        } else if (filterType === 'estado' && filterValue !== 'todos') {
            filters.status = filterValue;
        } else if (filterType === 'fecha' && startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                setDateRangeError("La fecha de inicio no puede ser posterior a la fecha de fin.");
                setReservations([]); // limpio reservas para mostrar solo el error
                setLoading(false);
                return;
            }
            const isoStart = new Date(startDate).toISOString();
            const isoEnd = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
            filters.start_date = isoStart;
            filters.end_date = isoEnd;
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
        } finally {
            setLoading(false);
        }
    };

    const renderDateRangeError = () => (
        <div
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #dc3545',
                borderRadius: '8px',
                color: '#dc3545',
                padding: '10px 14px',
                marginTop: '12px',
                fontWeight: '500',
                fontSize: '0.95rem',
            }}
        >
            {dateRangeError}
        </div>
    );



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
        const isoEnd = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(); // 23:59:59 del endDate
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

    // Obtener reservas del día de hoy
    const handleGetTodayReservations = async () => {
        setTodayReservations([]);
        setError(null);
        setTodayLoading(true);

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const isoStart = start.toISOString();
        const isoEnd = end.toISOString();

        try {
            // Reutilizamos el endpoint de filtros con start_date / end_date
            const data = await getAllReservationsFiltered({ start_date: isoStart, end_date: isoEnd });
            const sortedData = data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
            setTodayReservations(sortedData);
            setError(null);
        } catch (err) {
            console.error('Error al obtener reservas de hoy:', err);
            setError('No se pudieron obtener las reservas de hoy.');
        } finally {
            setTodayLoading(false);
        }
    };

    // Aplicar filtros a las reservas de hoy
    const handleApplyTodayFilters = async () => {
        setError(null);
        setTodayLoading(true);
        const filters = {};

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const isoStart = start.toISOString();
        const isoEnd = end.toISOString();

        // Construir filtros base (sport/status) si el usuario eligió uno
        const baseFilters = {};
        if (filterTypeToday === 'deporte' && filterValueToday && filterValueToday !== 'todos') {
            baseFilters.sport = filterValueToday;
        } else if (filterTypeToday === 'estado' && filterValueToday && filterValueToday !== 'todos') {
            baseFilters.status = filterValueToday;
        }

        try {
            
            let data = [];

            if (Object.keys(baseFilters).length === 0) {
                // Si no hay filtro por deporte/estado, pedir directamente las reservas de hoy al backend
                data = await getAllReservationsFiltered({ start_date: isoStart, end_date: isoEnd });
            } else {
                // Si hay filtro por deporte/estado, pedir al backend por ese filtro y luego filtrar por fecha en cliente
                const apiData = await getAllReservationsFiltered(baseFilters);
                
                if (Array.isArray(apiData)) {
                    data = apiData.filter((r) => {
                        const t = new Date(r.start_time).getTime();
                        return t >= new Date(isoStart).getTime() && t <= new Date(isoEnd).getTime();
                    });
                } else {
                    data = [];
                }
            }

            const sortedData = data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
            setTodayReservations(sortedData);
            setError(null);
        } catch (err) {
            console.error('Error al aplicar filtros a reservas de hoy:', err);
            setError('No se pudieron filtrar las reservas de hoy.');
        } finally {
            setTodayLoading(false);
        }
    };

    // Etiqueta con la fecha de hoy (formateada en español)
    const todayLabel = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });


    return (
        <div style={{
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "16px 32px 60px 32px"
        }}>
            {/* Estilos personalizados para el scrollbar */}
            <style>
                {`
                    .all-bookings-container::-webkit-scrollbar {
                        width: 10px;
                    }
                    .all-bookings-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .all-bookings-container::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .all-bookings-container::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                `}
            </style>
            <div className="max-w-6xl mx-auto pb-20 all-bookings-container">
                {/* ENCABEZADO */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservas</h1>
                    <p className="text-gray-600">
                        Gestiona las reservas de tus clientes y administra los pagos
                    </p>
                </div>

                {/* BOTONES DE TOGGLE */}
                <div className="mb-6 flex flex-wrap gap-3">
                    {/* Botón Reportes de ingresos */}
                    <button
                        onClick={() => {
                            setShowRangeFilter(!showRangeFilter);
                            setShowToday(false);
                            if (!showRangeFilter) {
                                // Limpiar filtros al entrar a ingresos
                                setFilterType('');
                                setFilterValue('');
                            } else {
                                // Salir del modo rango
                                setStartDate('');
                                setEndDate('');
                                setRangeReservations([]);
                                setTotalIncome(null);
                                setError(null);
                            }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        {!showRangeFilter ? (
                            <>
                                <IoTrendingUpOutline size={20} />
                                Reportes de ingresos
                            </>
                        ) : (
                            <>
                                <IoFilterOutline size={20} />
                                ← Todas las reservas
                            </>
                        )}
                    </button>

                    {/* Botón Reservas de hoy */}
                    <button
                        onClick={() => {
                            setShowToday(!showToday);
                            setShowRangeFilter(false);
                            if (!showToday) {
                                // Cargar reservas de hoy al activar
                                handleGetTodayReservations();
                                // Limpiar filtros
                                setFilterTypeToday('');
                                setFilterValueToday('todos');
                            } else {
                                // Salir del modo hoy
                                setTodayReservations([]);
                                setError(null);
                            }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        {!showToday ? (
                            <>
                                <IoCalendarOutline size={20} />
                                Reservas de hoy
                            </>
                        ) : (
                            <>
                                <IoFilterOutline size={20} />
                                ← Todas las reservas
                            </>
                        )}
                    </button>
                </div>

                {/* SECCIÓN DE FILTROS */}
                {!showRangeFilter && !showToday && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            {/* Selector de tipo de filtro */}
                            <div className="flex-shrink-0">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Filtrar por
                                </label>
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setFilterValue('');
                                    }}
                                    className="h-10 px-3 bg-gray-50 border-transparent rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="deporte">Deporte</option>
                                    <option value="estado">Estado de pago</option>
                                    <option value="fecha">Rango de fechas</option>
                                </select>
                            </div>

                            {/* Filtro por Deporte */}
                            {filterType === 'deporte' && (
                                <div className="flex-shrink-0 animate-in fade-in duration-200">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Deporte
                                    </label>
                                    <select
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        className="h-10 px-3 bg-gray-50 border-transparent rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="futbol">Fútbol</option>
                                        <option value="basquet">Básquet</option>
                                        <option value="paddle">Paddle</option>
                                    </select>
                                </div>
                            )}

                            {/* Filtro por Estado */}
                            {filterType === 'estado' && (
                                <div className="flex-shrink-0 animate-in fade-in duration-200">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Estado de pago
                                    </label>
                                    <select
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        className="h-10 px-3 bg-gray-50 border-transparent rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="pagado">Pagado</option>
                                        <option value="pendiente">Pendiente</option>
                                    </select>
                                </div>
                            )}

                            {/* Filtro por Fecha */}
                            {filterType === 'fecha' && (
                                <div className="flex-grow animate-in fade-in duration-200">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Rango de fechas
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="h-10 px-3 bg-gray-50 border-transparent rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                        <span className="hidden sm:block text-gray-300">→</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="h-10 px-3 bg-gray-50 border-transparent rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Botón Aplicar Filtros */}
                            <div className="flex-shrink-0 lg:ml-auto">
                                <button
                                    onClick={handleApplyFilters}
                                    disabled={loading}
                                    className="h-10 px-6 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Filtrando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IoFilterOutline size={16} />
                                            Aplicar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error de rango de fechas */}
                        {filterType === 'fecha' && dateRangeError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                                {dateRangeError}
                            </div>
                        )}
                    </div>
                )}

                {/* SECCIÓN DE INGRESOS POR RANGO */}
                {showRangeFilter && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <IoTrendingUpOutline size={24} className="text-gray-700" />
                            <h3 className="text-lg font-semibold text-gray-900">Ingresos por rango de fechas</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full md:w-auto p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-900"
                            />
                            <span className="hidden md:block text-gray-400">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full md:w-auto p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-900"
                            />
                            <button
                                onClick={handleGetRangeIncome}
                                className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Consultar
                            </button>
                        </div>

                        {totalIncome !== null && (
                            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">INGRESOS TOTALES</p>
                                <p className="text-4xl font-bold text-green-700">${totalIncome.toFixed(2)}</p>
                            </div>
                        )}

                        {rangeReservations.length > 0 && (
                            <div className="mt-6">
                                {rangeReservations.map((r) => (
                                    <ReservationCard
                                        key={r.id}
                                        reservation={r}
                                        onPayClick={handlePayClick}
                                        payButtonText={'Ver pago'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SECCIÓN DE RESERVAS DE HOY */}
                {showToday && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <IoCalendarOutline size={24} className="text-gray-700" />
                                    <h3 className="text-lg font-semibold text-gray-900">Reservas de hoy</h3>
                                    <span className="text-sm text-gray-500 ml-3">{todayLabel}</span>
                                </div>

                        {/* BARRA DE FILTROS PARA HOY (sin opción de fechas) */}
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                                {/* Selector de tipo de filtro */}
                                <div className="flex-shrink-0">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Filtrar por
                                    </label>
                                    <select
                                        value={filterTypeToday}
                                        onChange={(e) => {
                                            setFilterTypeToday(e.target.value);
                                            setFilterValueToday('todos');
                                        }}
                                        className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="deporte">Deporte</option>
                                        <option value="estado">Estado de pago</option>
                                    </select>
                                </div>

                                {/* Filtro por Deporte */}
                                {filterTypeToday === 'deporte' && (
                                    <div className="flex-shrink-0 animate-in fade-in duration-200">
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            Deporte
                                        </label>
                                        <select
                                            value={filterValueToday}
                                            onChange={(e) => setFilterValueToday(e.target.value)}
                                            className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        >
                                            <option value="todos">Todos</option>
                                            <option value="futbol">Fútbol</option>
                                            <option value="basquet">Básquet</option>
                                            <option value="paddle">Paddle</option>
                                        </select>
                                    </div>
                                )}

                                {/* Filtro por Estado */}
                                {filterTypeToday === 'estado' && (
                                    <div className="flex-shrink-0 animate-in fade-in duration-200">
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            Estado de pago
                                        </label>
                                        <select
                                            value={filterValueToday}
                                            onChange={(e) => setFilterValueToday(e.target.value)}
                                            className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        >
                                            <option value="todos">Todos</option>
                                            <option value="pagado">Pagado</option>
                                            <option value="pendiente">Pendiente</option>
                                        </select>
                                    </div>
                                )}

                                {/* Botón Aplicar Filtros */}
                                <div className="flex-shrink-0 lg:ml-auto">
                                    <button
                                        onClick={handleApplyTodayFilters}
                                        disabled={todayLoading}
                                        className="h-10 px-6 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {todayLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Filtrando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IoFilterOutline size={16} />
                                                Aplicar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {todayLoading && (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando reservas de hoy...</p>
                            </div>
                        )}

                        {!todayLoading && todayReservations.length === 0 && (
                            <div className="p-8 text-center">
                                <IoCalendarOutline size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-600">No hay reservas para hoy</p>
                            </div>
                        )}

                        {!todayLoading && todayReservations.length > 0 && (
                            <div className="space-y-4">
                                {todayReservations.map((r) => (
                                    <ReservationCard
                                        key={r.id}
                                        reservation={r}
                                        onPayClick={handlePayClick}
                                        payButtonText={'Ver pago'}
                                        onEditClick={handleEditClick}
                                        isAdmin={currentUser?.is_admin}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* LISTADO DE RESERVAS */}
                {!showRangeFilter && !showToday && !loading && !error && (
                    <>
                        {reservations.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <IoCalendarOutline size={64} className="mx-auto text-gray-300 mb-4" />
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
                                        payButtonText={'Ver pago'}
                                        onEditClick={handleEditClick}
                                        isAdmin={currentUser?.is_admin}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* LOADING */}
                {loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando reservas...</p>
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                        {error}
                    </div>
                )}
            </div>

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