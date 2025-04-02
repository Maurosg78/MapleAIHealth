
const api = axios.create({
import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar token expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(error.message || 'Error en la respuesta'));
  }
);

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(new Error(error.message || 'Error en la solicitud'))
);

export { api };
