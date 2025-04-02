import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack
} from '@chakra-ui/react';

// Definir la interfaz para la consulta de búsqueda
interface EMRSearchQuery {
  name: string;
  documentId: string;
  email: string;
  phone: string;
}

// Definir la interfaz para los resultados de búsqueda
interface EMRPatientSearchResult {
  id: string;
  fullName: string;
  birthDate: string;
  gender: string;
  mrn: string;
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
  const [searchResults, setSearchResults] = useState<EMRPatientSearchResult[]>([]);

  // Estado de carga
  const [isSearching, setIsSearching] = useState(false);

  // Estado para indicar si se ha realizado una búsqueda
  const [hasSearched, setHasSearched] = useState(false);

  // Actualizar campo de búsqueda
  const handleSearchChange = (field: keyof EMRSearchQuery, value: string) => {
    setSearchQuery((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Realizar búsqueda de pacientes
  const handleSearch = async () => {
    // Simulamos búsqueda para evitar dependencias externas
    setIsSearching(true);

    // Simulación de tiempo de carga
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Resultado de ejemplo
    const mockResults: EMRPatientSearchResult[] = [
      {
        id: '1',
        fullName: 'Juan García',
        birthDate: '1980-05-15',
        gender: 'M',
        mrn: 'MRN12345'
      },
      {
        id: '2',
        fullName: 'María López',
        birthDate: '1975-08-22',
        gender: 'F',
        mrn: 'MRN67890'
      }
    ];

    setSearchResults(mockResults);
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
            <Text fontWeight="bold" mb={2}>Nombre</Text>
            <Input
              placeholder="Ej. Juan García"
              value={searchQuery.name}
              onChange={(e) => handleSearchChange('name', e.target.value)}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Documento de Identidad</Text>
            <Input
              placeholder="Ej. 12345678X"
              value={searchQuery.documentId}
              onChange={(e) => handleSearchChange('documentId', e.target.value)}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Email</Text>
            <Input
              placeholder="Ej. paciente@correo.com"
              value={searchQuery.email}
              type="email"
              onChange={(e) => handleSearchChange('email', e.target.value)}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Teléfono</Text>
            <Input
              placeholder="Ej. 612345678"
              value={searchQuery.phone}
              onChange={(e) => handleSearchChange('phone', e.target.value)}
            />
          </Box>
        </Box>

        <Box>
          <Button
            variant="outline"
            onClick={handleClear}
            mr={3}
          >
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
                    <Text><strong>Nombre:</strong> {patient.fullName}</Text>
                    <Text><strong>ID:</strong> {patient.id}</Text>
                    <Text><strong>Fecha Nacimiento:</strong> {patient.birthDate}</Text>
                    <Text><strong>Género:</strong> {patient.gender}</Text>
                    <Text><strong>MRN:</strong> {patient.mrn}</Text>
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
