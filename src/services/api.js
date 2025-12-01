import { buildRoute } from '../utils/routes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('accessToken');
            window.location.href = buildRoute('/');
        }

        // Crear un error con el código de estado para mejor manejo
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status; // Agregar código de estado al error

        // Intentar obtener el mensaje del backend si existe
        try {
            const errorData = await response.json();
            error.detail = errorData.detail || errorData.message;
        } catch {
            // Si no hay JSON, usar mensaje genérico
        }

        throw error;
    }

    // Si el status es 204 (No Content), no hay body para parsear
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

// Función especial para login (sin token)
export const login = async (email, password) => {
    console.log(`${API_BASE_URL}/user/login`);
    const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    const token = data.access_token || data.accessToken || data.accessToken?.accessToken || null;

    // Guardar el token
    if (token) {
        localStorage.setItem('accessToken', token);
    }

    return { token, ...data };
};

// Función especial para registro (sin token)
export const register = async (email, fullName, password) => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            full_name: fullName,
            password,
        }),
    });

    if (response.status !== 201) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || 'Error al registrar usuario';
        throw new Error(errorMessage);
    }

    return await response.json();
};

// Función para logout
export const logout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = buildRoute('/');
};

// Funciones específicas
export const getUserData = () => apiRequest('/user/me');
export const getCourts = async (sport) => {
    if (sport && sport.trim() !== '') {
        const endpoint = `/court/?sport=${encodeURIComponent(sport)}`;
        return apiRequest(endpoint);
    }
    return apiRequest('/court/');
};

export const getAllCourts = async () => {
    const endpoint = `/court/`;
    return apiRequest(endpoint);
};

export const getAllUsers = async () => {
    return apiRequest('/user/');
};

export const getReservationsBySportAndDay = async (sport, day) => {
    const endpoint = `/reservation/?sport=${encodeURIComponent(sport)}&day=${encodeURIComponent(day)}`;
    return apiRequest(endpoint, { method: 'GET' });
};

export const getAllReservationsFiltered = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.sport && filters.sport !== "todos")
        params.append("sport", filters.sport);
    if (filters.status && filters.status !== "todos")
        params.append("status", filters.status);
    if (filters.start_date)
        params.append("start_date", filters.start_date);
    if (filters.end_date)
        params.append("end_date", filters.end_date);
    if (filters.courtId)
        params.append("court_id", filters.courtId);
    if (filters.time_start)
        params.append("time_start", filters.time_start);
    if (filters.time_end)
        params.append("time_end", filters.time_end);

    const endpoint = `/reservation/?${params.toString()}`;
    return apiRequest(endpoint, { method: 'GET' });
};

export const getPaidReservationsByRange = async (startDate, endDate) => {
    const endpoint = `/reservation/admin/paid-reservations?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
    return apiRequest(endpoint, { method: 'GET' });
};

export const postReservation = async (data) => {
    return apiRequest('/reservation/create', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const getMyReservations = async () => {
    return apiRequest('/reservation/me', {
        method: 'GET',
    });
};

export const getAllReservations = async () => {
    return apiRequest('/reservation/', {
        method: 'GET',
    });
};

export const postPayment = async (data) => {
    return apiRequest('/payment/create', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const patchPayment = async (paymentId, data) => {
    const endpoint = `/payment/${paymentId}`;
    return apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const postReservationForUser = async (userId, data) => {
    const endpoint = `/reservation/create_for_user/${userId}`;
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const modifyUser = async (data) => {
    return apiRequest('/user/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};


export const createMercadoPagoPreference = async (reservationId) => {
    return apiRequest('/mercadopago/create-preference', {
        method: 'POST',
        body: JSON.stringify({ reservation_id: reservationId }),
    });
};

export const getUserById = async (userId) => {
    return apiRequest(`/user/${userId}`, {
        method: 'GET',
    });
};

export const updateUserById = async (userId, data) => {
    return apiRequest(`/user/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const blockUser = async (userId) => {
    return apiRequest(`/user/${userId}/block`, {
        method: 'PATCH',
    });
};

export const unblockUser = async (userId) => {
    return apiRequest(`/user/${userId}/unblock`, {
        method: 'PATCH',
    });
};

export const getReservationById = async (reservationId) => {
    return apiRequest(`/reservation/${reservationId}`, {
        method: 'GET',
    });
};

export const updateReservation = async (reservationId, data) => {
    return apiRequest(`/reservation/${reservationId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const updateOwnReservation = async (reservationId, data) => {
    return apiRequest(`/reservation/me/${reservationId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const updateCourt = async (courtId, data) => {
    return apiRequest(`/court/${courtId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const createCourt = async (data) => {
    return apiRequest('/court/create', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const deleteCourt = async (courtId) => {
    return apiRequest(`/court/${courtId}`, {
        method: 'DELETE',
    });
};

export const cancelReservationByUser = async (reservationId) => {
    return apiRequest(`/reservation/${reservationId}/cancel`, {
        method: 'DELETE',
    });
};

export const cancelReservationByAdmin = async (reservationId) => {
    return apiRequest(`/reservation/admin/${reservationId}/cancel`, {
        method: 'DELETE',
    });
};

// Equipment endpoints
export const getEquipment = async (sport = null, name = null) => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (name) params.append('name', name);
    const queryString = params.toString();
    const endpoint = queryString ? `/equipment/?${queryString}` : '/equipment/';
    return apiRequest(endpoint, { method: 'GET' });
};

export const createEquipment = async (data) => {
    return apiRequest('/equipment/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateEquipment = async (equipmentId, data) => {
    return apiRequest(`/equipment/${equipmentId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

// Profile image functions
export const uploadProfileImage = async (userId, imageFile) => {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile-image`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
    });

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/';
        }
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        try {
            const errorData = await response.json();
            error.detail = errorData.detail || errorData.message;
        } catch {
            // Si no hay JSON, usar mensaje genérico
        }
        throw error;
    }

    return response.json();
};

export const getProfileImageUrl = (userId) => {
    return `${API_BASE_URL}/user/${userId}/profile-image`;
};

export const checkProfileImageExists = async (userId) => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/user/${userId}/profile-image`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const deleteProfileImage = async (userId) => {
    return apiRequest(`/user/${userId}/profile-image`, {
        method: 'DELETE',
    });
};