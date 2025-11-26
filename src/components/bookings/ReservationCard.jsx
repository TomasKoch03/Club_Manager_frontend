import { IoCalendarOutline, IoLocationOutline, IoLockClosed, IoPencil, IoTimeOutline } from 'react-icons/io5';

const ReservationCard = ({ reservation, onPayClick, payButtonText, onEditClick, isAdmin }) => {
    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Formatear hora
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Calcular duración en horas
    const calculateDuration = () => {
        const start = new Date(reservation.start_time);
        const end = new Date(reservation.end_time);
        const durationMinutes = (end - start) / (1000 * 60);
        return (durationMinutes / 60).toFixed(2);
    };

    // Capitalizar primera letra
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const isPaid = reservation.payment?.status === "pagado" || reservation.payment?.status === "paid";
    const paymentStatus = reservation.payment
        ? reservation.payment.status.toUpperCase()
        : "SIN PAGAR";

    // Obtener monto
    const paymentAmount = Number(reservation.payment?.amount ?? reservation.court?.price ?? 0);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Información principal */}
                <div className="flex-1">
                    {/* Nombre de la cancha y deporte */}
                    <div className="flex items-center gap-2 mb-3">
                        <IoLocationOutline size={24} className="text-gray-700" />
                        <h3 className="text-xl font-bold text-gray-900">{reservation.court.name}</h3>
                        {isPaid && (
                            <IoLockClosed
                                size={18}
                                className="text-gray-400"
                                title="Reserva con pago - No editable"
                            />
                        )}
                    </div>

                    {/* Badge del deporte */}
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded-lg">
                            {capitalize(reservation.court.sport)}
                        </span>
                    </div>

                    {/* Fecha del turno */}
                    <div className="flex items-center gap-2 mb-2 text-gray-600">
                        <IoCalendarOutline size={18} />
                        <span className="font-medium">{formatDate(reservation.start_time)}</span>
                    </div>

                    {/* Horario */}
                    <div className="flex items-center gap-2 mb-3 text-gray-600">
                        <IoTimeOutline size={18} />
                        <span className="font-semibold text-gray-900">
                            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                        </span>
                        <span className="text-sm text-gray-500">
                            ({calculateDuration()}h)
                        </span>
                    </div>

                    {/* Fechas de solicitud y pago */}
                    <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                            Solicitado el {formatDate(reservation.created_at)}
                        </p>
                        {isPaid && reservation.payment?.updated_at && (
                            <p className="text-sm text-green-600 font-medium">
                                Pagado el {formatDate(reservation.payment.updated_at)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Estado y acciones */}
                <div className="flex flex-col items-end gap-3">
                    {/* Estado de pago y monto */}
                    <div className="text-right">
                        <span
                            className={`inline-block px-4 py-2 rounded-xl font-bold text-sm mb-2 ${isPaid
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {paymentStatus}
                        </span>
                        <div className="text-2xl font-bold text-gray-900">
                            ${paymentAmount.toFixed(2)}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                        {/* Botón de editar */}
                        {onEditClick && (
                            <button
                                onClick={() => onEditClick(reservation.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isPaid
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200'
                                    }`}
                                title={isPaid ? 'Ver detalles (no editable)' : 'Editar reserva'}
                            >
                                <IoPencil size={16} />
                                {isPaid ? 'Ver' : 'Editar'}
                            </button>
                        )}

                        {/* Botón de pagar */}
                        {!isPaid && onPayClick && (
                            <button
                                onClick={() => onPayClick(reservation.id)}
                                className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
                            >
                                {payButtonText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;