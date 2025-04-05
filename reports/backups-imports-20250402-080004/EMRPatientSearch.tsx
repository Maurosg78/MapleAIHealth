import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import { EMRService } from '../../services/emr/EMRService';
import { EMRAdapter, EMRPatientSearchResult } from '../../services/emr/EMRAdapter';
import { EMRConfigService } from '../../services/emr/EMRConfigService';

// Definir la interfaz correcta para los resultados de búsqueda
interface ExtendedEMRPatientSearchResult extends EMRPatientSearchResult {
  fullName: string;
  name: string;
  birthDate: string;
  gender: string;
  mrn: string;
}

// Componente para buscar pacientes en EMR
const EMRPatientSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ExtendedEMRPatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>;
  const toast = useToast();

  // Función para buscar pacientes
  const searchPatients = async () => {
    if (!searchTerm) {
      toast({
        title: 'Error',
        description: 'Introduce un término de búsqueda',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsLoading(null);

    try {
      const emrService = new EMRService();
      const emrConfig = EMRConfigService.getActiveEMR();

      if (!emrConfig) {
        throw new Error('No hay EMR configurado');
      }

      const adapter = EMRAdapter.create(emrConfig.type, emrConfig.config);
      const results = await adapter.searchPatients;

      setSearchResults(results as ExtendedEMRPatientSearchResult[]);
    } catch (err) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al buscar pacientes',
        status: 'error',
        duration: 5000,
        isClosable: true
      
    });
    } finally {
      setIsLoading(null);
    }
  };
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

    setSearchResults(null);
    setHasSearched(null);
    setIsSearching(null);
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
    setHasSearched(null);
  };

  return (
    React.createElement('Box', { p: 6 borderWidth: "1px" borderRadius: "lg" bg: "white" shadow: "md"}, 
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
          )

          React.createElement('Box', { mb: 4}, 
            <Text fontWeight="bold" mb={2}>Documento de Identidad</Text>
            <Input
              placeholder="Ej. 12345678X"
              value={searchQuery.documentId}
              onChange={(e) => handleSearchChange('documentId', e.target.value)}
            />
          )

          React.createElement('Box', { mb: 4}, 
            <Text fontWeight="bold" mb={2}>Email</Text>
            <Input
              placeholder="Ej. paciente@correo.com"
              value={searchQuery.email}
              type="email"
              onChange={(e) => handleSearchChange('email', e.target.value)}
            />
          )

          React.createElement('Box', { mb: 4}, 
            <Text fontWeight="bold" mb={2}>Teléfono</Text>
            <Input
              placeholder="Ej. 612345678"
              value={searchQuery.phone}
              onChange={(e) => handleSearchChange('phone', e.target.value)}
            />
          )
        </Box>

        React.createElement('Box', {}, 
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
            loading={isSearching}
          >
            Buscar Paciente
          </Button>
        )

        {hasSearched && (
          React.createElement('Box', { mt: 4}, 
            <Heading size="sm" mb={3}>
              Resultados
            </Heading>

            {searchResults.length === 0 ? (
              <Text color="gray.500">
                No se encontraron resultados con los criterios de búsqueda.
              </Text>
            ) : (
              <Box overflowX="auto">
                {searchResults.map((item) => (
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
                  )
                ))}
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
    null
  );
};

export default EMRPatientSearch;
