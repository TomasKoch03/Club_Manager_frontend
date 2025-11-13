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
            window.location.href = '/';
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

    return response.json();
};

// Función especial para login (sin token)
export const login = async (email, password) => {
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
    window.location.href = '/';
};

// Funciones específicas
export const getUserData = () => apiRequest('/user/me');
export const getCourts = async (sport) => {
    const endpoint = `/court/?sport=${encodeURIComponent(sport)}`;
    return apiRequest(endpoint);
};

export const getAllUsers = async () => {
    return apiRequest('/user');
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
    return apiRequest('/reservation', {
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