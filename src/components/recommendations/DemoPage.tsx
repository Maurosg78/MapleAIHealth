import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RecommendationsList from './RecommendationsList';
import { ClinicalRecommendationCardProps } from './ClinicalRecommendationCard';

// Datos de ejemplo para las recomendaciones
const mockRecommendations: ClinicalRecommendationCardProps[] = [
  {
    id: 'rec1',
    title: 'Iniciar metformina 850mg',
    description: 'Se recomienda iniciar tratamiento con metformina 850mg cada 12 horas con las comidas para control glucémico.',
    type: 'medication',
    urgency: 'soon',
    confidence: 0.92,
    evidenceLevel: 'A',
    sources: [
      {
        id: 'src1',
        title: 'Metformin as first-line therapy in type 2 diabetes',
        publication: 'New England Journal of Medicine',
        year: 2019,
        verified: true
      },
      {
        id: 'src2',
        title: 'ADA Guidelines for Diabetes Management 2023',
        publication: 'American Diabetes Association',
        year: 2023,
        verified: true
      }
    ]
  },
  {
    id: 'rec2',
    title: 'Control de hemoglobina glicosilada',
    description: 'Programar control de hemoglobina glicosilada (HbA1c) en 3 meses para evaluar respuesta al tratamiento.',
    type: 'test',
    urgency: 'routine',
    confidence: 0.89,
    evidenceLevel: 'B',
    sources: [
      {
        id: 'src3',
        title: 'Monitoring glycemic control in patients with diabetes mellitus',
        publication: 'Journal of Clinical Endocrinology',
        year: 2020,
        verified: true
      }
    ]
  },
  {
    id: 'rec3',
    title: 'Derivación a oftalmología',
    description: 'Derivar a oftalmología para evaluación de retinopatía diabética anual.',
    type: 'referral',
    urgency: 'soon',
    confidence: 0.85,
    evidenceLevel: 'A',
    sources: [
      {
        id: 'src4',
        title: 'Screening for Diabetic Retinopathy',
        publication: 'Ophthalmology Journal',
        year: 2021,
        verified: true
      }
    ]
  },
  {
    id: 'rec4',
    title: 'Riesgo de hipoglucemia',
    description: 'Paciente con antecedentes de hipoglucemia. Instruir sobre signos, síntomas y manejo de hipoglucemia.',
    type: 'warning',
    urgency: 'urgent',
    confidence: 0.78,
    evidenceLevel: 'B'
  },
  {
    id: 'rec5',
    title: 'Iniciar atorvastatina 20mg',
    description: 'Para manejo de dislipidemia y prevención cardiovascular, se recomienda atorvastatina 20mg diarios.',
    type: 'medication',
    urgency: 'routine',
    confidence: 0.88,
    evidenceLevel: 'A',
    contraindications: [
      {
        id: 'c1',
        description: 'Paciente con antecedentes de miopatía por estatinas',
        severity: 'high'
      }
    ]
  },
  {
    id: 'rec6',
    title: 'Evaluación por nefrología',
    description: 'Ante deterioro de función renal (eGFR < 60 ml/min), derivar a nefrología para evaluación.',
    type: 'referral',
    urgency: 'urgent',
    confidence: 0.90,
    evidenceLevel: 'B'
  },
  {
    id: 'rec7',
    title: 'Control presión arterial',
    description: 'Monitorear presión arterial regularmente. Meta: < 140/90 mmHg.',
    type: 'followUp',
    urgency: 'routine',
    confidence: 0.95,
    evidenceLevel: 'A'
  },
  {
    id: 'rec8',
    title: 'Sospecha de apnea del sueño',
    description: 'Los síntomas reportados sugieren posible apnea obstructiva del sueño. Considerar estudio de sueño.',
    type: 'diagnostic',
    urgency: 'soon',
    confidence: 0.72,
    evidenceLevel: 'C'
  },
  {
    id: 'rec9',
    title: 'Ajuste de insulina',
    description: 'Ajustar dosis de insulina basal a 18 unidades en la noche dada la tendencia a hiperglicemia matutina.',
    type: 'medication',
    urgency: 'emergency',
    confidence: 0.85,
    evidenceLevel: 'B',
    contraindications: [
      {
        id: 'c2',
        description: 'Precaución: Paciente ha reportado hipoglicemias nocturnas recientemente',
        severity: 'medium'
      }
    ]
  }
];

