#!/bin/bash

# start-night-fix.sh
# Script para iniciar el proceso de corrección automática nocturna en segundo plano
# Autor: Claude AI

# Asegurarse de que estamos en la raíz del proyecto
cd "$(git rev-parse --show-toplevel)" || exit 1

# Asegurarse de que los scripts tienen permisos de ejecución
chmod +x scripts/night-auto-fix.sh
chmod +x scripts/fix-*.sh

# Crear directorio de logs si no existe
mkdir -p logs

# Ejecutar el script principal en segundo plano con nohup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/night-fix-output-$TIMESTAMP.log"

echo "Iniciando proceso de corrección automática de errores en segundo plano..."
echo "El proceso se ejecutará durante la noche sin necesidad de intervención."
echo "Puedes seguir el progreso consultando los logs en: $LOG_FILE"

# Ejecutar el script en segundo plano
nohup bash scripts/night-auto-fix.sh > "$LOG_FILE" 2>&1 &

# Guardar el PID para referencia
PID=$!
echo "Proceso iniciado con PID: $PID"
echo "$PID" > logs/night-fix-pid.txt

echo "Para detener el proceso en cualquier momento, ejecuta: kill $PID"
echo "=============================================================="
echo "Puedes cerrar esta terminal. El proceso continuará ejecutándose."

exit 0
