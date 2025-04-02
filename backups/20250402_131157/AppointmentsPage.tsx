import {
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
} from '../types/appointment';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | undefined
  >();
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'scheduled',
    page: 1,
    limit: 10,
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments(filters);
      setAppointments(response.appointments);
    } catch (err) {
      setError('Error al cargar las citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta cita?')) return;

    try {
      await appointmentService.deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta';
      case 'follow-up':
        return 'Seguimiento';
      case 'emergency':
        return 'Emergencia';
      case 'routine':
        return 'Rutina';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Citas Médicas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las citas médicas y su estado
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAppointment(undefined);
            setIsModalOpen(true);
          }}
        >
          Nueva Cita
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(
          [
            'scheduled',
            'confirmed',
            'completed',
            'cancelled',
          ] as AppointmentStatus[]
        ).map((status) => {
          const count = appointments.filter((a) => a.status === status).length;
          return (
            <Card key={status} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {status === 'scheduled' && 'Programadas'}
                    {status === 'confirmed' && 'Confirmadas'}
                    {status === 'completed' && 'Completadas'}
                    {status === 'cancelled' && 'Canceladas'}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <Button
                  variant={filters.status === status ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, status })}
                >
                  Ver
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(appointment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {appointment.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {appointment.doctorId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getTypeLabel(appointment.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status === 'scheduled' && 'Programada'}
                      {appointment.status === 'confirmed' && 'Confirmada'}
                      {appointment.status === 'completed' && 'Completada'}
                      {appointment.status === 'cancelled' && 'Cancelada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(appointment)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AppointmentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(undefined);
        }}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};
