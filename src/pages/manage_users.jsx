import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import UserManagementCard from '../components/users/UserManagementCard';
import { getAllUsers } from '../services/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers();
                // Ordenar por fecha de creación (más reciente primero)
                const sortedData = data.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setUsers(sortedData);
                setError(null);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
                setError('No se pudieron cargar los usuarios. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filtrar usuarios por búsqueda
    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "16px 32px 60px 32px"
        }}>
            <style>
                {`
                    .users-container::-webkit-scrollbar {
                        width: 10px;
                    }
                    .users-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .users-container::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .users-container::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                `}
            </style>
            <div className="max-w-6xl mx-auto pb-20 users-container">
                {/* HEADER - Toolbar Horizontal */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Título */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Usuarios</h1>
                            <p className="text-sm text-gray-500">Administra los usuarios del sistema</p>
                        </div>

                        {/* Action Area - Buscador y botón */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Buscador */}
                            <div className="relative flex-1 md:flex-none md:w-64">
                                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar usuarios..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-white border-none shadow-sm rounded-lg text-sm text-gray-900 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando usuarios...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                        {error}
                    </div>
                )}

                {/* Lista de usuarios - BENTO STRIPS */}
                {!loading && !error && (
                    <>
                        {filteredUsers.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    {searchQuery ? 'No se encontraron usuarios que coincidan con tu búsqueda' : 'No hay usuarios registrados'}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {filteredUsers.map((user) => (
                                    <UserManagementCard
                                        key={user.id}
                                        user={user}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
