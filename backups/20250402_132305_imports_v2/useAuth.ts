export const useAuth = () => {
  useEffect(() => {
    if (user) {
      setUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      setUser(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };
};
