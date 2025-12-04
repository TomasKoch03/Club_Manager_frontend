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
        <div className="h-full w-full flex items-center justify-center" style={{ padding: 'clamp(0.5rem, 1.5vh, 1.5rem)' }}>
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-12" style={{ gap: 'clamp(0.5rem, 1.5vh, 1rem)', maxWidth: 'min(98vw, 1400px)' }}>

                {/* Columna Izquierda - Area de Canchas (2/3) */}
                <div className="md:col-span-8 flex flex-col h-full" style={{ gap: 'clamp(0.5rem, 1.5vh, 1rem)' }}>
                    {/* Fútbol - Takes 1/2 of available height */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoFootball}
                            text="Fútbol"
                            href="/club-manager/reservar/futbol/calendario"
                            variant="football"
                        />
                    </div>
                    {/* Container for Paddle & Básquet - Takes other 1/2 */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2" style={{ gap: 'clamp(0.5rem, 1.5vh, 1rem)' }}>
                        {/* Paddle */}
                        <div className="h-full">
                            <HomeActionButton
                                icon={IoTennisball}
                                text="Paddle"
                                href="/club-manager/reservar/paddle/calendario"
                                variant="paddle"
                            />
                        </div>
                        {/* Básquet */}
                        <div className="h-full">
                            <HomeActionButton
                                icon={IoBasketball}
                                text="Básquet"
                                href="/club-manager/reservar/basquet/calendario"
                                variant="basketball"
                            />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha - Area de Gestión (1/3) */}
                <div className="md:col-span-4 flex flex-col h-full" style={{ gap: 'clamp(0.5rem, 1.5vh, 1rem)' }}>
                    {/* Mis Reservas - Same height as Estado del Socio */}
                    <div className="flex-1">
                        <HomeActionButton
                            icon={IoCalendarOutline}
                            text="Mis Reservas"
                            href="/club-manager/mis-reservas"
                            variant="dark"
                        />
                    </div>
                    {/* Estado del Socio - Same height as Mis Reservas */}
                    <div className="flex-1">
                        <div className={`
                            relative flex flex-col items-center justify-center w-full h-full
                            rounded-2xl shadow-lg transition-all duration-300
                            ${loading ? 'bg-gray-100 border-4 border-gray-200' :
                                userStatus
                                    ? 'bg-green-50 border-4 border-green-500'
                                    : 'bg-red-50 border-4 border-red-500'}
                        `} style={{ padding: 'clamp(1rem, 2vh, 1.5rem)' }}>
                            {loading ? (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="bg-gray-200 rounded-full" style={{ width: 'clamp(2.5rem, 8vw, 4rem)', height: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: 'clamp(0.75rem, 2vh, 1rem)' }}></div>
                                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                                </div>
                            ) : (
                                <>
                                    {userStatus ? (
                                        <IoCheckmarkCircleOutline className="text-green-600" style={{ width: 'clamp(2.5rem, 8vw, 4rem)', height: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: 'clamp(0.75rem, 2vh, 1rem)' }} />
                                    ) : (
                                        <IoCloseCircleOutline className="text-red-600" style={{ width: 'clamp(2.5rem, 8vw, 4rem)', height: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: 'clamp(0.75rem, 2vh, 1rem)' }} />
                                    )}
                                    <span className={`font-semibold text-center ${userStatus ? 'text-green-700' : 'text-red-700'}`} style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.125rem)' }}>
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