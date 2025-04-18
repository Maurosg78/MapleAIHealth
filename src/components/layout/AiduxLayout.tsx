import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
    UserIcon, 
    DocumentTextIcon, 
    CalendarIcon, 
    ChartBarIcon,
    CogIcon,
    MenuIcon,
    XIcon,
    LightBulbIcon,
    SearchIcon,
    BellIcon
} from '@heroicons/react/outline';

// Componente de asistente clínico que aparece contextualmente
const ClinicalAssistant = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [userQuestions, setUserQuestions] = useState<string[]>([]);
    const [userInput, setUserInput] = useState('');
    
    // ADVERTENCIA DE SEGURIDAD MÉDICA - PRIORIDAD ALTA
    // Este asistente NUNCA debe generar información médica no verificada
    // Toda recomendación debe basarse exclusivamente en datos confirmados
    // Si algún dato es desconocido, SIEMPRE preguntar al profesional médico
    
    // Función para generar preguntas contextuales basadas en datos incompletos
    const generateContextualQuestions = () => {
        return [
            "¿Podría proporcionar los resultados del último hemograma del paciente?",
            "¿Cuándo fue la última evaluación de presión arterial del paciente?"
        ];
    };
    
    const handleSubmit = () => {
        if (userInput.trim()) {
            // En un entorno real, esta información se enviaría a un backend
            // Aquí solo simulamos una respuesta que solicita más información
            setUserQuestions(prev => [...prev, 
                "Para responder adecuadamente, necesito más información. ¿Podría proporcionar detalles específicos sobre los síntomas actuales del paciente?"
            ]);
            setUserInput('');
        }
    };
    
    return (
        <div className={`fixed bottom-4 right-4 bg-white shadow-lg rounded-lg transition-all duration-300 ${isExpanded ? 'w-96' : 'w-12'}`}>
            <div className="p-3 bg-primary-600 text-white rounded-t-lg flex justify-between items-center">
                <span className={`font-medium transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    Asistente Clínico AIDUX
                </span>
                <button 
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded-full hover:bg-primary-500 focus:outline-none"
                    aria-label={isExpanded ? "Cerrar asistente" : "Abrir asistente"}
                >
                    {isExpanded ? (
                        <XIcon className="w-5 h-5" />
                    ) : (
                        <LightBulbIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            
            {isExpanded && (
                <div className="p-4">
                    <div className="mb-4 text-sm text-gray-700">
                        <p className="font-medium">Solicitud de información pendiente:</p>
                        <ul className="mt-2 space-y-2">
                            {generateContextualQuestions().map((question, index) => (
                                <li key={index} className="flex items-start">
                                    <div className="flex-shrink-0 h-4 w-4 text-primary-500">•</div>
                                    <p className="ml-2">{question}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {userQuestions.length > 0 && (
                        <div className="mb-4 pb-3 border-b">
                            <p className="font-medium text-sm text-gray-700">Consultas pendientes:</p>
                            <ul className="mt-2 space-y-2">
                                {userQuestions.map((question, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        {question}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="border-t pt-3">
                        <p className="text-xs text-gray-500 mb-2">Puedo ayudarte solicitando:</p>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                                Plantilla de nota
                            </button>
                            <button type="button" className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                                Criterios diagnósticos
                            </button>
                            <button type="button" className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                                Verificar interacciones
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-3 flex">
                        <input
                            type="text"
                            placeholder="Pregúntame algo..."
                            className="flex-1 text-sm border rounded-l-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <button 
                            type="button" 
                            className="bg-primary-600 text-white px-3 py-1 rounded-r-lg hover:bg-primary-700"
                            aria-label="Enviar mensaje"
                            onClick={handleSubmit}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="mt-3 text-xs text-red-600 font-medium">
                        ADVERTENCIA: Este asistente nunca proporcionará información médica no verificada.
                        Siempre solicitará los datos necesarios antes de ofrecer cualquier sugerencia.
                    </div>
                </div>
            )}
        </div>
    );
};

// Tooltip personalizado para reducir la carga cognitiva
const FeatureTooltip = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    return (
        <div className="relative" 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            
            {showTooltip && (
                <div className="absolute left-full ml-2 top-0 w-64 bg-gray-800 text-white text-sm rounded shadow-lg p-2 z-10">
                    <div className="font-medium">{title}</div>
                    <div className="text-xs mt-1">{description}</div>
                </div>
            )}
        </div>
    );
};

export function AiduxLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    
    // Determinar la sección activa basada en la ruta
    const isActive = (path: string) => location.pathname.startsWith(path);
    
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`bg-white shadow-md transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                {/* Logo */}
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        {sidebarOpen && (
                            <span className="ml-2 font-semibold text-gray-800">AIDUX EMR</span>
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={sidebarOpen ? "Cerrar barra lateral" : "Abrir barra lateral"}
                    >
                        <MenuIcon className="h-5 w-5" />
                    </button>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        <li>
                            <FeatureTooltip 
                                title="Pacientes" 
                                description="Gestione pacientes, vea historias clínicas y seguimiento de casos"
                            >
                                <Link
                                    to="/pacientes"
                                    className={`flex items-center px-4 py-3 text-sm ${isActive('/pacientes') ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <UserIcon className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Pacientes</span>}
                                </Link>
                            </FeatureTooltip>
                        </li>
                        <li>
                            <FeatureTooltip 
                                title="Consultas" 
                                description="Gestione consultas, documentación clínica y seguimiento"
                            >
                                <Link
                                    to="/consultas"
                                    className={`flex items-center px-4 py-3 text-sm ${isActive('/consultas') ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <DocumentTextIcon className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Consultas</span>}
                                </Link>
                            </FeatureTooltip>
                        </li>
                        <li>
                            <FeatureTooltip 
                                title="Progreso" 
                                description="Visualice el progreso de sus pacientes a través del tiempo"
                            >
                                <Link
                                    to="/progreso"
                                    className={`flex items-center px-4 py-3 text-sm ${isActive('/progreso') ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <ChartBarIcon className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Progreso</span>}
                                </Link>
                            </FeatureTooltip>
                        </li>
                        <li>
                            <FeatureTooltip 
                                title="Evaluación Funcional" 
                                description="Visualice una evaluación detallada de la funcionalidad y evolución de sus pacientes"
                            >
                                <Link
                                    to="/evaluacion-funcional"
                                    className={`flex items-center px-4 py-3 text-sm ${isActive('/evaluacion-funcional') ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <svg 
                                        className="h-5 w-5" 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    {sidebarOpen && <span className="ml-3">Evaluación Funcional</span>}
                                </Link>
                            </FeatureTooltip>
                        </li>
                        <li>
                            <FeatureTooltip 
                                title="Agenda" 
                                description="Gestione citas, horarios y disponibilidad"
                            >
                                <Link
                                    to="/agenda"
                                    className={`flex items-center px-4 py-3 text-sm ${isActive('/agenda') ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <CalendarIcon className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Agenda</span>}
                                </Link>
                            </FeatureTooltip>
                        </li>
                        <li>
                            <FeatureTooltip 
                                title="Análisis" 
                                description="Explore tendencias, resultados y métricas clínicas"
                            >
                                <Link
                                    to="/analisis"
                                    className={`flex items-center px-4 py-3 text-sm ${isActive('/analisis') ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <ChartBarIcon className="h-5 w-5" />
                                    {sidebarOpen && <span className="ml-3">Análisis</span>}
                                </Link>
                            </FeatureTooltip>
                        </li>
                    </ul>
                    
                    <div className="mt-auto pt-4 border-t">
                        <Link
                            to="/configuracion"
                            className={`flex items-center px-4 py-3 text-sm ${isActive('/configuracion') ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <CogIcon className="h-5 w-5" />
                            {sidebarOpen && <span className="ml-3">Configuración</span>}
                        </Link>
                    </div>
                </nav>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-800">
                            {location.pathname === '/pacientes' && 'Pacientes'}
                            {location.pathname === '/consultas' && 'Consultas'}
                            {location.pathname === '/progreso' && 'Progreso'}
                            {location.pathname.startsWith('/evaluacion-funcional') && 'Evaluación Funcional'}
                            {location.pathname === '/agenda' && 'Agenda'}
                            {location.pathname === '/analisis' && 'Análisis'}
                        </h1>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <SearchIcon className="h-5 w-5" />
                            </div>
                        </div>
                        
                        <button 
                            type="button" 
                            className="p-2 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none relative"
                            aria-label="Ver notificaciones"
                        >
                            <BellIcon className="h-6 w-6" />
                            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                3
                            </span>
                        </button>
                        
                        <div className="relative">
                            <button 
                                type="button" 
                                className="flex items-center focus:outline-none"
                                aria-label="Menú de usuario"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                                    DR
                                </div>
                                {sidebarOpen && (
                                    <span className="ml-2 text-sm text-gray-700">Dr. Ramírez</span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
            
            {/* Asistente Clínico */}
            <ClinicalAssistant />
        </div>
    );
} 