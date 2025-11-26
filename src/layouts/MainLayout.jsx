import { Outlet } from 'react-router-dom';
import Navbar from "../components/NavBar";

const MainLayout = () => {
    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
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
