import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { AIAssistant } from '../components/emr/AIAssistant';
import { useParams } from 'react-router-dom';

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  allergies: Array<{ id: string; name: string }>;
  medications: Array<{ id: string; name: string }>;
}

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
  notes: string;
}

interface LabResult {
  id: string;
  date: string;
  test: string;
  result: string;
  reference: string;
  status: 'normal' | 'abnormal';
}

export const EMRPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [activeTab, setActiveTab] = useState<
    'info' | 'history' | 'labs' | 'ai'
  >('info');
  const [patientInfo] = useState<PatientInfo>({
    id: 'P001',
    name: 'Juan Pérez',
    age: 45,
    gender: 'male',
    bloodType: 'O+',
    allergies: [
      { id: 'a1', name: 'Penicilina' },
      { id: 'a2', name: 'Polen' },
    ],
    medications: [
      { id: 'm1', name: 'Metformina' },
      { id: 'm2', name: 'Lisinopril' },
    ],
  });

  const [medicalHistory] = useState<MedicalRecord[]>([
    {
      id: 'h1',
      date: '2024-03-15',
      diagnosis: 'Diabetes Tipo 2',
      treatment: 'Metformina 500mg',
      doctor: 'Dr. García',
      notes: 'Control mensual',
    },
    {
      id: 'h2',
      date: '2024-02-20',
      diagnosis: 'Hipertensión',
      treatment: 'Lisinopril 10mg',
      doctor: 'Dr. García',
      notes: 'Control quincenal',
    },
  ]);

  const [labResults] = useState<LabResult[]>([
    {
      id: 'l1',
      date: '2024-03-10',
      test: 'Glucosa en Ayunas',
      result: '95 mg/dL',
      reference: '70-100 mg/dL',
      status: 'normal',
    },
    {
      id: 'l2',
      date: '2024-03-10',
      test: 'Hemoglobina A1c',
      result: '6.2%',
      reference: '4.0-5.6%',
      status: 'abnormal',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Historial Médico Electrónico</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Información completa del paciente
          </p>
        </div>
        <Button>Exportar EMR</Button>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={activeTab === 'info' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('info')}
        >
          Información Personal
        </Button>
        <Button
          variant={activeTab === 'history' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('history')}
        >
          Historial Médico
        </Button>
        <Button
          variant={activeTab === 'labs' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('labs')}
        >
          Resultados de Laboratorio
        </Button>
        <Button
          variant={activeTab === 'ai' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('ai')}
        >
          Asistente Virtual
        </Button>
      </div>

      {activeTab === 'info' && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Datos Básicos</h2>
              <div className="space-y-4">
                <Input
                  label="ID del Paciente"
                  value={patientInfo.id}
                  disabled
                />
                <Input label="Nombre" value={patientInfo.name} disabled />
                <Input
                  label="Edad"
                  type="number"
                  value={patientInfo.age.toString()}
                  disabled
                />
                <Select
                  label="Género"
                  value={patientInfo.gender}
                  options={[
                    { value: 'male', label: 'Masculino' },
                    { value: 'female', label: 'Femenino' },
                    { value: 'other', label: 'Otro' },
                  ]}
                  disabled
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Información Médica</h2>
              <div className="space-y-4">
                <Input
                  label="Tipo de Sangre"
                  value={patientInfo.bloodType}
                  disabled
                />
                <div>
                  <div
                    id="allergies-label"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Alergias
                  </div>
                  <ul
                    aria-labelledby="allergies-label"
                    className="mt-1 flex flex-wrap gap-2 list-none"
                  >
                    {patientInfo.allergies.map((allergy) => (
                      <li
                        key={allergy.id}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        {allergy.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div
                    id="medications-label"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Medicamentos Actuales
                  </div>
                  <ul
                    aria-labelledby="medications-label"
                    className="mt-1 flex flex-wrap gap-2 list-none"
                  >
                    {patientInfo.medications.map((medication) => (
                      <li
                        key={medication.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {medication.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <div className="space-y-4">
            {medicalHistory.map((record) => (
              <div
                key={record.id}
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {record.diagnosis}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{record.doctor}</span>
                </div>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-medium">Tratamiento:</span>{' '}
                    {record.treatment}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Notas:</span> {record.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'labs' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prueba
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {labResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.test}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.result}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.status === 'normal'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.status === 'normal' ? 'Normal' : 'Anormal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'ai' && patientId && <AIAssistant patientId={patientId} />}
    </div>
  );
};
