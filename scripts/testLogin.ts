import 'dotenv/config';
import { AuthService } from '../src/services/auth/AuthService';

(async () => {
  try {
    // Credenciales de demo
    const credentials = { email: 'demo@usuario.com', password: 'demo12345' };
    // Lanza el login
    const response = await AuthService
      .getInstance()
      .login(credentials);
    console.log('✅ Login exitoso:', response);
  } catch (err) {
    console.error('❌ Error de login:', err);
  }
})();