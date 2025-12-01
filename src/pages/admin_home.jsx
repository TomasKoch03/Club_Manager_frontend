import { FaRegUserCircle } from 'react-icons/fa';
import { IoBasketball, IoCalendarOutline, IoFootball, IoStatsChartOutline, IoTennisball } from 'react-icons/io5';
import { MdSportsTennis, MdInventory2 } from 'react-icons/md';
import HomeActionButton from '../components/home/HomeActionButton';

const AdminHome = () => {
    return (
        <div className="h-full w-full flex items-center justify-center" style={{ padding: 'clamp(1rem, 2.5vw, 2rem)' }}>
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-12" style={{ gap: 'clamp(1rem, 1.5vw, 1.5rem)', maxWidth: 'min(95vw, 1400px)' }}>

                {/* Columna Izquierda - Reservar (2/3) */}
                <div className="md:col-span-8 flex flex-col gap-4 h-full">
                    {/* Fútbol - Takes 1/2 of available height */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoFootball}
                            text="Fútbol"
                            href="/admin/reservar/futbol/selectUser"
                            variant="football"
                        />
                    </div>
                    {/* Container for Paddle & Básquet - Takes other 1/2 */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Paddle */}
                        <div className="h-full">
                            <HomeActionButton
                                icon={IoTennisball}
                                text="Paddle"
                                href="/admin/reservar/paddle/selectUser"
                                variant="paddle"
                            />
                        </div>
                        {/* Básquet */}
                        <div className="h-full">
                            <HomeActionButton
                                icon={IoBasketball}
                                text="Básquet"
                                href="/admin/reservar/basquet/selectUser"
                                variant="basketball"
                            />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha - Gestión (1/3) */}
                <div className="md:col-span-4 flex flex-col gap-4 h-full">
                    {/* Todas las reservas - Takes half of right column */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoCalendarOutline}
                            text="Todas las Reservas"
                            href="/admin/reservas"
                            variant="default"
                        />
                    </div>

                    {/* Container for Usuarios, Canchas & Equipamientos - Takes other half */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Usuarios */}
                        <div className="h-full">
                            <HomeActionButton
                                icon={FaRegUserCircle}
                                text="Gestionar Usuarios"
                                href="/admin/usuarios"
                                variant="default"
                            />
                        </div>

                        {/* Canchas */}
                        <div className="h-full">
                            <HomeActionButton
                                icon={MdSportsTennis}
                                text="Gestionar Canchas"
                                href="/admin/canchas"
                                variant="default"
                            />
                        </div>

                        {/* Equipamientos */}
                        <div className="h-full">
                            <HomeActionButton
                                icon={MdInventory2}
                                text="Gestionar Equipamientos"
                                href="/admin/equipamientos"
                                variant="default"
                            />
                        </div>
                    </div>

                    {/* Estadísticas - Smaller at bottom */}
                    <div className="flex-[0.6]">
                        <HomeActionButton
                            icon={IoStatsChartOutline}
                            text="Estadísticas"
                            href="/admin/estadisticas"
                            variant="dark"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminHome;