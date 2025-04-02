import React, { useEffect, useState } from 'react';
import { Container, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import EMRSetupForm from '../components/setup/EMRSetupForm';
import { EMRAdapterConfig } from '../services/emr/EMRAdapterFactory';

/**
 * Página de configuración inicial de la aplicación
 */
const SetupPage: React.FC = () => {
  const toast = useToast();
  const [savedConfig, setSavedConfig] = useState<{
    adapterName: string;
    config: EMRAdapterConfig;
  } | null>(null);

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    // En una aplicación real, cargaríamos desde localStorage o una API
    const savedAdapterName = localStorage.getItem('emrAdapterName');
    const savedAdapterConfig = localStorage.getItem('emrAdapterConfig');

    if (savedAdapterName && savedAdapterConfig) {
      try {
        const config = JSON.parse(savedAdapterConfig);
        setSavedConfig({
          adapterName: savedAdapterName,
          config,
        });

        toast({
          title: 'Configuración cargada',
          description: `Configuración de ${savedAdapterName} cargada desde almacenamiento local.`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, [toast]);

  // Manejar la finalización de la configuración
  const handleSetupComplete = (
    adapterName: string,
    config: EMRAdapterConfig
  ) => {
    // Guardar configuración
    localStorage.setItem('emrAdapterName', adapterName);
    localStorage.setItem('emrAdapterConfig', JSON.stringify(config));

    // Actualizar estado
    setSavedConfig({
      adapterName,
      config,
    });
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={2}>
          <Heading as="h1">Configuración de MapleHealth AI</Heading>
          <Text color="gray.600">
            Configura tu conexión con el sistema de Registro Médico Electrónico
            (EMR) para empezar a utilizar MapleHealth AI.
          </Text>
        </VStack>

        <EMRSetupForm
          onSetupComplete={handleSetupComplete}
          initialAdapterName={savedConfig?.adapterName}
          initialConfig={savedConfig?.config}
        />

        {savedConfig && (
          <Text color="green.600" fontWeight="medium">
            Estás utilizando el adaptador {savedConfig.adapterName} con
            configuración personalizada.
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default SetupPage;
