import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState } from 'react';
import { IoCalendarOutline, IoClose, IoLocationOutline, IoTimeOutline } from 'react-icons/io5';

// Inicializar Mercado Pago con la public key
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
if (MP_PUBLIC_KEY) {
    initMercadoPago(MP_PUBLIC_KEY);
}

const BookingConfirmationModal = ({
    show,
    onHide,
    bookingData,
    onPayInClub,
    onPayWithMercadoPago,
    preferenceId,
    isLoadingPreference
}) => {
    const [extras, setExtras] = useState({
        light: false,
        ball: false,
        number_of_rackets: 0
    });

    const [timeSelection, setTimeSelection] = useState({
        startTime: '',
        endTime: ''
    });

    // Inicializar tiempos cuando se abre el modal
    useEffect(() => {
        if (bookingData && show) {
            const formatForInput = (dateString) => {
                const date = new Date(dateString);
                const hours = date.getUTCHours().toString().padStart(2, '0');
                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            setTimeSelection({
                startTime: formatForInput(bookingData.startTime),
                endTime: formatForInput(bookingData.endTime)
            });
        }
    }, [bookingData, show]);

    if (!show || !bookingData) return null;

    const { courtName, date, court } = bookingData;

    // Calcular duración en horas basándose en los tiempos seleccionados
    const calculateDuration = () => {
        if (!timeSelection.startTime || !timeSelection.endTime) return 0;

        const [startHours, startMinutes] = timeSelection.startTime.split(':').map(Number);
        const [endHours, endMinutes] = timeSelection.endTime.split(':').map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        const durationMinutes = endTotalMinutes - startTotalMinutes;
        return durationMinutes > 0 ? durationMinutes / 60 : 0;
    };

    // Calcular precio total incluyendo extras y duración
    const calculateTotalPrice = () => {
        const duration = calculateDuration();
        let total = court?.base_price * duration || 0;
        if (extras.light && court?.light_price) total += court.light_price;
        if (extras.ball && court?.ball_price) total += court.ball_price;
        if (extras.number_of_rackets > 0 && court?.racket_price) {
            total += court.racket_price * extras.number_of_rackets;
        }
        return total.toFixed(2);
    };

    const handleExtraChange = (field, value) => {
        setExtras(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTimeChange = (field, value) => {
        setTimeSelection(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const isValidTimeSelection = () => {
        if (!timeSelection.startTime || !timeSelection.endTime) return false;

        const [startHours, startMinutes] = timeSelection.startTime.split(':').map(Number);
        const [endHours, endMinutes] = timeSelection.endTime.split(':').map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        return endTotalMinutes > startTotalMinutes;
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onHide}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-900">Confirmar Reserva</h3>
                    <button
                        onClick={onHide}
                        className="p-2 rounded-full bg-transparent hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Column */}
                        <div className="flex-1 space-y-6">
                            <h5 className="font-semibold text-gray-900 text-lg">Detalles de la Reserva</h5>

                            {/* Cancha */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <IoLocationOutline size={24} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500 block mb-1">Cancha</span>
                                    <p className="text-lg font-bold text-gray-900">{courtName}</p>
                                </div>
                            </div>

                            {/* Fecha */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                                    <IoCalendarOutline size={24} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500 block mb-1">Fecha</span>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{formatDate(date)}</p>
                                </div>
                            </div>

                            {/* Horario */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                    <IoTimeOutline size={24} />
                                </div>
                                <div className="w-full">
                                    <span className="text-sm font-medium text-gray-500 block mb-2">Horario</span>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Inicio</label>
                                            <input
                                                type="time"
                                                value={timeSelection.startTime}
                                                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Fin</label>
                                            <input
                                                type="time"
                                                value={timeSelection.endTime}
                                                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    {isValidTimeSelection() && (
                                        <p className="text-sm text-green-600 mt-2 font-medium">
                                            Duración: {calculateDuration().toFixed(2)} hora(s)
                                        </p>
                                    )}
                                    {!isValidTimeSelection() && timeSelection.startTime && timeSelection.endTime && (
                                        <p className="text-sm text-red-500 mt-2 font-medium">
                                            La hora de fin debe ser posterior a la de inicio
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Extras */}
                            <div className="pt-6 border-t border-gray-100">
                                <h6 className="font-semibold text-gray-900 mb-4">Extras</h6>
                                <div className="flex flex-col gap-3">
                                    {court?.light_price > 0 && (
                                        <label className="relative flex flex-row items-center w-full gap-4 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={extras.light}
                                                onChange={(e) => handleExtraChange('light', e.target.checked)}
                                                className="appearance-none w-5 h-5 rounded border-2 border-gray-200 bg-gray-100/40 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all shrink-0"
                                                style={{
                                                    backgroundImage: extras.light ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                                                    backgroundSize: '100% 100%',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat'
                                                }}
                                            />
                                            <span className="font-medium text-gray-700 leading-5 ml-2">Luz artificial (+${court.light_price})</span>
                                        </label>
                                    )}

                                    {court?.ball_price > 0 && (
                                        <label className="relative flex flex-row items-center w-full gap-4 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={extras.ball}
                                                onChange={(e) => handleExtraChange('ball', e.target.checked)}
                                                className="appearance-none w-5 h-5 rounded border-2 border-gray-200 bg-gray-100/40 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all shrink-0"
                                                style={{
                                                    backgroundImage: extras.ball ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                                                    backgroundSize: '100% 100%',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat'
                                                }}
                                            />
                                            <span className="font-medium text-gray-700 leading-5 ml-2">Pelota (+${court.ball_price})</span>
                                        </label>
                                    )}

                                    {court?.racket_price > 0 && (
                                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                                            <label className="text-sm text-gray-600 block mb-2 font-medium">
                                                Cantidad de raquetas (${court.racket_price} c/u)
                                            </label>
                                            <select
                                                value={extras.number_of_rackets}
                                                onChange={(e) => handleExtraChange('number_of_rackets', parseInt(e.target.value))}
                                                className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                {[0, 1, 2, 3, 4].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Summary */}
                        <div className="w-full md:w-80 flex flex-col justify-end">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">Precio base / hora</span>
                                        <span className="text-gray-900 font-semibold">${court?.base_price || 0}</span>
                                    </div>

                                    {isValidTimeSelection() && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Subtotal cancha</span>
                                            <span className="text-gray-900 font-semibold">
                                                ${((court?.base_price || 0) * calculateDuration()).toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {(extras.light || extras.ball || extras.number_of_rackets > 0) && (
                                        <div className="pt-4 border-t border-gray-200 space-y-2">
                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Extras</span>
                                            {extras.light && court?.light_price > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Luz</span>
                                                    <span className="text-gray-900 font-medium">${court.light_price}</span>
                                                </div>
                                            )}
                                            {extras.ball && court?.ball_price > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Pelota</span>
                                                    <span className="text-gray-900 font-medium">${court.ball_price}</span>
                                                </div>
                                            )}
                                            {extras.number_of_rackets > 0 && court?.racket_price > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Raquetas ({extras.number_of_rackets})</span>
                                                    <span className="text-gray-900 font-medium">${court.racket_price * extras.number_of_rackets}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-200 mt-4">
                                        <span className="text-gray-500 text-sm block mb-1">Total a pagar</span>
                                        <span className="text-4xl font-bold text-gray-900 tracking-tight">
                                            ${calculateTotalPrice()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-10">
                    {/* Botón izquierdo - Pagar en el club */}
                    <button
                        onClick={() => {
                            if (!isValidTimeSelection()) return;
                            const bookingWithTimes = {
                                ...bookingData,
                                startTime: timeSelection.startTime,
                                endTime: timeSelection.endTime
                            };
                            onPayInClub(extras, bookingWithTimes);
                        }}
                        disabled={!isValidTimeSelection()}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 border-gray- bg-gray-50 !text-gray-700 font-bold hover:!bg-gray-50 hover:border-gray-400 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Pagar en el club
                    </button>

                    {/* Botón derecho - Pagar con Mercado Pago */}
                    {preferenceId ? (
                        <div className="w-full sm:w-auto min-w-[200px]">
                            <Wallet
                                initialization={{ preferenceId: preferenceId }}
                                customization={{ texts: { valueProp: 'smart_option' } }}
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                if (!isValidTimeSelection()) return;
                                const bookingWithTimes = {
                                    ...bookingData,
                                    startTime: timeSelection.startTime,
                                    endTime: timeSelection.endTime
                                };
                                onPayWithMercadoPago(extras, bookingWithTimes);
                            }}
                            disabled={isLoadingPreference || !isValidTimeSelection()}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl !bg-[#009ee3] text-white font-bold hover:!bg-[#008ed0] shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoadingPreference ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                'Pagar con Mercado Pago'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmationModal;