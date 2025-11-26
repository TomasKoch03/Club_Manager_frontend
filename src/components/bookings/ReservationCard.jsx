import { IoBasketballOutline, IoCalendarOutline, IoFootballOutline, IoLockClosed, IoPencil, IoReceiptOutline, IoTennisballOutline, IoTimeOutline } from 'react-icons/io5';

const ReservationCard = ({ reservation, onPayClick, payButtonText, onEditClick, isAdmin }) => {
    // Formatear fecha corta
    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    };

    // Formatear hora
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Obtener ícono del deporte
    const getSportIcon = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') {
            return <IoFootballOutline size={24} className="text-green-600" />;
        } else if (sportLower === 'paddle') {
            return <IoTennisballOutline size={24} className="text-blue-600" />;
        } else if (sportLower === 'basquet' || sportLower === 'básquet') {
            return <IoBasketballOutline size={24} className="text-orange-600" />;
        }
        return <IoTennisballOutline size={24} className="text-gray-600" />;
    };

    // Obtener color de fondo del ícono según el deporte
    const getSportIconBg = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') return 'bg-green-50';
        if (sportLower === 'paddle') return 'bg-blue-50';
        if (sportLower === 'basquet' || sportLower === 'básquet') return 'bg-orange-50';
        return 'bg-gray-50';
    };

    const isPaid = reservation.payment?.status === "pagado" || reservation.payment?.status === "paid";
    const paymentStatus = reservation.payment
        ? reservation.payment.status.toUpperCase()
        : "PENDIENTE";

    // Obtener monto
    const paymentAmount = Number(reservation.payment?.amount ?? reservation.court?.price ?? 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between transition-all hover:shadow-md border border-gray-100">
            {/* ZONA 1: Icon Box del Deporte */}
            <div className="flex items-center gap-4 flex-1">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${getSportIconBg(reservation.court.sport)}`}>
                    {getSportIcon(reservation.court.sport)}
                </div>

                {/* ZONA 2: Información Principal (Nombre + Fecha/Hora) */}
                <div className="flex-1 min-w-0">
                    {/* Nombre de la cancha */}
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2 truncate">
                        {reservation.court.name}
                        {isPaid && (
                            <IoLockClosed
                                size={16}
                                className="text-gray-400 shrink-0"
                                title="Reserva con pago - No editable"
                            />
                        )}
                    </h3>

                    {/* Fecha y Hora en una línea */}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <IoCalendarOutline size={14} />
                            {formatDateShort(reservation.start_time)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1.5">
                            <IoTimeOutline size={14} />
                            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ZONA 3: Metadata & Actions (Precio, Estado, Botones) */}
            <div className="flex items-center gap-4 ml-4">
                {/* Precio */}
                <div className="text-right hidden md:block">
                    <div className="text-lg font-bold text-gray-900">
                        ${paymentAmount.toLocaleString('es-AR')}
                    </div>
                </div>

                {/* Badge de Estado */}
                <div className="hidden sm:block">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isPaid
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                            }`}
                    >
                        {paymentStatus}
                    </span>
                </div>

                {/* Icon Buttons */}
                <div className="flex items-center gap-2">
                    {/* Botón de Editar/Ver */}
                    {onEditClick && (
                        <button
                            onClick={() => onEditClick(reservation.id)}
                            className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                            title={isPaid ? 'Ver detalles' : 'Editar reserva'}
                        >
                            <IoPencil className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        </button>
                    )}

                    {/* Botón de Pagar/Ver Pago */}
                    {onPayClick && (
                        <button
                            onClick={() => onPayClick(reservation.id)}
                            className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                            title={isPaid ? 'Ver detalles de pago' : 'Detalles del Pago'}
                        >
                            <IoReceiptOutline className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;