/**
 * Servicio de autenticación para el EMR propio
 *
 * Este servicio maneja la autenticación de usuarios, incluyendo:
 * - Inicio y cierre de sesión
 * - Gestión de usuarios
 * - Manejo de sesiones
 *
 * Para simplificar, usamos localStorage para persistir los datos de sesión
 * En un entorno de producción se utilizarían JWT u otras técnicas más seguras
 */

import { databaseService } from './database/databaseService';
import { DbUser } from './database/schema';

// Clave para almacenar la sesión en localStorage
const SESSION_STORAGE_KEY = 'own_emr_session';

// Mock de una función para verificar contraseñas hasheadas
// En producción se usaría bcrypt u otra biblioteca de hashing
const mockVerifyPassword = (
  plainPassword: string,
  hashedPassword: string
): boolean => {
  // En un entorno real, verificaríamos el hash correctamente
  // Esta es una simulación básica para desarrollo
  if (
    plainPassword === 'admin123' &&
    hashedPassword.includes('1234567890abcdefghijk')
  ) {
    return true;
  }
  if (
    plainPassword === 'doctor123' &&
    (hashedPassword.includes('abcdefghijk1234567890') ||
      hashedPassword.includes('uvwxyz1234567890abcde'))
  ) {
    return true;
  }
  return false;
};

// Tipos para el servicio de autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: 'admin' | 'provider' | 'staff';
  providerId?: string;
  expiresAt: number; // Timestamp en milisegundos
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'provider' | 'staff';
  providerId?: string;
  active: boolean;
  lastLogin?: string;
}

/**
 * Clase de servicio para manejo de autenticación
 */
export class AuthService {
  private static instance: AuthService;
  private currentSession: AuthSession | null = null;

  private constructor() {
    // Constructor privado para patrón singleton
    this.loadSession();
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Carga la sesión desde localStorage si existe
   */
  private loadSession(): void {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData) as AuthSession;
        // Verificamos si la sesión ha expirado
        if (session.expiresAt > Date.now()) {
          this.currentSession = session;
        } else {
          // Si expiró, la eliminamos
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (err) {
        console.error('Error al cargar sesión:', err);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }

  /**
   * Guarda la sesión en localStorage
   */
  private saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.currentSession = session;
  }

  /**
   * Iniciar sesión con credenciales
   */
  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const { username, password } = credentials;

      // Buscamos el usuario por nombre de usuario
      const users = await databaseService.findBy('users', { username });

      if (users.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const user = users[0];

      // Verificamos si la cuenta está activa
      if (!user.active) {
        throw new Error('La cuenta está desactivada');
      }

      // Verificamos la contraseña
      if (!mockVerifyPassword(password, user.passwordHash)) {
        throw new Error('Credenciales inválidas');
      }

      // Creamos la sesión (24 horas de duración)
      const session: AuthSession = {
        userId: user.id,
        username: user.username,
        role: user.role,
        providerId: user.providerId,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
      };

      // Actualizamos el último login
      await databaseService.update('users', user.id, {
        lastLogin: new Date().toISOString(),
      });

      // Guardamos la sesión
      this.saveSession(session);

      return session;
    } catch (err) {
      console.error('Error en inicio de sesión:', err);
      throw err;
    }
  }

  /**
   * Cierra la sesión actual
   */
  public logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentSession = null;
  }

  /**
   * Verifica si hay una sesión activa
   */
  public isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Obtiene la sesión actual
   */
  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  public hasRole(role: 'admin' | 'provider' | 'staff'): boolean {
    return this.currentSession?.role === role;
  }

  /**
   * Obtiene información del usuario actual
   */
  public async getCurrentUser(): Promise<UserInfo | null> {
    if (!this.currentSession) {
      return null;
    }

    try {
      const user = await databaseService.getById('users', this.currentSession.userId);

      if (!user) {
        this.logout(); // Si no se encuentra el usuario, cerramos sesión
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        providerId: user.providerId,
        active: user.active,
        lastLogin: user.lastLogin,
      };
    } catch (err) {
      console.error('Error al obtener usuario actual:', err);
      return null;
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  public async getAllUsers(): Promise<UserInfo[]> {
    if (!this.hasRole('admin')) {
      throw new Error('No autorizado');
    }

    try {
      const users = await databaseService.getAll('users');

      return users.map((item) => ({
        id: item.id,
        username: item.username,
        email: item.email,
        role: item.role,
        providerId: item.providerId,
        active: item.active,
        lastLogin: item.lastLogin,
      }));
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      throw new Error('No se pudieron obtener los usuarios');
    }
  }

  /**
   * Crea un nuevo usuario
   */
  public async createUser(
    userData: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserInfo> {
    if (!this.hasRole('admin')) {
      throw new Error('No autorizado');
    }

    try {
      // En un sistema real, aquí se hashearía la contraseña
      const newUser = await databaseService.create('users', userData);

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        providerId: newUser.providerId,
        active: newUser.active,
        lastLogin: newUser.lastLogin,
      };
    } catch (err) {
      console.error('Error al crear usuario:', err);
      throw new Error('No se pudo crear el usuario');
    }
  }

  /**
   * Actualiza un usuario existente
   */
  public async updateUser(
    userId: string,
    userData: Partial<Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserInfo | null> {
    if (!this.hasRole('admin')) {
      throw new Error('No autorizado');
    }

    try {
      const updatedUser = await databaseService.update(
        'users',
        userId,
        userData
      );

      if (!updatedUser) {
        return null;
      }

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        providerId: updatedUser.providerId,
        active: updatedUser.active,
        lastLogin: updatedUser.lastLogin,
      };
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      throw new Error(`No se pudo actualizar el usuario con ID ${userId}`);
    }
  }
}

// Exportamos una instancia única
export const authService = AuthService.getInstance();
