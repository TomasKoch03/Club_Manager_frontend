import { useEffect, useState } from 'react';
import { IoAddCircleOutline, IoCalendarOutline, IoClose, IoLocationOutline, IoLockClosed, IoPerson, IoRemoveCircleOutline, IoTimeOutline } from 'react-icons/io5';
import { formatCurrency } from '../../utils/formatCurrency';
import { adjustDuration as adjustDurationHelper, adjustStartTime as adjustStartTimeHelper, calculateDuration as calculateDurationHelper, isValidTimeRange, recalculateEndTime } from '../../utils/timeHelpers';

const EditReservationModal = ({
    show,
    onHide,
    reservation,
    courts,
    users,
    onSave,
    isSaving
}) => {
    const [formData, setFormData] = useState({
        court_id: '',
        user_id: '',
        date: '',
        start_time: '',
        end_time: '',
        light: false,
        ball: false,
        number_of_rackets: 0
    });
    const [localError, setLocalError] = useState('');
    const [showCourtSelector, setShowCourtSelector] = useState(false);
    const [showDateSelector, setShowDateSelector] = useState(false);

    // Inicializar formulario cuando cambia la reserva
    useEffect(() => {
        if (reservation) {
            const startDate = new Date(reservation.start_time);
            const endDate = new Date(reservation.end_time);

            // Formatear fecha YYYY-MM-DD
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            // Formatear hora HH:MM
            const formatTime = (date) => {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            setFormData({
                court_id: reservation.court.id,
                user_id: reservation.user.id,
                date: formatDate(startDate),
                start_time: formatTime(startDate),
                end_time: formatTime(endDate),
                light: reservation.light || false,
                ball: reservation.ball || false,
                number_of_rackets: reservation.number_of_rackets || 0
            });
            setLocalError('');
        }
    }, [reservation]);

    if (!reservation || !show) return null;

    const hasPayment = reservation.payment && reservation.payment.status !== "pendiente";

    // Formatear fecha para mostrar en tarjeta de resumen (formato corto: "30 / 11 / 2025")
    const formatDateShort = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day} / ${month} / ${year}`;
    };

    // Formatear fecha para mostrar (formato largo: "Domingo 30 de Noviembre 2025")
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleInputChange = (field, value) => {
        if (field === 'start_time' && formData.start_time && formData.end_time) {
            const newEndTime = recalculateEndTime(formData.start_time, value, formData.end_time);

            if (newEndTime) {
                setFormData(prev => ({
                    ...prev,
                    start_time: value,
                    end_time: newEndTime
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    start_time: value
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        setLocalError('');
    };

    // Función para incrementar/decrementar la hora de inicio en 30 minutos
    const adjustStartTime = (minutes) => {
        if (hasPayment || !formData.start_time || !formData.end_time) return;

        const result = adjustStartTimeHelper(formData.start_time, formData.end_time, minutes);

        if (result) {
            setFormData(prev => ({
                ...prev,
                start_time: result.startTime,
                end_time: result.endTime
            }));
        }
    };

    // Función para incrementar/decrementar la duración en 30 minutos
    const adjustDuration = (minutes) => {
        if (hasPayment || !formData.start_time || !formData.end_time) return;

        const newEndTime = adjustDurationHelper(formData.start_time, formData.end_time, minutes);

        if (newEndTime) {
            setFormData(prev => ({
                ...prev,
                end_time: newEndTime
            }));
        }
    };

    // Calcular duración en horas
    const calculateDuration = () => {
        return calculateDurationHelper(formData.start_time, formData.end_time);
    };

    // Calcular precio total incluyendo extras y duración
    const calculateTotalPrice = () => {
        const duration = calculateDuration();
        let total = selectedCourt?.base_price * duration || 0;
        if (formData.light && selectedCourt?.light_price) total += selectedCourt.light_price;
        if (formData.ball && selectedCourt?.ball_price) total += selectedCourt.ball_price;
        if (formData.number_of_rackets > 0 && selectedCourt?.racket_price) {
            total += selectedCourt.racket_price * formData.number_of_rackets;
        }
        return total.toFixed(2);
    };

    const isValidTimeSelection = () => {
        return isValidTimeRange(formData.start_time, formData.end_time);
    };

    const validateForm = () => {
        // Validar que la hora de fin sea posterior a la de inicio
        if (!formData.start_time || !formData.end_time) {
            setLocalError('Las horas de inicio y fin son obligatorias');
            return false;
        }

        if (!isValidTimeRange(formData.start_time, formData.end_time)) {
            setLocalError('La hora de fin debe ser posterior a la hora de inicio');
            return false;
        }

        // Validar que todos los campos estén completos
        if (!formData.court_id || !formData.user_id || !formData.date) {
            setLocalError('Todos los campos son obligatorios');
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Combinar fecha y hora para crear datetime local
        const startDateTime = `${formData.date}T${formData.start_time}:00`;
        const endDateTime = `${formData.date}T${formData.end_time}:00`;

        const payload = {
            court_id: parseInt(formData.court_id),
            user_id: parseInt(formData.user_id),
            start_time: startDateTime,
            end_time: endDateTime,
            light: formData.light,
            ball: formData.ball,
            number_of_rackets: formData.number_of_rackets
        };

        onSave(reservation.id, payload);
    };

    const selectedCourt = courts.find(c => c.id === parseInt(formData.court_id));
    const selectedUser = users.find(u => u.id === parseInt(formData.user_id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onHide}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-900">
                        {hasPayment ? 'Detalles de la Reserva' : 'Editar Reserva'}
                    </h3>
                    <button
                        onClick={onHide}
                        className="p-2 rounded-full bg-transparent hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Alerta si tiene pago asociado */}
                    {hasPayment && (
                        <div className="flex items-center gap-3 p-3 mb-4 text-yellow-800 bg-yellow-50 rounded-xl border border-yellow-100">
                            <IoLockClosed size={20} className="shrink-0" />
                            <div>
                                <strong className="block font-semibold text-sm">Esta reserva no se puede modificar</strong>
                                <span className="text-xs">La reserva tiene un pago asociado y no puede ser editada.</span>
                            </div>
                        </div>
                    )}

                    {/* Error local de validación */}
                    {localError && (
                        <div className="p-3 mb-4 text-red-800 bg-red-50 rounded-xl border border-red-100 text-sm">
                            {localError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna Izquierda (Principal - 2/3) */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Select de Usuario */}
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                                        <IoPerson size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Usuario</span>
                                </div>
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => handleInputChange('user_id', e.target.value)}
                                    disabled={hasPayment}
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <option value="">Seleccionar usuario...</option>
                                    {users.filter(u => u.is_active).map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {selectedUser && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Email: {selectedUser.email}
                                    </p>
                                )}
                            </div>

                            {/* Tres Tarjetas de Resumen (Cancha, Fecha, Duración) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Tarjeta de Cancha */}
                                <div
                                    className={`flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 ${!hasPayment ? 'cursor-pointer hover:bg-blue-100/50 transition-colors' : 'cursor-not-allowed opacity-60'}`}
                                    onClick={() => !hasPayment && setShowCourtSelector(!showCourtSelector)}
                                >
                                    <IoLocationOutline size={20} className="text-blue-600 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-gray-500 block">Cancha</span>
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {selectedCourt ? `${selectedCourt.name} - ${selectedCourt.sport}` : 'Seleccionar'}
                                        </p>
                                    </div>
                                </div>

                                {/* Tarjeta de Fecha */}
                                <div
                                    className={`flex items-center gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-100 ${!hasPayment ? 'cursor-pointer hover:bg-purple-100/50 transition-colors' : 'cursor-not-allowed opacity-60'}`}
                                    onClick={() => !hasPayment && setShowDateSelector(!showDateSelector)}
                                >
                                    <IoCalendarOutline size={20} className="text-purple-600 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-gray-500 block">Fecha</span>
                                        <p className="text-sm font-bold text-gray-900">
                                            {formData.date ? formatDateShort(formData.date) : '--'}
                                        </p>
                                    </div>
                                </div>

                                {/* Tarjeta de Duración */}
                                <div className="flex items-center gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                    <IoTimeOutline size={20} className="text-orange-600 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-gray-500 block">Duración</span>
                                        <p className="text-sm font-bold text-gray-900">
                                            {isValidTimeSelection() ? `${calculateDuration().toFixed(1)}h` : '--h'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Texto informativo */}
                            {!hasPayment && (
                                <p className="text-xs text-gray-500 text-center -mt-2">
                                    💡 Haz clic en las tarjetas de Cancha y Fecha para modificarlas
                                </p>
                            )}

                            {/* Selector de Cancha Expandible */}
                            {showCourtSelector && !hasPayment && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Seleccionar Cancha</label>
                                    <select
                                        value={formData.court_id}
                                        onChange={(e) => {
                                            handleInputChange('court_id', e.target.value);
                                            setShowCourtSelector(false);
                                        }}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900"
                                    >
                                        <option value="">Seleccionar cancha...</option>
                                        {courts.map(court => (
                                            <option key={court.id} value={court.id}>
                                                {court.name} - {court.sport}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Selector de Fecha Expandible */}
                            {showDateSelector && !hasPayment && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Seleccionar Fecha</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => {
                                            handleInputChange('date', e.target.value);
                                            setShowDateSelector(false);
                                        }}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900"
                                    />
                                </div>
                            )}

                            {/* Horario de reserva con Steppers */}
                            <div className="bg-white">
                                <span className="text-sm font-semibold text-gray-900 block mb-3">Horario de reserva</span>

                                {/* Hora de Inicio con Steppers */}
                                <div className="mb-3">
                                    <label className="text-xs text-gray-500 mb-1.5 block font-medium text-center">Hora de Inicio</label>
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => adjustStartTime(-30)}
                                            disabled={hasPayment}
                                            className="p-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-600"
                                            aria-label="Restar 30 minutos al inicio"
                                        >
                                            <IoRemoveCircleOutline size={20} />
                                        </button>

                                        <input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => handleInputChange('start_time', e.target.value)}
                                            disabled={hasPayment}
                                            className="w-32 p-2.5 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 text-xl disabled:opacity-60 disabled:cursor-not-allowed"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => adjustStartTime(30)}
                                            disabled={hasPayment}
                                            className="p-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-600"
                                            aria-label="Sumar 30 minutos al inicio"
                                        >
                                            <IoAddCircleOutline size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Duración con Steppers */}
                                <div className="mb-2 pb-3 border-b border-gray-200">
                                    <label className="text-xs text-gray-500 mb-1.5 block font-medium text-center">Duración</label>
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => adjustDuration(-30)}
                                            disabled={hasPayment}
                                            className="p-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-600"
                                            aria-label="Reducir duración en 30 minutos"
                                        >
                                            <IoRemoveCircleOutline size={20} />
                                        </button>

                                        <div className="w-32 p-2.5 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg font-bold text-gray-900 text-xl">
                                            {isValidTimeSelection() ? `${calculateDuration().toFixed(1)}h` : '--h'}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => adjustDuration(30)}
                                            disabled={hasPayment}
                                            className="p-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-600"
                                            aria-label="Aumentar duración en 30 minutos"
                                        >
                                            <IoAddCircleOutline size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Hora de Fin - Solo Informativa */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-600">
                                        Finaliza a las{' '}
                                        <span className="font-bold text-gray-900 text-base">
                                            {formData.end_time || '--:--'}
                                        </span>
                                    </p>
                                </div>

                                {!isValidTimeSelection() && formData.start_time && formData.end_time && (
                                    <p className="text-xs text-red-500 mt-2 font-medium text-center">
                                        La hora de fin debe ser posterior a la de inicio
                                    </p>
                                )}

                            </div>

                            {/* Extras con diseño de tarjetas */}
                            <div className="bg-white">
                                <h6 className="text-sm font-semibold text-gray-900 mb-3">Extras opcionales</h6>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedCourt?.light_price > 0 && (
                                        <label className={`flex items-center gap-3 p-2.5 border-2 rounded-lg transition-all ${formData.light ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 bg-white'} ${!hasPayment ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60'}`}>
                                            <input
                                                type="checkbox"
                                                checked={formData.light}
                                                onChange={(e) => handleInputChange('light', e.target.checked)}
                                                disabled={hasPayment}
                                                className="appearance-none w-4 h-4 rounded border-2 border-gray-300 bg-gray-200 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all shrink-0 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundImage: formData.light ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                                                    backgroundSize: '100% 100%',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat'
                                                }}
                                            />
                                            <span className="text-sm font-medium text-gray-700 ml-3">Luz (+${formatCurrency(selectedCourt.light_price)})</span>
                                        </label>
                                    )}

                                    {selectedCourt?.ball_price > 0 && (
                                        <label className={`flex items-center gap-3 p-2.5 border-2 rounded-lg transition-all ${formData.ball ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 bg-white'} ${!hasPayment ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60'}`}>
                                            <input
                                                type="checkbox"
                                                checked={formData.ball}
                                                onChange={(e) => handleInputChange('ball', e.target.checked)}
                                                disabled={hasPayment}
                                                className="appearance-none w-4 h-4 rounded border-2 border-gray-300 bg-gray-200 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all shrink-0 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundImage: formData.ball ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                                                    backgroundSize: '100% 100%',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat'
                                                }}
                                            />
                                            <span className="text-sm font-medium text-gray-700 ml-3">Pelota (+${formatCurrency(selectedCourt.ball_price)})</span>
                                        </label>
                                    )}

                                    {selectedCourt?.racket_price > 0 && (
                                        <div className={`p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 sm:col-span-2 ${hasPayment ? 'opacity-60' : ''}`}>
                                            <label className="text-xs text-gray-600 block mb-1.5 font-medium">
                                                Raquetas (${formatCurrency(selectedCourt.racket_price)} c/u)
                                            </label>
                                            <select
                                                value={formData.number_of_rackets}
                                                onChange={(e) => handleInputChange('number_of_rackets', parseInt(e.target.value))}
                                                disabled={hasPayment}
                                                className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {[0, 1, 2, 3, 4].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información adicional de la reserva */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Reserva ID:</span>
                                    <span className="font-medium text-gray-900">#{reservation.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Estado:</span>
                                    <span className="font-medium text-gray-900 capitalize">
                                        {reservation.payment ? reservation.payment.status : 'pendiente'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Creada el:</span>
                                    <span className="font-medium text-gray-900">{formatDate(reservation.created_at)}</span>
                                </div>
                                {reservation.payment?.status === "pagado" && reservation.payment?.updated_at && (
                                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                                        <span className="text-gray-500">Fecha de pago:</span>
                                        <span className="font-medium text-gray-900">{formatDate(reservation.payment.updated_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha - Resumen de Precios (1/3) */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 sticky top-6">
                                <h6 className="text-sm font-semibold text-gray-900 mb-4">Resumen</h6>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Precio base/hora</span>
                                        <span className="text-gray-900 font-semibold">${formatCurrency(selectedCourt?.base_price || 0)}</span>
                                    </div>

                                    {isValidTimeSelection() && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Subtotal cancha</span>
                                            <span className="text-gray-900 font-semibold">
                                                ${formatCurrency((selectedCourt?.base_price || 0) * calculateDuration())}
                                            </span>
                                        </div>
                                    )}

                                    {(formData.light || formData.ball || formData.number_of_rackets > 0) && selectedCourt && (
                                        <div className="pt-3 border-t border-gray-300 space-y-2">
                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Extras</span>
                                            {formData.light && selectedCourt?.light_price > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Luz</span>
                                                    <span className="text-gray-900 font-medium">${formatCurrency(selectedCourt.light_price)}</span>
                                                </div>
                                            )}
                                            {formData.ball && selectedCourt?.ball_price > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Pelota</span>
                                                    <span className="text-gray-900 font-medium">${formatCurrency(selectedCourt.ball_price)}</span>
                                                </div>
                                            )}
                                            {formData.number_of_rackets > 0 && selectedCourt?.racket_price > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Raquetas ({formData.number_of_rackets})</span>
                                                    <span className="text-gray-900 font-medium">${formatCurrency(selectedCourt.racket_price * formData.number_of_rackets)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-300 mt-3">
                                        <span className="text-gray-600 text-xs block mb-1">Total a pagar</span>
                                        <span className="text-3xl font-bold text-gray-900 tracking-tight">
                                            ${formatCurrency(calculateTotalPrice())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center sticky bottom-0 z-10">
                    <button
                        onClick={onHide}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                    >
                        {hasPayment ? 'Cerrar' : 'Cancelar'}
                    </button>

                    {(!reservation.payment || reservation.payment.status === "pendiente") && (
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving || !isValidTimeSelection()}
                            className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditReservationModal;
