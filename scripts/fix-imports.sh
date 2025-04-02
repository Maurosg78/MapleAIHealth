#!/bin/bash

# Corrige problemas de importación duplicada en componentes
TARGET_FILE="src/components/examples/EMRPatientSearch.tsx"

if [ ! -f "$TARGET_FILE" ]; then
  echo "Archivo no encontrado: $TARGET_FILE"
  exit 1
fi

# Crear backup
BACKUP_DIR="reports/backups-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp "$TARGET_FILE" "$BACKUP_DIR/$(basename $TARGET_FILE)"

echo "Creado backup en $BACKUP_DIR/$(basename $TARGET_FILE)"

# Eliminar imports duplicados y corregir importación de Chakra UI
cat > "$TARGET_FILE" << 'END'
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
END

# Obtener el resto del contenido del archivo original a partir de la línea 70
# Usamos awk para evitar problemas con la cantidad exacta de líneas del encabezado
awk 'NR > 70' "$BACKUP_DIR/$(basename $TARGET_FILE)" >> "$TARGET_FILE"

echo "Corregidos problemas de importación en $TARGET_FILE"
