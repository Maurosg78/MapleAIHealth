#!/bin/bash

# Script para corregir interfaces en los adaptadores EMR

# Colores para terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW}    CORRECCIÓN DE INTERFACES EMR       ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Fecha: $(date)"
echo

# Directorio para guardar backups
BACKUP_DIR="reports/backups-interfaces-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}Creado directorio de backup: $BACKUP_DIR${NC}"

# Función para registrar acciones
log_action() {
  echo -e "$1"
}

# 1. Corregir ClinicCloudAdapter.ts
CLINIC_ADAPTER="src/services/emr/implementations/ClinicCloudAdapter.ts"
if [ -f "$CLINIC_ADAPTER" ]; then
  log_action "${YELLOW}Procesando $CLINIC_ADAPTER...${NC}"

  # Crear backup
  cp "$CLINIC_ADAPTER" "$BACKUP_DIR/$(basename $CLINIC_ADAPTER)"
  log_action "${GREEN}Creado backup en $BACKUP_DIR/$(basename $CLINIC_ADAPTER)${NC}"

  # Corregir propiedades con modificadores inconsistentes
  sed -i '' 's/\(diagnosticos\): /\1?: /g' "$CLINIC_ADAPTER"
  sed -i '' 's/\(fechaFin\): /\1?: /g' "$CLINIC_ADAPTER"
  sed -i '' 's/\(instrucciones\): /\1?: /g' "$CLINIC_ADAPTER"
  sed -i '' 's/\(descripcion\): /\1?: /g' "$CLINIC_ADAPTER"
  sed -i '' 's/\(consultaId\): /\1?: /g' "$CLINIC_ADAPTER"

  # Definir tipos más específicos para reemplazar 'any'
  sed -i '' 's/: any\[\]/: unknown[]/g' "$CLINIC_ADAPTER"
  sed -i '' 's/: any;/: unknown;/g' "$CLINIC_ADAPTER"
  sed -i '' 's/: any)/: unknown)/g' "$CLINIC_ADAPTER"

  # Corregir las interfaces de resultados
  sed -i '' 's/interface ClinicCloudSearchResult {/interface ClinicCloudSearchResult {\n  pacientes: ClinicCloudPaciente[];\n  totalResultados: number;/g' "$CLINIC_ADAPTER"
  sed -i '' 's/interface ClinicCloudConsultaResult {/interface ClinicCloudConsultaResult {\n  consultas: ClinicCloudConsulta[];/g' "$CLINIC_ADAPTER"
  sed -i '' 's/interface ClinicCloudTratamientoResult {/interface ClinicCloudTratamientoResult {\n  tratamientos: ClinicCloudTratamiento[];/g' "$CLINIC_ADAPTER"
  sed -i '' 's/interface ClinicCloudDiagnosticoResult {/interface ClinicCloudDiagnosticoResult {\n  diagnosticos: ClinicCloudDiagnostico[];/g' "$CLINIC_ADAPTER"
  sed -i '' 's/interface ClinicCloudLabResult {/interface ClinicCloudLabResult {\n  resultados: ClinicCloudResultadoLab[];/g' "$CLINIC_ADAPTER"
  sed -i '' 's/interface ClinicCloudMetricaResult {/interface ClinicCloudMetricaResult {\n  metricas: ClinicCloudMetrica[];/g' "$CLINIC_ADAPTER"

  # Corregir propiedades específicas
  sed -i '' 's/valor: number/valor: string | number/g' "$CLINIC_ADAPTER"

  log_action "${GREEN}Corregidas interfaces en $CLINIC_ADAPTER${NC}"
else
  log_action "${RED}No se encontró $CLINIC_ADAPTER${NC}"
fi

# 2. Corregir OSCARAdapter.ts
OSCAR_ADAPTER="src/services/emr/implementations/OSCARAdapter.ts"
if [ -f "$OSCAR_ADAPTER" ]; then
  log_action "${YELLOW}Procesando $OSCAR_ADAPTER...${NC}"

  # Crear backup
  cp "$OSCAR_ADAPTER" "$BACKUP_DIR/$(basename $OSCAR_ADAPTER)"
  log_action "${GREEN}Creado backup en $BACKUP_DIR/$(basename $OSCAR_ADAPTER)${NC}"

  # Corregir interfaz EMRPatientSearchResult para incluir fullName
  sed -i '' 's/interface EMRPatientSearchResult {/interface EMRPatientSearchResult {\n  fullName: string;/g' "$OSCAR_ADAPTER"

  # Actualizar transformaciones de tipos
  sed -i '' 's/\(return results.map\)(patient => ({/\1((patient): EMRPatientSearchResult => ({/g' "$OSCAR_ADAPTER"

  # Corregir propiedades ausentes
  sed -i '' 's/demographicNo/id/g' "$OSCAR_ADAPTER"
  sed -i '' 's/firstName lastName/name/g' "$OSCAR_ADAPTER"
  sed -i '' 's/dateOfBirth/birthDate/g' "$OSCAR_ADAPTER"

  # Asegurar que se use interfaz correcta para MedicalHistoryResult
  cat << 'EOF' > /tmp/medical_history_interface.txt
interface MedicalHistoryResult {
  allergies: {
    id: string;
    description: string;
    reaction?: string;
    severity?: string;
  }[];
  chronicConditions: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate?: string;
    endDate?: string;
  }[];
  surgeries: {
    procedure: string;
    date: string;
    notes?: string;
  }[];
  familyHistory: Record<string, string[]>;
}
EOF

  # Buscar la posición de la primera interfaz para insertar
  FIRST_INTERFACE_LINE=$(grep -n "interface" "$OSCAR_ADAPTER" | head -1 | cut -d ':' -f 1)
  if [ -n "$FIRST_INTERFACE_LINE" ]; then
    # Insertar la nueva interfaz antes de la primera interfaz existente
    sed -i '' "${FIRST_INTERFACE_LINE}i\\
$(cat /tmp/medical_history_interface.txt)
" "$OSCAR_ADAPTER"
  fi

  log_action "${GREEN}Corregidas interfaces en $OSCAR_ADAPTER${NC}"
else
  log_action "${RED}No se encontró $OSCAR_ADAPTER${NC}"
fi

# 3. Corregir EMRAdapter.ts para asegurar consistencia
EMR_ADAPTER="src/services/emr/EMRAdapter.ts"
if [ -f "$EMR_ADAPTER" ]; then
  log_action "${YELLOW}Procesando $EMR_ADAPTER...${NC}"

  # Crear backup
  cp "$EMR_ADAPTER" "$BACKUP_DIR/$(basename $EMR_ADAPTER)"
  log_action "${GREEN}Creado backup en $BACKUP_DIR/$(basename $EMR_ADAPTER)${NC}"

  # Asegurar que las interfaces base sean consistentes con las implementaciones
  cat << 'EOF' > /tmp/emr_patient_search_interface.txt
export interface EMRPatientSearchResult {
  id: string;
  fullName: string;
  name: string;
  birthDate: string;
  gender: string;
  mrn: string;
}
EOF

  # Reemplazar la definición existente con la nueva definición
  sed -i '' '/export interface EMRPatientSearchResult {/,/}/c\
'"$(cat /tmp/emr_patient_search_interface.txt)" "$EMR_ADAPTER"

  log_action "${GREEN}Corregidas interfaces en $EMR_ADAPTER${NC}"
else
  log_action "${RED}No se encontró $EMR_ADAPTER${NC}"
fi

echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW}   CORRECCIÓN DE INTERFACES COMPLETADA  ${NC}"
echo -e "${YELLOW}=======================================${NC}"
