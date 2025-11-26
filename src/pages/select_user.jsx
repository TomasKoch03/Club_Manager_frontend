import React, { useState, useEffect } from 'react';
import UserCard from '../components/users/UserCard';
import { getAllUsers } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const SelectUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Seleccionar Usuario</h1>
                            <p className="text-sm text-gray-500">Selecciona un usuario para realizar una reserva</p>
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
                        {users.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    No hay usuarios registrados
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {users.map((user) => (
                                    <UserCard
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

export default SelectUser;