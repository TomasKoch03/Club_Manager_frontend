import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const BookingTable = ({ courts, timeSlots, isSlotOccupied, onSlotClick, bookings }) => {
    const [selection, setSelection] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // Limpiar selección cuando se presiona ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setSelection(null);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const handleMouseDown = (courtId, time) => {
        if (isSlotOccupied(courtId, time)) return;
        setIsSelecting(true);
        setSelection({
            courtId,
            startTime: time,
            endTime: time
        });
    };

    const handleMouseEnter = (courtId, time) => {
        if (!isSelecting || !selection) return;
        if (courtId !== selection.courtId) return;
        
        // Verificar que no haya slots ocupados en el rango
        const minTime = Math.min(selection.startTime, time);
        const maxTime = Math.max(selection.startTime, time);
        
        // Comprobar todos los slots en el rango
        const slotsInRange = timeSlots.filter(slot => 
            slot.time >= minTime && slot.time <= maxTime
        );
        
        let hasOccupied = false;
        for (const slot of slotsInRange) {
            if (isSlotOccupied(courtId, slot.time)) {
                hasOccupied = true;
                break;
            }
        }
        
        if (!hasOccupied) {
            setSelection({
                ...selection,
                endTime: time
            });
        }
    };

    const handleMouseUp = () => {
        if (selection && isSelecting) {
            const startTime = Math.min(selection.startTime, selection.endTime);
            const endTime = Math.max(selection.startTime, selection.endTime) + 0.5; // +0.5 porque cada slot es 30 min
            onSlotClick(selection.courtId, startTime, endTime);
            setSelection(null);
        }
        setIsSelecting(false);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [selection, isSelecting]);

    const isInSelection = (courtId, time) => {
        if (!selection || courtId !== selection.courtId) return false;
        const minTime = Math.min(selection.startTime, selection.endTime);
        const maxTime = Math.max(selection.startTime, selection.endTime);
        return time >= minTime && time <= maxTime;
    };

    const isStartOfSelection = (courtId, time) => {
        if (!selection || courtId !== selection.courtId) return false;
        const minTime = Math.min(selection.startTime, selection.endTime);
        return time === minTime;
    };

    const isEndOfSelection = (courtId, time) => {
        if (!selection || courtId !== selection.courtId) return false;
        const maxTime = Math.max(selection.startTime, selection.endTime);
        return time === maxTime;
    };

    // Obtener las reservas que ocupan un slot específico
    const getReservationsInSlot = (courtId, time) => {
        return bookings.filter(booking => {
            if (booking.court.id !== courtId) return false;
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);
            
            const hour = Math.floor(time);
            const minute = Math.round((time - hour) * 60);
            
            const slotStart = new Date(bookingStart);
            slotStart.setHours(hour, minute, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);

            return (
                (slotStart >= bookingStart && slotStart < bookingEnd) ||
                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                (slotStart <= bookingStart && slotEnd >= bookingEnd)
            );
        });
    };

    // Determinar si es el inicio de un bloque de reserva
    const isStartOfReservation = (courtId, time) => {
        const reservations = getReservationsInSlot(courtId, time);
        if (reservations.length === 0) return false;
        
        const reservation = reservations[0];
        const bookingStart = new Date(reservation.start_time);
        const hour = Math.floor(time);
        const minute = Math.round((time - hour) * 60);
        
        return bookingStart.getHours() === hour && bookingStart.getMinutes() === minute;
    };

    return (
        <div
            className="booking-table-container"
            style={{
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 300px)',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                userSelect: 'none'
            }}
        >
            <style>
                {`
                    .booking-table-container::-webkit-scrollbar {
                        width: 8px;
                    }
                    .booking-table-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .booking-table-container::-webkit-scrollbar-thumb {
                        background-color: #000;
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .booking-table-container::-webkit-scrollbar-thumb:hover {
                        background-color: #333;
                    }
                    .time-slot {
                        min-height: 35px;
                        cursor: pointer;
                        transition: background-color 0.15s ease;
                        border: none;
                        padding: 4px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        font-size: 0.75rem;
                        position: relative;
                    }
                    .time-slot.available:hover {
                        background-color: rgba(0, 0, 0, 0.05);
                    }
                    .time-slot.occupied {
                        background-color: #dc3545;
                        color: white;
                        cursor: not-allowed;
                        font-weight: 500;
                        border-color: #dc3545;
                    }
                    .time-slot.selected {
                        background-color: #007bff !important;
                        border: 2px solid #0056b3 !important;
                        color: white;
                    }
                    .time-slot.selected.top {
                        border-top-width: 3px !important;
                    }
                    .time-slot.selected.bottom {
                        border-bottom-width: 3px !important;
                    }
                    .time-slot.available {
                        background-color: #f8f9fa;
                    }
                    .reservation-block {
                        font-size: 0.7rem;
                        font-weight: 500;
                        line-height: 1.2;
                    }
                `}
            </style>
            <table className="table table-bordered mb-0" style={{ minWidth: '800px' }}>
                <thead style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                }}>
                <tr>
                    <th style={{
                        width: '100px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        color: '#000',
                        position: 'sticky',
                        left: 0,
                        zIndex: 11
                    }}></th>
                    {courts.map(court => (
                        <th
                            key={court.id}
                            className="text-center"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                color: '#000'
                            }}
                        >
                            {court.name}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {timeSlots.map((slot, index) => (
                    <tr key={`${slot.hour}-${slot.minute}`}>
                        <td
                            className="text-center align-middle"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                color: '#000',
                                fontWeight: '500',
                                position: 'sticky',
                                left: 0,
                                zIndex: 5,
                                fontSize: '0.85rem'
                            }}
                        >
                            {slot.label}
                        </td>
                        {courts.map(court => {
                            const occupied = isSlotOccupied(court.id, slot.time);
                            const selected = isInSelection(court.id, slot.time);
                            const isTop = isStartOfSelection(court.id, slot.time);
                            const isBottom = isEndOfSelection(court.id, slot.time);
                            const reservations = getReservationsInSlot(court.id, slot.time);
                            const isReservationStart = isStartOfReservation(court.id, slot.time);
                            
                            return (
                                <td 
                                    key={court.id} 
                                    className="p-0"
                                    style={{ padding: 0 }}
                                >
                                    <div
                                        className={`time-slot ${occupied ? 'occupied' : 'available'} ${selected ? 'selected' : ''} ${isTop ? 'top' : ''} ${isBottom ? 'bottom' : ''}`}
                                        onMouseDown={() => handleMouseDown(court.id, slot.time)}
                                        onMouseEnter={() => handleMouseEnter(court.id, slot.time)}
                                    >
                                        {occupied && reservations.length > 0 && isReservationStart ? (
                                            <div className="reservation-block">
                                                <div>{reservations[0].user.full_name}</div>
                                                <div style={{ fontSize: '0.6rem', opacity: 0.9 }}>
                                                    {new Date(reservations[0].start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                    {' - '}
                                                    {new Date(reservations[0].end_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ) : occupied ? (
                                            ''
                                        ) : selected && isTop ? (
                                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                {Math.abs(selection.endTime - selection.startTime + 0.5).toFixed(1)}h
                                            </div>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookingTable;