// Otro conjunto de datos para simular diferentes pacientes
const mockRecommendations2: ClinicalRecommendationCardProps[] = [
  {
    id: 'rec10',
    title: 'ECG de control',
    description: 'Realizar electrocardiograma para evaluar cambios post-infarto.',
    type: 'test',
    urgency: 'urgent',
    confidence: 0.96,
    evidenceLevel: 'A'
  },
  {
    id: 'rec11',
    title: 'Ajuste de anticoagulación',
    description: 'Modificar dosis de warfarina según último INR de 4.2 (rango terapéutico: 2-3).',
    type: 'medication',
    urgency: 'emergency',
    confidence: 0.91,
    evidenceLevel: 'A',
    contraindications: [
      {
        id: 'c3',
        description: 'Alto riesgo de sangrado: INR supraterapéutico',
        severity: 'high'
      }
    ]
  },
  {
    id: 'rec12',
    title: 'Retirar AINE',
    description: 'Suspender ibuprofeno debido a interacción con anticoagulantes y riesgo renal.',
    type: 'medication',
    urgency: 'urgent',
    confidence: 0.89,
    evidenceLevel: 'B'
  },
  {
    id: 'rec13',
    title: 'Rehabilitación cardíaca',
    description: 'Iniciar programa de rehabilitación cardíaca fase II.',
    type: 'treatment',
    urgency: 'soon',
    confidence: 0.87,
    evidenceLevel: 'A'
  }
];

// Componente de ejemplo para demostrar el uso de RecommendationsList
const DemoPage: React.FC = () => {
  // Estados para manejar la pestaña activa y notificaciones
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    type: 'info'
  });

  // Datos según la pestaña seleccionada
  const patientData = {
    0: {
      name: 'García Martínez, Juan',
      recommendations: mockRecommendations
    },
    1: {
      name: 'López Sánchez, Ana',
      recommendations: mockRecommendations2
    }
  };

  // Manejador para cambiar de pestaña
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manejador para acciones en las recomendaciones
  const handleRecommendationAction = (action: string, id: string) => {
    let message = '';
    let type: 'success' | 'info' | 'warning' | 'error' = 'info';

    if (action === 'apply') {
      message = `Recomendación ${id} marcada como aplicada`;
      type = 'success';
    } else if (action === 'info') {
      message = `Mostrando información detallada para recomendación ${id}`;
      type = 'info';
    }

    setNotification({
      open: true,
      message,
      type
    });
  };

  // Manejador para cerrar notificaciones
  const handleCloseNotification = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setNotification({
      ...notification,
      open: false
    });
  };

  // Simular carga de datos
  const handleRefresh = () => {
    setLoading(true);

    // Simular tiempo de carga
    setTimeout(() => {
      setLoading(false);
      setNotification({
        open: true,
        message: 'Recomendaciones actualizadas correctamente',
        type: 'success'
      });
    }, 1500);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard Clínico
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="pacientes de ejemplo"
          >
            <Tab label="Paciente 1: Diabetes" />
            <Tab label="Paciente 2: Post-infarto" />
          </Tabs>
        </Box>

        <RecommendationsList
          recommendations={patientData[tabValue as 0 | 1].recommendations}
          patientName={patientData[tabValue as 0 | 1].name}
          onRecommendationAction={handleRecommendationAction}
          loading={loading}
        />
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DemoPage;
