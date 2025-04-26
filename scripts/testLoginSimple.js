/* eslint-disable no-undef, no-console */
// scripts/testLoginSimple.js
require('dotenv').config();

(async () => {
  try {
    // Base URL de la API (remota o local si exportas env)
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
    // Credenciales de demo
    const credentials = { email: 'demo@usuario.com', password: 'demo12345' };

    // Llamada POST a /auth/login
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    // Mostrar status y body JSON
    console.log('HTTP status:', response.status);
    const data = await response.json();
    console.log('Respuesta:', data);
  } catch (err) {
    console.error('Error en la petición de login:', err);
  }
})(); 