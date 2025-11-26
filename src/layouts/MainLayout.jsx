import { Outlet } from 'react-router-dom';
import Navbar from "../components/NavBar";
import fondo from '../assets/fondo_landing_page.jpg';

const MainLayout = () => {
    return (
        <div
            className="fixed inset-0 overflow-hidden p-0 m-0"
            style={{
                backgroundImage: `url(${fondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 filter backdrop-blur-md bg-black/30">
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <Navbar />
                {/* Main content area - flex-1 takes remaining space after navbar */}
                <main className="flex-1 overflow-y-auto md:overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
