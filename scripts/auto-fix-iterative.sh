#!/bin/bash

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Asegurar que el directorio reports existe
mkdir -p reports

# Función para inicializar el archivo de resumen si no existe
init_error_summary() {
    if [ ! -f "reports/error-summary.json" ]; then
        echo '{"total": 0, "eslint": 0, "typescript": 0}' > reports/error-summary.json
    fi
}

# Función para mostrar el progreso
show_progress() {
    local iteration="$1"
    local prev="$2"
    local curr="$3"
    local imp="$4"

    echo -e "${YELLOW}=== Progreso de Corrección Automática ===${NC}"
    echo -e "Iteración: ${iteration}"
    echo -e "Errores antes: ${prev}"
    echo -e "Errores después: ${curr}"
    echo -e "Mejora: ${imp}%"
    echo -e "==========================================${NC}"
}

# Función para contar errores de TypeScript
count_typescript_errors() {
    local ts_output
    ts_output=$(npx tsc --noEmit 2>&1 || true)
    local error_count
    error_count=$(echo "${ts_output}" | grep -c "error TS" || echo "0")
    echo "${error_count}"
}

# Función para contar errores de ESLint
count_eslint_errors() {
    local eslint_output
    eslint_output=$(npx eslint src/**/*.ts 2>/dev/null || true)
    local error_count
    error_count=$(echo "${eslint_output}" | grep -c "error" || echo "0")
    echo "${error_count}"
}

# Función para actualizar el resumen de errores
update_error_summary() {
    local ts_errors="$1"
    local eslint_errors="$2"
    local total
    total=$((ts_errors + eslint_errors))
    echo "{\"total\": ${total}, \"eslint\": ${eslint_errors}, \"typescript\": ${ts_errors}}" > reports/error-summary.json
}

# Función para corregir errores de espacios mixtos
fix_mixed_spaces() {
    echo "Corrigiendo errores de espacios mixtos..."
    find src -type f -name "*.ts" -exec sed -i '' 's/\t/  /g' {} +
    find src -type f -name "*.ts" -exec sed -i '' 's/  \+/  /g' {} +
}

# Función para corregir errores de TypeScript
fix_typescript_errors() {
    echo "Corrigiendo errores de TypeScript..."

    # Corregir errores de tipo en OSCARAdapter
    sed -i '' 's/interface OSCARDemographic {/interface OSCARDemographic {\n  id: string;\n  firstName: string;\n  lastName: string;\n  gender: string;\n  birthDate: string;\n  email?: string;\n  phone?: string;\n  address?: string;\n  city?: string;\n  province?: string;\n  postalCode?: string;\n  healthCardNumber?: string;/' src/services/emr/implementations/OSCARAdapter.ts

    # Corregir errores de tipo en EMRPatientSearchResult
    sed -i '' 's/interface EMRPatientSearchResult {/interface EMRPatientSearchResult {\n  id: string;\n  fullName: string;\n  name: string;\n  birthDate: string;\n  gender: string;\n  mrn: string;\n  documentId?: string;\n  contactInfo?: {\n    email?: string;\n    phone?: string;\n    address?: string;\n  };\n  lastVisit?: Date;/' src/services/emr/EMRAdapter.ts

    # Corregir errores de tipo en EMRConsultation
    sed -i '' 's/interface EMRConsultation {/interface EMRConsultation {\n  id: string;\n  patientId: string;\n  providerId: string;\n  date: Date;\n  reason: string;\n  notes: string;\n  specialty?: string;\n  diagnoses?: EMRDiagnosis[];/' src/services/emr/EMRAdapter.ts

    # Corregir errores de tipo en EMRDiagnosis
    sed -i '' 's/interface EMRDiagnosis {/interface EMRDiagnosis {\n  id: string;\n  patientId: string;\n  date: Date;\n  code: string;\n  system: string;\n  description: string;\n  status: string;\n  type: string;\n  notes?: string;/' src/services/emr/EMRAdapter.ts
}

