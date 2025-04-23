import React, { useState } from 'react';
import { TextField, Button, Box, Alert, Link, Typography } from '@mui/material';;;;;
import { AuthService } from '../../services/auth/AuthService';;;;;
import { useNavigate } from 'react-router-dom';;;;;

const PasswordResetRequestForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.');
      console.error('Error al solicitar restablecimiento de contraseña:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.
        </Alert>
        <Typography variant="body2" textAlign="center">
          Por favor revisa tu bandeja de entrada y sigue las instrucciones.
        </Typography>
        <Box mt={2} textAlign="center">
          <Link 
            component="button" 
            variant="body2" 
            onClick={() => navigate('/login')}
            underline="hover"
          >
            Volver al inicio de sesión
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo electrónico"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
      </Button>
      
      <Box mt={2} display="flex" justifyContent="space-between">
        <Link 
          component="button" 
          variant="body2" 
          onClick={() => navigate('/login')}
          underline="hover"
        >
          Volver al inicio de sesión
        </Link>
        <Link 
          component="button" 
          variant="body2" 
          onClick={() => navigate('/register')}
          underline="hover"
        >
          Crear una cuenta
        </Link>
      </Box>
    </Box>
  );
};

export default PasswordResetRequestForm; 