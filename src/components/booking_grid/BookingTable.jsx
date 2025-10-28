import { Button } from 'react-bootstrap';

const BookingTable = ({ courts, timeSlots, isSlotOccupied, onSlotClick }) => {
    return (
        <div
            className="booking-table-container"
            style={{
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 300px)',
                border: '1px solid #dee2e6',
                borderRadius: '8px'
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
                `}
            </style>
            <table className="table table-bordered mb-0" style={{ minWidth: '800px' }}>
                <thead style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', // <CHANGE> Agregada transparencia
                    backdropFilter: 'blur(10px)' // <CHANGE> Agregado efecto blur
                }}>
                <tr>
                    <th style={{
                        width: '100px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', // <CHANGE> Agregada transparencia
                        backdropFilter: 'blur(10px)', // <CHANGE> Agregado efecto blur
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
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', // <CHANGE> Agregada transparencia
                                backdropFilter: 'blur(10px)', // <CHANGE> Agregado efecto blur
                                color: '#000'
                            }}
                        >
                            {court.name}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {timeSlots.map(slot => (
                    <tr key={slot.hour}>
                        <td
                            className="text-center align-middle"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', // <CHANGE> Agregada transparencia
                                backdropFilter: 'blur(10px)', // <CHANGE> Agregado efecto blur
                                color: '#000',
                                fontWeight: '500',
                                position: 'sticky',
                                left: 0,
                                zIndex: 5
                            }}
                        >
                            {slot.label}
                        </td>
                        {courts.map(court => {
                            const occupied = isSlotOccupied(court.id, slot.hour);
                            return (
                                <td key={court.id} className="p-2">
                                    <Button
                                        variant={occupied ? 'secondary' : 'outline-dark'}
                                        disabled={occupied}
                                        onClick={() => onSlotClick(court.id, slot.hour)}
                                        className="w-100"
                                        style={{
                                            minHeight: '50px',
                                            ...(occupied && {
                                                backgroundColor: '#e9ecef',
                                                color: '#6c757d',
                                                borderColor: '#e9ecef',
                                                cursor: 'not-allowed'
                                            }),
                                            ...(!occupied && {
                                                cursor: 'pointer'
                                            })
                                        }}
                                    >
                                        {occupied ? 'Ocupado' : 'Disponible'}
                                    </Button>
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
