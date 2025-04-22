import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { interactionService, InteractionType } from '../../services/interactions/InteractionService';

interface InteractionStats {
  totalInteractions: number;
  successRate: number;
  moduleBreakdown: Record<string, number>;
  typeBreakdown: Record<InteractionType, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const InteractionsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [timeframe]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const newStats = await interactionService.getInteractionStats(timeframe);
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatModuleData = () => {
    if (!stats) return [];
    return Object.entries(stats.moduleBreakdown).map(([name, value]) => ({
      name,
      value
    }));
  };

  const formatTypeData = () => {
    if (!stats) return [];
    return Object.entries(stats.typeBreakdown).map(([name, value]) => ({
      name,
      value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} textAlign="center" color="error.main">
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Panel de Interacciones
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            label="Período"
          >
            <MenuItem value="day">Último día</MenuItem>
            <MenuItem value="week">Última semana</MenuItem>
            <MenuItem value="month">Último mes</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Métricas principales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen General
              </Typography>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {stats?.totalInteractions || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Interacciones Totales
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {stats?.successRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tasa de Éxito
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de módulos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Módulo
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatModuleData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Interacciones" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de tipos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Tipo
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de detalles */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Módulo</TableCell>
                  <TableCell align="right">Total Interacciones</TableCell>
                  <TableCell align="right">Porcentaje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formatModuleData().map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                    <TableCell align="right">
                      {((row.value / (stats?.totalInteractions || 1)) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}; 