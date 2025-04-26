/* eslint-disable no-undef, no-console */
// scripts/testLogin.js
require('dotenv').config();
const { AuthService } = require('../src/services/auth/AuthService');

(async () => {
  try {
    // Credenciales de demostración
    const credentials = { email: 'demo@usuario.com', password: 'demo12345' };
    // Ejecutar login
    const response = await AuthService.getInstance().login(credentials);
    console.log('✅ Login exitoso:', response);
  } catch (err) {
    console.error('❌ Error de login:', err);
  }
})(); 