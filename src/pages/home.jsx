import { useEffect, useState } from "react";
import { IoBasketball, IoCalendarOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFootball, IoTennisball } from 'react-icons/io5';
import HomeActionButton from '../components/home/HomeActionButton';
import { getUserData } from '../services/api';

const Home = () => {
    const [userStatus, setUserStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                const data = await getUserData();
                setUserStatus(data.is_active);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserStatus();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pb-20">
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda - Area de Canchas (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Fútbol */}
                    <HomeActionButton
                        icon={IoFootball}
                        text="Fútbol"
                        href="/club-manager/reservar/futbol/calendario"
                        variant="football"
                    />
                    {/* Paddle */}
                    <HomeActionButton
                        icon={IoTennisball}
                        text="Paddle"
                        href="/club-manager/reservar/paddle/calendario"
                        variant="paddle"
                    />
                    {/* Básquet */}
                    <HomeActionButton
                        icon={IoBasketball}
                        text="Básquet"
                        href="/club-manager/reservar/basquet/calendario"
                        variant="basketball"
                    />
                </div>

                {/* Columna Derecha - Area de Gestión (1/3) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Mis Reservas */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoCalendarOutline}
                            text="Mis Reservas"
                            href="/club-manager/mis-reservas"
                            variant="dark"
                        />
                    </div>
                    {/* Estado del Socio */}
                    <div className="flex-1">
                        <div className={`
                            relative flex flex-col items-center justify-center w-full h-full min-h-[140px] py-6 px-6
                            rounded-2xl shadow-md border transition-all duration-300
                            ${loading ? 'bg-gray-100 border-gray-200' :
                                userStatus
                                    ? 'bg-green-50 border-green-100'
                                    : 'bg-red-50 border-red-100'}
                        `}>
                            {loading ? (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
                                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                                </div>
                            ) : (
                                <>
                                    {userStatus ? (
                                        <IoCheckmarkCircleOutline className="w-16 h-16 mb-4 text-green-600" />
                                    ) : (
                                        <IoCloseCircleOutline className="w-16 h-16 mb-4 text-red-600" />
                                    )}
                                    <span className={`text-lg font-semibold text-center ${userStatus ? 'text-green-700' : 'text-red-700'}`}>
                                        {userStatus ? 'Socio Habilitado' : 'Socio Bloqueado'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;