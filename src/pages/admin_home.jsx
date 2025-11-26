import { FaRegUserCircle } from 'react-icons/fa';
import { IoBasketball, IoCalendarOutline, IoFootball, IoStatsChartOutline, IoTennisball } from 'react-icons/io5';
import { MdSportsTennis } from 'react-icons/md';
import HomeActionButton from '../components/home/HomeActionButton';

const AdminHome = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 pb-20">
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda - Reservar (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoFootball}
                            text="Fútbol"
                            href="/admin/reservar/futbol/selectUser"
                            variant="football"
                        />
                    </div>
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoTennisball}
                            text="Paddle"
                            href="/admin/reservar/paddle/selectUser"
                            variant="paddle"
                        />
                    </div>
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoBasketball}
                            text="Básquet"
                            href="/admin/reservar/basquet/selectUser"
                            variant="basketball"
                        />
                    </div>
                </div>

                {/* Columna Derecha - Gestión (1/3) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Todas las reservas */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoCalendarOutline}
                            text="Todas las Reservas"
                            href="/admin/reservas"
                            variant="default"
                        />
                    </div>

                    {/* Usuarios */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={FaRegUserCircle}
                            text="Gestionar Usuarios"
                            href="/admin/usuarios"
                            variant="default"
                        />
                    </div>

                    {/* Canchas */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={MdSportsTennis}
                            text="Gestionar Canchas"
                            href="/admin/canchas"
                            variant="default"
                        />
                    </div>

                    {/* Estadísticas */}
                    <div className="flex-1">
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