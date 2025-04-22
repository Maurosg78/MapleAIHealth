import React, { useState } from 'react';
import { TextField, Button, Box, Alert, InputAdornment, IconButton, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthService } from '../../services/auth/AuthService';

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const authService = AuthService.getInstance();

  const validatePassword = (password: string): boolean => {
    // Mínimo 8 caracteres, al menos una letra, un número y un carácter especial
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra, un número y un carácter especial');
      return;
    }
    
    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      // Limpiar los campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
      console.error('Error al cambiar contraseña:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Cambiar Contraseña
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Tu contraseña ha sido cambiada correctamente.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="currentPassword"
        label="Contraseña actual"
        type={showCurrentPassword ? 'text' : 'password'}
        id="currentPassword"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle current password visibility"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                edge="end"
              >
                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="newPassword"
        label="Nueva contraseña"
        type={showNewPassword ? 'text' : 'password'}
        id="newPassword"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle new password visibility"
                onClick={() => setShowNewPassword(!showNewPassword)}
                edge="end"
              >
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
        label="Confirmar nueva contraseña"
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
                aria-label="toggle confirm new password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
        {isLoading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
      </Button>
    </Box>
  );
};

export default ChangePasswordForm; 