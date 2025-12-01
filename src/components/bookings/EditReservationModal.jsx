import { useEffect, useState } from 'react';
import { IoCalendarOutline, IoClose, IoLocationOutline, IoLockClosed, IoPerson, IoTimeOutline } from 'react-icons/io5';
import { formatCurrency } from '../../utils/formatCurrency';

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
        start_time: '',
        end_time: '',
        light: false,
        ball: false,
        number_of_rackets: 0
    });
    const [localError, setLocalError] = useState('');

    // Inicializar formulario cuando cambia la reserva
    useEffect(() => {
        if (reservation) {
            // Convertir las fechas ISO a formato datetime-local para el input
            const startDate = new Date(reservation.start_time);
            const endDate = new Date(reservation.end_time);

            // Formatear a YYYY-MM-DDTHH:MM para datetime-local input
            const formatForInput = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                court_id: reservation.court.id,
                user_id: reservation.user.id,
                start_time: formatForInput(startDate),
                end_time: formatForInput(endDate),
                light: reservation.light || false,
                ball: reservation.ball || false,
                number_of_rackets: reservation.number_of_rackets || 0
            });
            setLocalError('');
        }
    }, [reservation]);

    if (!reservation || !show) return null;

    const hasPayment = reservation.payment && reservation.payment.status !== "pendiente";

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setLocalError('');
    };

    const validateForm = () => {
        // Validar que la hora de fin sea posterior a la de inicio
        const startDate = new Date(formData.start_time);
        const endDate = new Date(formData.end_time);

        if (endDate <= startDate) {
            setLocalError('La hora de fin debe ser posterior a la hora de inicio');
            return false;
        }

        // Validar que todos los campos estén completos
        if (!formData.court_id || !formData.user_id || !formData.start_time || !formData.end_time) {
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

        // Convertir las fechas del input datetime-local a formato ISO 8601 LOCAL (sin zona horaria)
        // Formato esperado: "2025-11-20T14:00:00" (sin Z ni offset)
        const formatToLocalISO = (dateTimeLocal) => {
            // dateTimeLocal ya está en formato "YYYY-MM-DDTHH:MM"
            // Solo necesitamos agregar :00 para los segundos
            return `${dateTimeLocal}:00`;
        };

        const payload = {
            court_id: parseInt(formData.court_id),
            user_id: parseInt(formData.user_id),
            start_time: formatToLocalISO(formData.start_time),
            end_time: formatToLocalISO(formData.end_time),
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
                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Columna izquierda - Usuario y Cancha */}
                            <div className="space-y-4">
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

                                {/* Select de Cancha */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                            <IoLocationOutline size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Cancha</span>
                                    </div>
                                    <select
                                        value={formData.court_id}
                                        onChange={(e) => handleInputChange('court_id', e.target.value)}
                                        disabled={hasPayment}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Seleccionar cancha...</option>
                                        {courts.map(court => (
                                            <option key={court.id} value={court.id}>
                                                {court.name} - {court.sport}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedCourt && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Deporte: {selectedCourt.sport} | Precio base: ${formatCurrency(selectedCourt.base_price)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Columna derecha - Fechas */}
                            <div className="space-y-4">
                                {/* Fecha y Hora de Inicio */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                                            <IoCalendarOutline size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Fecha y Hora de Inicio</span>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={(e) => handleInputChange('start_time', e.target.value)}
                                        disabled={hasPayment}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Fecha y Hora de Fin */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                                            <IoTimeOutline size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Fecha y Hora de Fin</span>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_time}
                                        onChange={(e) => handleInputChange('end_time', e.target.value)}
                                        disabled={hasPayment}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección de Extras */}
                        <div className="pt-4 border-t border-gray-100">
                            <h6 className="font-semibold text-gray-900 mb-3 text-sm">Extras</h6>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    {/* Luz artificial */}
                                    <label className={`relative flex flex-row items-center w-full gap-3 p-2.5 border border-gray-200 rounded-xl transition-colors ${hasPayment ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.light}
                                            onChange={(e) => handleInputChange('light', e.target.checked)}
                                            disabled={hasPayment}
                                            className="appearance-none w-5 h-5 rounded border-2 border-gray-200 bg-gray-100/40 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all shrink-0"
                                            style={{
                                                backgroundImage: formData.light ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                                                backgroundSize: '100% 100%',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat'
                                            }}
                                        />
                                        <span className="font-medium text-gray-700 text-sm leading-5 ml-2">
                                            Luz artificial {selectedCourt?.light_price > 0 ? `(+$${formatCurrency(selectedCourt.light_price)})` : ''}
                                        </span>
                                    </label>

                                    {/* Pelota */}
                                    <label className={`relative flex flex-row items-center w-full gap-4 p-2.5 border border-gray-200 rounded-xl transition-colors ${hasPayment ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.ball}
                                            onChange={(e) => handleInputChange('ball', e.target.checked)}
                                            disabled={hasPayment}
                                            className="appearance-none w-5 h-5 rounded border-2 border-gray-200 bg-gray-100/40 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all shrink-0"
                                            style={{
                                                backgroundImage: formData.ball ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                                                backgroundSize: '100% 100%',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat'
                                            }}
                                        />
                                        <span className="font-medium text-gray-700 text-sm leading-5 ml-2">
                                            Pelota {selectedCourt?.ball_price > 0 ? `(+$${formatCurrency(selectedCourt.ball_price)})` : ''}
                                        </span>
                                    </label>
                                </div>

                                {selectedCourt?.racket_price > 0 && (
                                    <div>
                                        {/* Raquetas */}
                                        <div className={`p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 ${hasPayment ? 'opacity-60' : ''}`}>
                                            <label className="text-xs text-gray-600 block mb-1.5 font-medium">
                                                Cantidad de raquetas (${formatCurrency(selectedCourt.racket_price)} c/u)
                                            </label>
                                            <select
                                                value={formData.number_of_rackets}
                                                onChange={(e) => handleInputChange('number_of_rackets', parseInt(e.target.value))}
                                                disabled={hasPayment}
                                                className="w-full p-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:cursor-not-allowed text-sm"
                                            >
                                                {[0, 1, 2, 3, 4].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información adicional */}
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
                    </form>
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
                            disabled={isSaving}
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
