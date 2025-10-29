const API_BASE_URL = 'http://localhost:8001';

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
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Función especial para login (sin token)
export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
        const errorText = await response.text().catch(() => null);
        throw new Error(errorText || 'Register failed');
    }

    return await response.json();
};

// Función para logout
export const logout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
};

// Funciones específicas
export const getUserData = () => apiRequest('/api/user');
export const getCourts = async (sport) => {
    const endpoint = `/court/?sport=${encodeURIComponent(sport)}`;
    return apiRequest(endpoint);
};

export const getReservationsBySportAndDay = async (sport, day) => {
    const endpoint = `/reservation/?sport=${encodeURIComponent(sport)}&day=${encodeURIComponent(day)}`;
    return apiRequest(endpoint, { method: 'GET' });
};
