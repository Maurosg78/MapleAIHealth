import React from 'react';
import {
   useState, useEffect 
} from 'react';
type PatientFormData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
import {
   Button, Input, Select, Modal, Spinner 
} from '@chakra-ui/react';
interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => Promise<void>;
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    defaultValues: patient,
  });

  const handleFormSubmit = async (data: PatientFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Nombre"
            {...register('firstName', { required: 'El nombre es requerido' })}
            error={errors.firstName?.message}
          />
        </div>
        <div>
          <Input
            label="Apellido"
            {...register('lastName', { required: 'El apellido es requerido' })}
            error={errors.lastName?.message}
          />
        </div>
        <div>
          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'El email es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido',
              },
            })}
            error={errors.email?.message}
          />
        </div>
        <div>
          <Input
            label="Teléfono"
            {...register('phone', { required: 'El teléfono es requerido' })}
            error={errors.phone?.message}
          />
        </div>
        <div>
          <Input
            label="Fecha de Nacimiento"
            type="date"
            {...register('dateOfBirth', {
              required: 'La fecha de nacimiento es requerida',
            })}
            error={errors.dateOfBirth?.message}
          />
        </div>
        <div>
          <Select
            label="Género"
            {...register('gender', { required: 'El género es requerido' })}
            error={errors.gender?.message}
            options={[
              { value: 'male', label: 'Masculino' },
              { value: 'female', label: 'Femenino' },
              { value: 'other', label: 'Otro' },
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dirección</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Calle"
              {...register('address.street', {
                required: 'La calle es requerida',
              })}
              error={errors.address?.street?.message}
            />
          </div>
          <div>
            <Input
              label="Ciudad"
              {...register('address.city', {
                required: 'La ciudad es requerida',
              })}
              error={errors.address?.city?.message}
            />
          </div>
          <div>
            <Input
              label="Estado"
              {...register('address.state', {
                required: 'El estado es requerido',
              })}
              error={errors.address?.state?.message}
            />
          </div>
          <div>
            <Input
              label="Código Postal"
              {...register('address.zipCode', {
                required: 'El código postal es requerido',
              })}
              error={errors.address?.zipCode?.message}
            />
          </div>
          <div>
            <Input
              label="País"
              {...register('address.country', {
                required: 'El país es requerido',
              })}
              error={errors.address?.country?.message}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contacto de Emergencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Nombre"
              {...register('emergencyContact.name', {
                required: 'El nombre es requerido',
              })}
              error={errors.emergencyContact?.name?.message}
            />
          </div>
          <div>
            <Input
              label="Relación"
              {...register('emergencyContact.relationship', {
                required: 'La relación es requerida',
              })}
              error={errors.emergencyContact?.relationship?.message}
            />
          </div>
          <div>
            <Input
              label="Teléfono"
              {...register('emergencyContact.phone', {
                required: 'El teléfono es requerido',
              })}
              error={errors.emergencyContact?.phone?.message}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Historial Médico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Alergias (separadas por coma)"
              {...register('medicalHistory.allergies')}
              error={errors.medicalHistory?.allergies?.message}
            />
          </div>
          <div>
            <Input
              label="Condiciones (separadas por coma)"
              {...register('medicalHistory.conditions')}
              error={errors.medicalHistory?.conditions?.message}
            />
          </div>
          <div>
            <Input
              label="Medicamentos (separados por coma)"
              {...register('medicalHistory.medications')}
              error={errors.medicalHistory?.medications?.message}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center">
              <Spinner className="w-4 h-4 mr-2" />
              Guardando...
            </div>
          ) : (
            'Guardar Paciente'
          )}
        </Button>
      </div>
    </form>
  );
};
