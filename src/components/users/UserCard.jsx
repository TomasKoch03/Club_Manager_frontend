import React from 'react';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';

const UserCard = ({ user }) => {
    const { sport } = useParams();
    const navigate = useNavigate();

    const handleSelectUser = () => {
        navigate(`/admin/reservar/${sport}/${user.id}/calendar`);
    };

    // Obtener iniciales del nombre completo
    const getInitials = (fullName) => {
        if (!fullName) return 'U';
        const names = fullName.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between transition-all hover:shadow-md border border-gray-100 mb-3">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4 flex-1">
                {/* Avatar Circular con Iniciales */}
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-lg">
                        {getInitials(user.full_name)}
                    </span>
                </div>

                {/* Información del Usuario */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-0.5 truncate">{user.full_name}</h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
            </div>

            {/* Status Badge */}
            <div className="hidden md:flex items-center mr-4">
                {user.is_active ? (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                        <IoCheckmarkCircleOutline size={14} />
                        Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium border border-red-200">
                        <IoCloseCircleOutline size={14} />
                        Bloqueado
                    </span>
                )}
            </div>

            {/* Botón de Seleccionar */}
            <button
                onClick={handleSelectUser}
                className="h-10 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm whitespace-nowrap ml-4"
            >
                Seleccionar
            </button>
        </div>
    );
};

export default UserCard;