# Función para corregir errores de ESLint
fix_eslint_errors() {
    echo "Corrigiendo errores de ESLint..."
    npx eslint --fix src/**/*.ts || true
}

# Función para verificar errores
check_errors() {
    echo "Verificando errores..."
    local ts_errors
    ts_errors=$(count_typescript_errors)
    local eslint_errors
    eslint_errors=$(count_eslint_errors)

    # Asegurar que los valores son números
    ts_errors=${ts_errors:-0}
    eslint_errors=${eslint_errors:-0}

    update_error_summary "${ts_errors}" "${eslint_errors}"

    local total
    total=$((ts_errors + eslint_errors))
    echo "${total}"
}

# Función para hacer backup de los archivos
backup_files() {
    echo "Creando backup de los archivos..."
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups/backup_${timestamp}"
    mkdir -p "${backup_dir}"
    cp -r src "${backup_dir}/"
    echo "Backup creado en ${backup_dir}"
}

# Función para restaurar el último backup
restore_backup() {
    echo "Restaurando último backup..."
    local latest_backup
    latest_backup=$(ls -t backups/backup_* 2>/dev/null | head -1)
    if [ -n "${latest_backup}" ]; then
        cp -r "${latest_backup}/src" ./
        echo "Backup restaurado desde ${latest_backup}"
    else
        echo "No se encontraron backups para restaurar"
    fi
}

# Función principal de corrección iterativa
auto_fix_iterative() {
    local iteration=1
    local max_iterations=10
    local previous_errors=999999
    local improvement_threshold=1

    # Inicializar archivo de resumen
    init_error_summary

    # Crear backup inicial
    backup_files

    # Obtener número inicial de errores para el resumen final
    local initial_errors
    initial_errors=$(check_errors)

    while [ "${iteration}" -le "${max_iterations}" ]; do
        echo -e "\n${YELLOW}Iniciando iteración ${iteration}${NC}"

        # Aplicar correcciones
        fix_mixed_spaces
        fix_typescript_errors
        fix_eslint_errors

        # Verificar resultados
        local current_errors
        current_errors=$(check_errors)

        # Calcular mejora (evitar división por cero)
        local improvement=0
        if [ "${previous_errors}" -ne 0 ]; then
            improvement=$(( (previous_errors - current_errors) * 100 / previous_errors ))
        fi

        # Mostrar progreso
        show_progress "${iteration}" "${previous_errors}" "${current_errors}" "${improvement}"

        # Verificar si hemos alcanzado el umbral de mejora
        if [ "${improvement}" -lt "${improvement_threshold}" ] && [ "${iteration}" -gt 1 ]; then
            echo -e "${YELLOW}La mejora es menor al umbral establecido. Deteniendo iteraciones.${NC}"
            break
        fi

        # Actualizar para la siguiente iteración
        previous_errors="${current_errors}"
        iteration=$((iteration + 1))

        # Si no hay errores, terminar
        if [ "${current_errors}" -eq 0 ]; then
            echo -e "${GREEN}¡Todos los errores han sido corregidos!${NC}"
            break
        fi

        # Crear backup después de cada iteración exitosa
        backup_files
    done

    # Mostrar resumen final
    echo -e "\n${YELLOW}=== Resumen Final ===${NC}"
    echo -e "Iteraciones realizadas: $((iteration - 1))"
    echo -e "Errores iniciales: ${initial_errors}"
    echo -e "Errores finales: ${current_errors}"
    if [ "${initial_errors}" -ne 0 ]; then
        local total_improvement
        total_improvement=$(( (initial_errors - current_errors) * 100 / initial_errors ))
        echo -e "Mejora total: ${total_improvement}%"
    else
        echo -e "No había errores iniciales"
    fi
}

# Manejo de errores
set -e
trap 'echo -e "${RED}Error en la ejecución. Restaurando backup...${NC}"; restore_backup; exit 1' ERR

# Ejecutar corrección automática
auto_fix_iterative
