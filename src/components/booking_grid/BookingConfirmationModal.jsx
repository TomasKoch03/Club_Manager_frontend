import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState } from 'react';
import { IoCalendarOutline, IoClose, IoLocationOutline, IoLockClosed, IoTimeOutline } from 'react-icons/io5';
import { getEquipment } from '../../services/api';

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
    isLoadingPreference,
    isUserBlocked = false
}) => {
    const [light, setLight] = useState(false);
    const [equipmentItems, setEquipmentItems] = useState([]);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);

    const [timeSelection, setTimeSelection] = useState({
        startTime: '',
        endTime: ''
    });

    const [isLoadingClubPayment, setIsLoadingClubPayment] = useState(false);

    // Cargar equipamientos disponibles
    useEffect(() => {
        const fetchEquipment = async () => {
            if (!bookingData?.court?.sport) return;
            
            try {
                setLoadingEquipment(true);
                const equipment = await getEquipment(bookingData.court.sport);
                setAvailableEquipment(equipment);
            } catch (error) {
                console.error('Error al cargar equipamientos:', error);
            } finally {
                setLoadingEquipment(false);
            }
        };

        if (show && bookingData) {
            fetchEquipment();
        }
    }, [show, bookingData]);

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

            // Si hay equipamiento inicial (reserva existente), establecerlo
            if (bookingData.initialEquipment) {
                setEquipmentItems(bookingData.initialEquipment);
            }
            
            // Si hay luz inicial
            if (bookingData.initialLight !== undefined) {
                setLight(bookingData.initialLight);
            }
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

    // Calcular precio total incluyendo luz, equipamientos y duración
    const calculateTotalPrice = () => {
        const duration = calculateDuration();
        let total = court?.base_price * duration || 0;
        
        // Agregar precio de luz si está activada
        if (light && court?.light_price) {
            total += court.light_price;
        }
        
        // Agregar precio de equipamientos
        equipmentItems.forEach(item => {
            const equipment = availableEquipment.find(e => e.id === item.id);
            if (equipment) {
                total += equipment.price_per_unit * item.quantity;
            }
        });
        
        return total.toFixed(2);
    };

    const handleEquipmentChange = (equipmentId, quantity) => {
        setEquipmentItems(prev => {
            const existing = prev.find(item => item.id === equipmentId);
            
            if (quantity === 0) {
                // Remover si la cantidad es 0
                return prev.filter(item => item.id !== equipmentId);
            } else if (existing) {
                // Actualizar cantidad existente
                return prev.map(item =>
                    item.id === equipmentId ? { ...item, quantity } : item
                );
            } else {
                // Agregar nuevo item
                return [...prev, { id: equipmentId, quantity }];
            }
        });
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

        // Verificar que la hora de fin sea posterior a la de inicio
        if (endTotalMinutes <= startTotalMinutes) return false;

        // Verificar que el horario de inicio no sea pasado
        if (bookingData?.date) {
            const now = new Date();
            const selectedDateTime = new Date(bookingData.date);
            selectedDateTime.setHours(startHours, startMinutes, 0, 0);

            if (selectedDateTime < now) return false;
        }

        return true;
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
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
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Configuración (2/3 del espacio) */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Cartel de usuario bloqueado */}
                            {isUserBlocked && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <IoLockClosed size={20} className="text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-900 mb-1">No se puede reservar</h4>
                                        <p className="text-sm text-red-700">
                                            Tu cuenta está bloqueada y no puedes realizar reservas en este momento.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Detalles Compactos en Grid Horizontal */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Cancha */}
                                <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                    <IoLocationOutline size={20} className="text-blue-600 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-gray-500 block">Cancha</span>
                                        <p className="text-sm font-bold text-gray-900 truncate">{courtName}</p>
                                    </div>
                                </div>

                                {/* Fecha */}
                                <div className="flex items-center gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                                    <IoCalendarOutline size={20} className="text-purple-600 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-gray-500 block">Fecha</span>
                                        <p className="text-sm font-bold text-gray-900  ">{formatDate(date)}</p>
                                    </div>
                                </div>

                                {/* Duración */}
                                <div className="flex items-center gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                    <IoTimeOutline size={20} className="text-orange-600 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-gray-500 block">Duración</span>
                                        <p className="text-sm font-bold text-gray-900">
                                            {isValidTimeSelection() ? `${calculateDuration().toFixed(2)}h` : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Horario */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <span className="text-sm font-semibold text-gray-900 block mb-3">Horario de reserva</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Inicio</label>
                                        <input
                                            type="time"
                                            value={timeSelection.startTime}
                                            onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                            disabled={bookingData.isExistingReservation}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-900 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Fin</label>
                                        <input
                                            type="time"
                                            value={timeSelection.endTime}
                                            onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                            disabled={bookingData.isExistingReservation}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-900 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                {!isValidTimeSelection() && timeSelection.startTime && timeSelection.endTime && (
                                    <p className="text-xs text-red-500 mt-2 font-medium">
                                        La hora de fin debe ser posterior a la de inicio
                                    </p>
                                )}
                            </div>

                            {/* Luz */}
                            {court?.light_price > 0 && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <label className={`flex items-start gap-3 ${!bookingData.isExistingReservation ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                                        <input
                                            type="checkbox"
                                            checked={light}
                                            onChange={(e) => setLight(e.target.checked)}
                                            disabled={bookingData.isExistingReservation}
                                            className="appearance-none w-5 h-5 mt-0.5 rounded border-2 border-gray-300 bg-gray-200 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all shrink-0 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundImage: light ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                                                backgroundSize: '100% 100%',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat'
                                            }}
                                        />
                                        <span className="text-sm font-medium text-gray-700">Luz artificial (+${court.light_price})</span>
                                    </label>
                                </div>
                            )}

                            {/* Equipamientos */}
                            {loadingEquipment ? (
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-500">Cargando equipamientos...</p>
                                </div>
                            ) : availableEquipment.length > 0 ? (
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <h6 className="text-sm font-semibold text-gray-900 mb-3">Equipamientos disponibles</h6>
                                    <div className="space-y-3">
                                        {availableEquipment.map(equipment => {
                                            const currentQuantity = equipmentItems.find(item => item.id === equipment.id)?.quantity || 0;
                                            return (
                                                <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{equipment.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            ${equipment.price_per_unit} por unidad
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEquipmentChange(equipment.id, Math.max(0, currentQuantity - 1))}
                                                            disabled={currentQuantity === 0 || bookingData.isExistingReservation}
                                                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                                            {currentQuantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEquipmentChange(equipment.id, Math.min(equipment.stock, currentQuantity + 1))}
                                                            disabled={currentQuantity >= equipment.stock || bookingData.isExistingReservation}
                                                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Right Column - Resumen Financiero (1/3 del espacio) */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 sticky top-6">
                                <h6 className="text-sm font-semibold text-gray-900 mb-4">Resumen</h6>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Precio base/hora</span>
                                        <span className="text-gray-900 font-semibold">${court?.base_price || 0}</span>
                                    </div>

                                    {isValidTimeSelection() && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Subtotal cancha</span>
                                            <span className="text-gray-900 font-semibold">
                                                ${((court?.base_price || 0) * calculateDuration()).toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {(light || equipmentItems.length > 0) && (
                                        <div className="pt-3 border-t border-gray-300 space-y-2">
                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Extras</span>
                                            {light && court?.light_price > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Luz</span>
                                                    <span className="text-gray-900 font-medium">${court.light_price}</span>
                                                </div>
                                            )}
                                            {equipmentItems.map(item => {
                                                const equipment = availableEquipment.find(e => e.id === item.id);
                                                if (!equipment) return null;
                                                return (
                                                    <div key={item.id} className="flex justify-between text-xs">
                                                        <span className="text-gray-600">{equipment.name} ({item.quantity})</span>
                                                        <span className="text-gray-900 font-medium">
                                                            ${(equipment.price_per_unit * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-300 mt-3">
                                        <span className="text-gray-600 text-xs block mb-1">Total a pagar</span>
                                        <span className="text-3xl font-bold text-gray-900 tracking-tight">
                                            ${calculateTotalPrice()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3 sticky bottom-0 z-10">
                    {/* Botón izquierdo - Pagar en el club */}
                    <button
                        onClick={async () => {
                            if (!isValidTimeSelection()) return;
                            setIsLoadingClubPayment(true);
                            const bookingWithTimes = {
                                ...bookingData,
                                startTime: timeSelection.startTime,
                                endTime: timeSelection.endTime
                            };
                            await onPayInClub({ light, equipment_items: equipmentItems, totalAmount: parseFloat(calculateTotalPrice()) }, bookingWithTimes);
                            setIsLoadingClubPayment(false);
                        }}
                        disabled={!isValidTimeSelection() || isLoadingClubPayment || isUserBlocked}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-gray-300 bg-white !text-gray-700 font-bold hover:!bg-gray-50 hover:border-gray-400 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
                    >
                        {isLoadingClubPayment ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            'Pagar en el club'
                        )}
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
                                onPayWithMercadoPago({ light, equipment_items: equipmentItems, totalAmount: parseFloat(calculateTotalPrice()) }, bookingWithTimes);
                            }}
                            disabled={isLoadingPreference || !isValidTimeSelection() || isUserBlocked}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl !bg-[#009ee3] text-white font-bold hover:!bg-[#008ed0] shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            {isLoadingPreference ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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