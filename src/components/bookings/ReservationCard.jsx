import jsPDF from 'jspdf';
import {
    IoBasketballOutline,
    IoCalendarOutline,
    IoCashOutline,
    IoFootballOutline,
    IoLockClosed,
    IoPencil,
    IoReceiptOutline,
    IoTennisballOutline,
    IoTimeOutline,
    IoTrashOutline,
} from 'react-icons/io5';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatCurrency';

const ReservationCard = ({ reservation, onPayClick, payButtonText, onEditClick, onCancelClick, isAdmin }) => {
    const toast = useToast();
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
            return <IoTennisballOutline size={24} className="text-yellow-600" />;
        } else if (sportLower === 'basquet' || sportLower === 'básquet') {
            return <IoBasketballOutline size={24} className="text-orange-600" />;
        }
        return <IoTennisballOutline size={24} className="text-gray-600" />;
    };

    // Obtener color de fondo del ícono según el deporte
    const getSportIconBg = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') return 'bg-green-50';
        if (sportLower === 'paddle') return 'bg-yellow-50';
        if (sportLower === 'basquet' || sportLower === 'básquet') return 'bg-orange-50';
        return 'bg-gray-50';
    };

    const isPaid = reservation.payment?.status === "pagado" || reservation.payment?.status === "paid";
    const paymentStatus = reservation.payment
        ? reservation.payment.status.toUpperCase()
        : "PENDIENTE";

    // Obtener monto
    const paymentAmount = Number(reservation.payment?.amount ?? reservation.court?.price ?? 0);

    // Generar comprobante de pago en PDF
    const generatePaymentReceipt = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Colores
        const primaryColor = [0, 0, 0];
        const secondaryColor = [100, 100, 100];
        const accentColor = [34, 197, 94]; // Verde

        // Encabezado
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('COMPROBANTE DE PAGO', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.setFont('helvetica', 'normal');
        doc.text('Club Manager', pageWidth / 2, 30, { align: 'center' });

        // Línea separadora
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.line(20, 45, pageWidth - 20, 45);

        let yPos = 60;

        // Información de la reserva
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Información de la Reserva', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...secondaryColor);

        const formatDateLong = (dateString) => {
            const date = new Date(dateString);
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
        };

        doc.text(`Reserva #${reservation.id}`, 20, yPos);
        yPos += 8;
        doc.text(`Cancha: ${reservation.court.name}`, 20, yPos);
        yPos += 8;
        doc.text(`Deporte: ${reservation.court.sport}`, 20, yPos);
        yPos += 8;
        doc.text(`Fecha: ${formatDateLong(reservation.start_time)}`, 20, yPos);
        yPos += 8;
        doc.text(`Horario: ${formatTime(reservation.start_time)} - ${formatTime(reservation.end_time)}`, 20, yPos);
        yPos += 8;

        // Extras con el mismo formato que información de reserva
        if (reservation.light || reservation.ball || reservation.number_of_rackets > 0) {
            const extras = [];
            if (reservation.light) extras.push('Luz');
            if (reservation.ball) extras.push('Pelota');
            if (reservation.number_of_rackets > 0) extras.push(`Raquetas (${reservation.number_of_rackets})`);

            doc.text(`Extras: ${extras.join(', ')}`, 20, yPos);
            yPos += 8;
        }

        yPos += 7;

        // Línea separadora
        doc.setDrawColor(229, 231, 235);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 15;

        // Información del pago
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Pago', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...secondaryColor);

        const paymentMethodLabels = {
            'mercadopago': 'Mercado Pago',
            'MP': 'Mercado Pago',
            'efectivo': 'Efectivo',
            'cash': 'Efectivo',
            'card': 'Tarjeta',
            'transfer': 'Transferencia'
        };

        const paymentMethod = paymentMethodLabels[reservation.payment?.method] || reservation.payment?.method || 'N/A';

        doc.text(`Método de Pago: ${paymentMethod}`, 20, yPos);
        yPos += 8;
        doc.text(`Estado: ${reservation.payment?.status?.toUpperCase() || 'N/A'}`, 20, yPos);
        yPos += 8;

        if (reservation.payment?.created_at) {
            const paymentDate = new Date(reservation.payment.created_at);
            doc.text(`Fecha de Pago: ${paymentDate.toLocaleDateString('es-AR')} ${paymentDate.toLocaleTimeString('es-AR')}`, 20, yPos);
            yPos += 8;
        }

        yPos += 10;

        // Total destacado con fondo blanco y texto negro
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(1);
        doc.roundedRect(20, yPos - 5, pageWidth - 40, 20, 3, 3, 'S');

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL PAGADO:', 25, yPos + 7);
        doc.text(`$${formatCurrency(paymentAmount)}`, pageWidth - 25, yPos + 7, { align: 'right' });

        yPos += 35;

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.setFont('helvetica', 'italic');
        const footerText = `Comprobante generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`;
        doc.text(footerText, pageWidth / 2, yPos, { align: 'center' });

        // Guardar el PDF con formato: Comprobante-<nombre_socio>-<fecha_reserva>
        const userName = reservation.user?.full_name?.replace(/\s+/g, '_') || 'Usuario';
        const reservationDate = new Date(reservation.start_time).toISOString().split('T')[0];
        doc.save(`Comprobante-${userName}-${reservationDate}.pdf`);
    };

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
                        ${formatCurrency(paymentAmount)}
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
                        <div className="relative group/edit">
                            <button
                                onClick={() => {
                                    if (isPaid) {
                                        toast.warning('Esta reserva ya está pagada y no puede ser editada');
                                    } else {
                                        onEditClick(reservation.id);
                                    }
                                }}
                                className={`p-2.5 rounded-lg hover:bg-gray-50 transition-colors group ${isPaid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <IoPencil className={`w-5 h-5 text-gray-500 ${!isPaid ? 'group-hover:text-blue-600' : ''} transition-colors`} />
                            </button>
                            {isPaid && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100 whitespace-nowrap opacity-0 invisible group-hover/edit:opacity-100 group-hover/edit:visible transition-all pointer-events-none shadow-sm">
                                    No se puede editar una reserva pagada
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-yellow-50 border-r border-b border-yellow-100 rotate-45"></div>
                                </div>
                            )}
                        </div>
                    )}
                    {onCancelClick && (
                        <div className="relative group/delete">
                            <button
                                onClick={() => {
                                    if (isPaid) {
                                        toast.error('No se puede cancelar una reserva que ya está pagada');
                                    } else {
                                        onCancelClick(reservation.id);
                                    }
                                }}
                                className={`p-2.5 rounded-lg hover:bg-gray-50 transition-colors group ${isPaid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <IoTrashOutline className={`w-5 h-5 text-gray-500 ${!isPaid ? 'group-hover:text-red-600' : ''} transition-colors`} />
                            </button>
                            {isPaid && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100 whitespace-nowrap opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all pointer-events-none shadow-sm">
                                    No se puede cancelar una reserva pagada
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-yellow-50 border-r border-b border-yellow-100 rotate-45"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botón de Pagar o Comprobante */}
                    {isPaid ? (
                        <button
                            onClick={generatePaymentReceipt}
                            className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                            title="Descargar comprobante de pago"
                        >
                            <IoReceiptOutline className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
                        </button>
                    ) : (
                        onPayClick && (
                            <button
                                onClick={() => onPayClick(reservation.id)}
                                className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                                title="Detalles del Pago"
                            >
                                <IoCashOutline className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;