import { ApiClient } from '../api/ApiClient';;;;;
import { AuthResponse, LoginCredentials, RegisterData, User } from './types';;;;;
import { jwtDecode } from 'jwt-decode';;;;;

export class AuthService {
  private static instance: AuthService;
  private apiClient: ApiClient;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private constructor() {
    this.apiClient = new ApiClient();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/auth/login', credentials);
      this.saveAuthData(response);
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/auth/register', data);
      this.saveAuthData(response);
      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  public async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/auth/refresh-token', {});
      this.saveAuthData(response);
      return response;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Solicita un restablecimiento de contraseña enviando un correo con un token
   * @param email El correo electrónico del usuario
   */
  public async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.apiClient.post('/auth/password-reset-request', { email });
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  }

  /**
   * Verifica el token de restablecimiento de contraseña
   * @param token El token enviado por correo
   */
  public async verifyResetToken(token: string): Promise<boolean> {
    try {
      const response = await this.apiClient.post<{ valid: boolean }>('/auth/verify-reset-token', { token });
      return response.valid;
    } catch (error) {
      console.error('Error al verificar token de restablecimiento:', error);
      return false;
    }
  }

  /**
   * Restablece la contraseña del usuario
   * @param token El token de restablecimiento
   * @param newPassword La nueva contraseña
   */
  public async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      await this.apiClient.post('/auth/reset-password', { token, newPassword });
      return true;
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw error;
    }
  }

  /**
   * Actualiza la contraseña del usuario (cuando está autenticado)
   * @param oldPassword Contraseña actual
   * @param newPassword Nueva contraseña
   */
  public async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      await this.apiClient.post('/auth/change-password', { 
        oldPassword, 
        newPassword 
      });
      return true;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch {
      return false;
    }
  }

  public getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private saveAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Valida la sesión actual haciendo una solicitud al servidor
   * @returns True si la sesión es válida
   */
  public async validateSession(): Promise<boolean> {
    try {
      await this.apiClient.get('/auth/validate');
      return true;
    } catch (error) {
      console.error('Error al validar sesión:', error);
      this.clearAuthData();
      throw error;
    }
  }
} 