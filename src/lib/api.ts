import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(
      new Error(error.message || 'Error en la respuesta de la API')
    );
  }
);
