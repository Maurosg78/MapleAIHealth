import { 
   useState, useEffect 
 } from 'react'
 // Definir la interfaz para la consulta de búsqueda
import { 
   Button, Input, Select, Modal, Spinner 
 } from '@chakra-ui/react'
import React from 'react'
interface EMRSearchQuery {
  name: string;
  documentId: string;
  email: string;
  phone: string;
}

// Interfaz para los resultados de búsqueda conforme a EMRPatientSearchResult
interface SearchResult {
  id: string;
  fullName: string;
  name: string;
  birthDate: string;
  gender: string;
  mrn: string;
  dateOfBirth?: Date;
  documentId?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

/**
 * Componente de ejemplo para búsqueda de pacientes
 */
const EMRPatientSearch: React.FC = () => {
  // Estado para el formulario de búsqueda
  const [searchQuery, setSearchQuery] = useState<EMRSearchQuery>({
    name: '',
    documentId: '',
    email: '',
    phone: '',
  });

  // Estado para los resultados de búsqueda

  // Estado de carga

  // Estado para indicar si se ha realizado una búsqueda

  // Actualizar campo de búsqueda
  const handleSearchChange = (field: keyof EMRSearchQuery, value: string) => {
    setSearchQuery((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Realizar búsqueda de pacientes
  const handleSearch = async () => {
    // Validar que al menos un campo tenga valor
    if (
      !searchQuery.name &&
      !searchQuery.documentId &&
      !searchQuery.email &&
      !searchQuery.phone
    ) {
      console.error('Error: Introduce al menos un criterio de búsqueda');
      return;
    }

    // Simulamos búsqueda para evitar dependencias externas
    setIsSearching(true);

    // Simulación de tiempo de carga
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Resultado de ejemplo
    const mockResults: SearchResult[] = [
      {
        id: '1',
        fullName: 'Juan García',
        name: 'Juan García',
        birthDate: '1980-05-15',
        gender: 'M',
        mrn: 'MRN12345',
        dateOfBirth: new Date('1980-05-15'),
        documentId: 'MRN12345',
        contactInfo: {
          email: 'juan@example.com',
          phone: '123-456-7890',
        },
      },
      {
        id: '2',
        fullName: 'María López',
        name: 'María López',
        birthDate: '1975-08-22',
        gender: 'F',
        mrn: 'MRN67890',
        dateOfBirth: new Date('1975-08-22'),
        documentId: 'MRN67890',
        contactInfo: {
          email: 'maria@example.com',
          phone: '098-765-4321',
        },
      },
    ];

    // Aplicar filtros según los criterios de búsqueda
    const filteredResults = mockResults.filter((patient) => {
      const nameMatch = searchQuery.name
        ? patient.name.toLowerCase().includes(searchQuery.name.toLowerCase())
        : true;

      const docMatch = searchQuery.documentId
        ? patient.documentId?.includes(searchQuery.documentId)
        : true;

      const emailMatch = searchQuery.email
        ? patient.contactInfo?.email
            ?.toLowerCase()
            .includes(searchQuery.email.toLowerCase())
        : true;

      const phoneMatch = searchQuery.phone
        ? patient.contactInfo?.phone?.includes(searchQuery.phone)
        : true;

      return nameMatch && docMatch && emailMatch && phoneMatch;
    });

    setSearchResults(filteredResults);
    setHasSearched(true);
    setIsSearching(false);
  };

  // Limpiar formulario
  const handleClear = () => {
    setSearchQuery({
      name: '',
      documentId: '',
      email: '',
      phone: '',
    });
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
      <VStack align="stretch">
        <Heading size="md">Búsqueda de Pacientes</Heading>
        <Text fontSize="sm" color="gray.600">
          Este componente simula la búsqueda de pacientes en un sistema EMR.
        </Text>

        <Box>
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>
              Nombre
            </Text>
            <Input
              placeholder="Ej. Juan García"
              value={searchQuery.name}
              onChange={(e) => handleSearchChange('name', e.target.value)}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>
              Documento de Identidad
            </Text>
            <Input
              placeholder="Ej. 12345678X"
              value={searchQuery.documentId}
              onChange={(e) => handleSearchChange('documentId', e.target.value)}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>
              Email
            </Text>
            <Input
              placeholder="Ej. paciente@correo.com"
              value={searchQuery.email}
              type="email"
              onChange={(e) => handleSearchChange('email', e.target.value)}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>
              Teléfono
            </Text>
            <Input
              placeholder="Ej. 612345678"
              value={searchQuery.phone}
              onChange={(e) => handleSearchChange('phone', e.target.value)}
            />
          </Box>
        </Box>

        <Box>
          <Button variant="outline" onClick={handleClear} mr={3}>
            Limpiar
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Buscando...' : 'Buscar Paciente'}
          </Button>
        </Box>

        {hasSearched && (
          <Box mt={4}>
            <Heading size="sm" mb={3}>
              Resultados
            </Heading>

            {searchResults.length === 0 ? (
              <Text color="gray.500">
                No se encontraron resultados con los criterios de búsqueda.
              </Text>
            ) : (
              <Box overflowX="auto">
                {searchResults.map((patient) => (
                  <Box
                    key={patient.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    mb={2}
                  >
                    <Text>
                      <strong>Nombre:</strong> {patient.fullName}
                    </Text>
                    <Text>
                      <strong>ID:</strong> {patient.id}
                    </Text>
                    <Text>
                      <strong>Fecha Nacimiento:</strong> {patient.birthDate}
                    </Text>
                    <Text>
                      <strong>Género:</strong> {patient.gender}
                    </Text>
                    <Text>
                      <strong>MRN:</strong> {patient.mrn}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default EMRPatientSearch;
