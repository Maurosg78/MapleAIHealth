import { useState } from 'react';;;;;
import { UserAddIcon, SearchIcon, FilterIcon, DocumentTextIcon, CalendarIcon, ClockIcon, ChartBarIcon, AnnotationIcon } from '@heroicons/react/outline';;;;;

// Tipos para los datos de pacientes
interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    lastVisit: string;
    upcomingVisit?: string;
    condition: string;
    status: 'active' | 'inactive' | 'pending';
    risk: 'low' | 'medium' | 'high';
    avatar?: string;
}

// Datos de ejemplo
const mockPatients: Patient[] = [
    {
        id: 'P001',
        name: 'Ana García',
        age: 45,
        gender: 'Femenino',
        lastVisit: '2024-07-10',
        upcomingVisit: '2024-07-24',
        condition: 'Lumbociática',
        status: 'active',
        risk: 'medium',
    },
    {
        id: 'P002',
        name: 'Carlos Martínez',
        age: 67,
        gender: 'Masculino',
        lastVisit: '2024-07-05',
        condition: 'Hipertensión, Diabetes',
        status: 'active',
        risk: 'high',
    },
    {
        id: 'P003',
        name: 'Elena Torres',
        age: 32,
        gender: 'Femenino',
        lastVisit: '2024-06-28',
        upcomingVisit: '2024-07-26',
        condition: 'Fibromialgia',
        status: 'active',
        risk: 'medium',
    },
    {
        id: 'P004',
        name: 'Miguel Sánchez',
        age: 28,
        gender: 'Masculino',
        lastVisit: '2024-07-12',
        upcomingVisit: '2024-07-19',
        condition: 'Esguince de tobillo',
        status: 'active',
        risk: 'low',
    },
    {
        id: 'P005',
        name: 'Laura López',
        age: 51,
        gender: 'Femenino',
        lastVisit: '2024-05-20',
        condition: 'Artritis',
        status: 'inactive',
        risk: 'medium',
    },
];

// Componente para el panel de resumen rápido
const QuickActions = (): void => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">Acciones Rápidas</h2>
                <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                    Ver todo
                </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-4 hover:bg-primary-100 transition-colors">
                    <UserAddIcon className="h-8 w-8 text-primary-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Nuevo Paciente</span>
                </button>
                
                <button className="flex flex-col items-center justify-center bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                    <CalendarIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Programar Cita</span>
                </button>
                
                <button className="flex flex-col items-center justify-center bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
                    <DocumentTextIcon className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Nueva Consulta</span>
                </button>
                
                <button className="flex flex-col items-center justify-center bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Ver Reportes</span>
                </button>
            </div>
        </div>
    );
};

// Componente para la lista de pacientes
const PatientList = ({ patients }: { patients: Patient[] }): void => {
    const getRiskBadgeColor = (risk: Patient['risk']): void => {
        switch (risk) {
            case 'low':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'high':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getStatusColor = (status: Patient['status']): void => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'inactive':
                return 'bg-gray-500';
            case 'pending':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">Pacientes Recientes</h2>
                
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="w-64 pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <SearchIcon className="h-5 w-5" />
                        </div>
                    </div>
                    
                    <button 
                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
                        title="Filtrar pacientes"
                        aria-label="Filtrar pacientes"
                    >
                        <FilterIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paciente
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Condición
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Visitas
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Riesgo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {patient.avatar ? (
                                                <img className="h-10 w-10 rounded-full" src={patient.avatar} alt="" />
                                            ) : (
                                                <div className={`h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium`}>
                                                    {patient.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                                {patient.name}
                                                <span className={`ml-2 h-2 w-2 rounded-full ${getStatusColor(patient.status)}`}></span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {patient.age} años, {patient.gender}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{patient.condition}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                                            <span>Última: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                                        </div>
                                        {patient.upcomingVisit && (
                                            <div className="flex items-center text-primary-600 font-medium">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                <span>Próxima: {new Date(patient.upcomingVisit).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskBadgeColor(patient.risk)}`}>
                                        {patient.risk === 'low' && 'Bajo'}
                                        {patient.risk === 'medium' && 'Medio'}
                                        {patient.risk === 'high' && 'Alto'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button 
                                            className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50"
                                            title="Ver historial médico"
                                            aria-label="Ver historial médico"
                                        >
                                            <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />
                                            <span className="sr-only">Ver historial</span>
                                        </button>
                                        <button 
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                            title="Programar cita"
                                            aria-label="Programar cita"
                                        >
                                            <CalendarIcon className="h-5 w-5" aria-hidden="true" />
                                            <span className="sr-only">Programar cita</span>
                                        </button>
                                        <button 
                                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                            title="Enviar mensaje"
                                            aria-label="Enviar mensaje"
                                        >
                                            <AnnotationIcon className="h-5 w-5" aria-hidden="true" />
                                            <span className="sr-only">Enviar mensaje</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="px-4 py-3 border-t flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                    <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Anterior
                    </a>
                    <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Siguiente
                    </a>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de <span className="font-medium">20</span> pacientes
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Anterior</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" aria-current="page" className="z-10 bg-primary-50 border-primary-500 text-primary-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                1
                            </a>
                            <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                2
                            </a>
                            <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                3
                            </a>
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                            </span>
                            <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                8
                            </a>
                            <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                9
                            </a>
                            <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                10
                            </a>
                            <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Siguiente</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente principal del dashboard de pacientes
export default function PatientDashboard(): void {
    const [patients] = useState<Patient[]>(mockPatients);
    
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Visualice, busque y gestione sus pacientes desde un solo lugar.
                </p>
            </div>
            
            <QuickActions />
            <PatientList patients={patients} />
        </div>
    );
} 