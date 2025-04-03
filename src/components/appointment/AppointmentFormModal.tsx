import React from "react";
import { 
   useState, useEffect 
 } from "react"
  Appointment,
import { 
   Button, Input, Select, Modal, Spinner 
 } from "@chakra-ui/react"
  AppointmentStatus,
import { 
  AppointmentType,
} from '../../types/appointment';

export export interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  onSuccess: () => void;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}) => {


  const [formData, setFormData] = useState<Partial<Appointment>>({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation',
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    if (appointment) {
      setFormData(appointment);
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, formData);
      } else {
        await appointmentService.createAppointment(
          formData as Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Error al guardar la cita');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? 'Editar Cita' : 'Nueva Cita'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ID del Paciente"
          value={formData.patientId}
          onChange={(e) =>
            setFormData({ ...formData, patientId: e.target.value })
          }
          required
          disabled={loading}
        />

        <Input
          label="ID del Doctor"
          value={formData.doctorId}
          onChange={(e) =>
            setFormData({ ...formData, doctorId: e.target.value })
          }
          required
          disabled={loading}
        />

        <Input
          label="Fecha"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          disabled={loading}
        />

        <Input
          label="Hora"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
          disabled={loading}
        />

        <Select
          label="Tipo de Cita"
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as AppointmentType,
            })
          }
          options={[
            { value: 'consultation', label: 'Consulta' },
            { value: 'follow-up', label: 'Seguimiento' },
            { value: 'emergency', label: 'Emergencia' },
            { value: 'routine', label: 'Rutina' },
          ]}
          disabled={loading}
        />

        <Select
          label="Estado"
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as AppointmentStatus,
            })
          }
          options={[
            { value: 'scheduled', label: 'Programada' },
            { value: 'confirmed', label: 'Confirmada' },
            { value: 'completed', label: 'Completada' },
            { value: 'cancelled', label: 'Cancelada' },
          ]}
          disabled={loading}
        />

        <Input
          label="Notas"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={loading}
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
