import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Patient } from '../../types/patient';
import PatientService from '../../services/patient';

interface PatientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient?: Patient;
    onSuccess: () => void;
}

const getSubmitButtonText = (loading: boolean, patient?: Patient): string => {
    if (loading) return 'Guardando...';
    return patient ? 'Actualizar' : 'Crear';
};

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
    isOpen,
    onClose,
    patient,
    onSuccess
}) => {
    const [formData, setFormData] = useState<Partial<Patient>>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'other',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        },
        medicalHistory: {
            allergies: [],
            conditions: [],
            medications: []
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (patient) {
            setFormData(patient);
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                gender: 'other',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                },
                emergencyContact: {
                    name: '',
                    relationship: '',
                    phone: ''
                },
                medicalHistory: {
                    allergies: [],
                    conditions: [],
                    medications: []
                }
            });
        }
    }, [patient]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (patient) {
                await PatientService.updatePatient(patient.id, formData);
            } else {
                await PatientService.createPatient(formData as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(patient ? 'Error al actualizar el paciente' : 'Error al crear el paciente');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof Patient] as Record<string, string | string[]>),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={patient ? 'Editar Paciente' : 'Nuevo Paciente'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre
                    </label>
                    <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Apellido
                    </label>
                    <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Teléfono
                    </label>
                    <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone ?? ''}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de Nacimiento
                    </label>
                    <Input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Género
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender ?? 'other'}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dirección
                    </label>
                    <Input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={formData.address?.street ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ciudad
                    </label>
                    <Input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address?.city ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Estado/Provincia
                    </label>
                    <Input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={formData.address?.state ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Código Postal
                    </label>
                    <Input
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={formData.address?.zipCode ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        País
                    </label>
                    <Input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={formData.address?.country ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre del Contacto de Emergencia
                    </label>
                    <Input
                        type="text"
                        id="emergencyContact.name"
                        name="emergencyContact.name"
                        value={formData.emergencyContact?.name ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Relación
                    </label>
                    <Input
                        type="text"
                        id="emergencyContact.relationship"
                        name="emergencyContact.relationship"
                        value={formData.emergencyContact?.relationship ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Teléfono de Emergencia
                    </label>
                    <Input
                        type="tel"
                        id="emergencyContact.phone"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact?.phone ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {getSubmitButtonText(loading, patient)}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
