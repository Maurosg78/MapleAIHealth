import React, { useState } from 'react';
import { TextField, Button, Box, Alert, Link, InputAdornment, IconButton } from '@mui/material';;;;;
import { Visibility, VisibilityOff } from '@mui/icons-material';;;;;
import { AuthService } from '../../services/auth/AuthService';;;;;
import { useNavigate } from 'react-router-dom';;;;;

interface PasswordResetFormProps {
  token: string;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ token }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  const validatePassword = (password: string): boolean => {
    // Mínimo 8 caracteres, al menos una letra, un número y un carácter especial
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra, un número y un carácter especial');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError('Ocurrió un error al restablecer la contraseña. Por favor intenta de nuevo.');
      console.error('Error al restablecer contraseña:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = (): void => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (success) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Tu contraseña ha sido restablecida correctamente.
        </Alert>
        <Box mt={2} textAlign="center">
          <Link 
            component="button" 
            variant="body2" 
            onClick={() => navigate('/login')}
            underline="hover"
          >
            Ir al inicio de sesión
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
        name="password"
        label="Nueva contraseña"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirmar contraseña"
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={handleToggleConfirmPasswordVisibility}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
      </Button>
    </Box>
  );
};

export default PasswordResetForm; 