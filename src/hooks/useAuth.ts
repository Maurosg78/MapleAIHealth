import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth/AuthService';
import { AuthState, LoginCredentials, RegisterData, User } from '../services/auth/types';

export const useAuth = () => {
  const authService = AuthService.getInstance();
  
  const [state, setState] = useState<AuthState>({
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // Verificar autenticación al montar el componente
    const initAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        // Verificar si el token es válido
        if (state.token) {
          if (!state.isAuthenticated) {
            // Si el token existe pero no es válido (expirado), intentar refrescar
            await authService.refreshToken();
          } else {
            // Validar el token haciendo una solicitud al servidor
            try {
              // Realizar una solicitud simple para verificar la validez del token
              await authService.validateSession();
            } catch (error) {
              // Si hay un error, el token no es válido o la sesión ha expirado
              console.error('Sesión inválida:', error);
              await authService.logout();
              setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'Sesión expirada, por favor inicie sesión nuevamente'
              });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.login(credentials);
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión'
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.register(data);
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al registrarse'
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.logout();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión'
      }));
      throw error;
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser
  };
}; 