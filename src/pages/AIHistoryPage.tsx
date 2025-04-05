import * as React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const HistoryContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
}));

const HistoryPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const AIHistoryPage: React.FC = () => {
  // Datos de ejemplo para la tabla
  const historyData = [
    {
      id: 1,
      fecha: '2024-03-20',
      tipo: 'Análisis de ECG',
      resultado: 'Normal',
      detalles: 'Ritmo sinusal regular'
    },
    {
      id: 2,
      fecha: '2024-03-19',
      tipo: 'Análisis de Laboratorio',
      resultado: 'Anormal',
      detalles: 'Niveles elevados de colesterol'
    }
  ];

  return (
    <HistoryContainer>
      <Typography variant="h4" gutterBottom>
        Historial de Análisis IA
      </Typography>

      <HistoryPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo de Análisis</TableCell>
                <TableCell>Resultado</TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.fecha}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.resultado}</TableCell>
                  <TableCell>{item.detalles}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </HistoryPaper>
    </HistoryContainer>
  );
};

export default AIHistoryPage;
