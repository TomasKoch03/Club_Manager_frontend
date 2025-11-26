import { Outlet } from 'react-router-dom';
import Navbar from "../components/NavBar";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />
                {/* si el Navbar es fixed top-0, añade pt para compensar su altura */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
