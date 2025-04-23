import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';;;;;
import PasswordResetForm from '../components/auth/PasswordResetForm';
import { AuthService } from '../services/auth/AuthService';;;;;
import { Container, Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';;;;;

const PasswordResetPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsLoading(false);
        return;
      }

      try {
        const authService = AuthService.getInstance();
        const isValid = await authService.verifyResetToken(token);
        setIsValidToken(isValid);
      } catch (error) {
        console.error('Error al verificar token:', error);
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box my={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!isValidToken) {
    return (
      <Container maxWidth="sm">
        <Box my={4}>
          <Alert severity="error">
            El enlace de restablecimiento no es válido o ha expirado. Por favor, solicita un nuevo enlace.
          </Alert>
          <Box mt={2} display="flex" justifyContent="center">
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/password-reset-request')}
            >
              Solicitar un nuevo enlace
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box my={4} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Restablecer Contraseña
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" paragraph>
            Ingresa tu nueva contraseña.
          </Typography>
          {token && <PasswordResetForm token={token} />}
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordResetPage; 