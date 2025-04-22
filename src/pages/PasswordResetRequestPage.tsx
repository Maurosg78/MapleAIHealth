import React from 'react';
import PasswordResetRequestForm from '../components/auth/PasswordResetRequestForm';
import { Container, Box, Typography, Paper } from '@mui/material';

const PasswordResetRequestPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box my={4} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Recuperar Contraseña
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" paragraph>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>
          <PasswordResetRequestForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordResetRequestPage; 