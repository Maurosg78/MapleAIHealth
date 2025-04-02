import React, { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

    setIsLoading(true);

    try {
      const emrService = new EMRService();
      const emrConfig = EMRConfigService.getActiveEMR();

      if (!emrConfig) {
        throw new Error('No hay EMR configurado');
      }

      const adapter = EMRAdapter.create(emrConfig.type, emrConfig.config);
      const results = await adapter.searchPatients(searchTerm);

      setSearchResults(results as ExtendedEMRPatientSearchResult[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al buscar pacientes',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };
} from '../../services/emr/EMRAdapter';

/**
 * Componente de ejemplo para búsqueda de pacientes utilizando el adaptador EMR configurado
 */
const EMRPatientSearch: React.FC = () => {
  const toast = useToast();
  const emrConfig = EMRConfigService.getInstance();

  // Estado para el formulario de búsqueda
  const [searchQuery, setSearchQuery] = useState<EMRSearchQuery>({
    name: '',
    documentId: '',
    email: '',
    phone: '',
  });

  // Estado para los resultados de búsqueda
  const [searchResults, setSearchResults] = useState<EMRPatientSearchResult[]>(
    []
  );

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
    // Verificar que al menos un campo tenga valor
    if (
      !searchQuery.name &&
      !searchQuery.documentId &&
      !searchQuery.email &&
      !searchQuery.phone
    ) {
      toast({
        title: 'Búsqueda incompleta',
        description: 'Por favor, introduce al menos un criterio de búsqueda.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSearching(true);

      // Obtener adaptador EMR configurado
      const emrAdapter = emrConfig.getAdapter();
      const adapterName = emrConfig.getCurrentAdapterName();

      // Realizar búsqueda
      const results = await emrAdapter.searchPatients(searchQuery, 10);

      setSearchResults(results);
      setHasSearched(true);

      toast({
        title: `Búsqueda realizada (${adapterName})`,
        description: `Se encontraron ${results.length} resultados.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error en la búsqueda',
        description: `Error: ${(error as Error).message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
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
      <VStack spacing={6} align="stretch">
        <Heading size="md">Búsqueda de Pacientes</Heading>
        <Text fontSize="sm" color="gray.600">
          Este componente utiliza el adaptador EMR configurado (
          {emrConfig.getCurrentAdapterName()}) para buscar pacientes en el
          sistema.
        </Text>

        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Nombre</FormLabel>
            <Input
              placeholder="Ej. Juan García"
              value={searchQuery.name ?? ''}
              onChange={(e) => handleSearchChange('name', e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Documento de Identidad</FormLabel>
            <Input
              placeholder="Ej. 12345678X o Número de Seguro"
              value={searchQuery.documentId ?? ''}
              onChange={(e) => handleSearchChange('documentId', e.target.value)}
            />
          </FormControl>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Ej. paciente@correo.com"
                value={searchQuery.email ?? ''}
                type="email"
                onChange={(e) => handleSearchChange('email', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Teléfono</FormLabel>
              <Input
                placeholder="Ej. 612345678"
                value={searchQuery.phone ?? ''}
                onChange={(e) => handleSearchChange('phone', e.target.value)}
              />
            </FormControl>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={4} justify="flex-end">
          <Button variant="outline" onClick={handleClear}>
            Limpiar
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleSearch}
            isLoading={isSearching}
            loadingText="Buscando"
          >
            Buscar Paciente
          </Button>
        </Stack>

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
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Nombre</Th>
                      <Th>Fecha Nacimiento</Th>
                      <Th>Género</Th>
                      <Th>Nº Historia</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {searchResults.map((patient) => (
                      <Tr key={patient.id}>
                        <Td>{patient.id}</Td>
                        <Td>{patient.name}</Td>
                        <Td>{patient.birthDate}</Td>
                        <Td>{patient.gender}</Td>
                        <Td>{patient.mrn || '-'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default EMRPatientSearch;
