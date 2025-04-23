import React from 'react';
import { Container, Box, Paper, Typography } from '@mui/material';;;;;
import ChangePasswordForm from '../components/auth/ChangePasswordForm';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';;;;;

const ChangePasswordPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Container maxWidth="md">
        <Box my={4}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Cambiar Contraseña
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" paragraph>
              Actualiza tu contraseña para mantener tu cuenta segura.
            </Typography>
            <ChangePasswordForm />
          </Paper>
        </Box>
      </Container>
    </ProtectedRoute>
  );
};

export default ChangePasswordPage; 