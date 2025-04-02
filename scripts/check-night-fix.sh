#!/bin/bash

# check-night-fix.sh
# Script para verificar el progreso del proceso de corrección automática nocturna
# Autor: Claude AI

# Verificar si el proceso está en ejecución
if [ ! -f logs/night-fix-pid.txt ]; then
  echo "No se encontró ningún proceso de corrección automática en ejecución."
  exit 1
fi

PID=$(cat logs/night-fix-pid.txt)

if ! ps -p "$PID" > /dev/null; then
  echo "El proceso de corrección automática (PID: $PID) ya no está en ejecución."
  echo "Revisa los logs para ver los resultados finales."
  exit 0
fi

# Mostrar el estado actual
echo "Proceso de corrección automática en ejecución (PID: $PID)"

# Mostrar las últimas líneas del log
LATEST_LOG=$(find logs -name "night-fix-output-*.log" -type f -exec ls -t {} \; | head -1)

if [ -f "$LATEST_LOG" ]; then
  echo "Últimas 20 líneas del log ($LATEST_LOG):"
  echo "------------------------------------------------------"
  tail -n 20 "$LATEST_LOG"
  echo "------------------------------------------------------"
else
  echo "No se encontró ningún archivo de log."
fi

# Preguntar si desea detener el proceso
read -p "¿Deseas detener el proceso de corrección automática? (s/n): " RESPONSE
if [ "$RESPONSE" = "s" ] || [ "$RESPONSE" = "S" ]; then
  echo "Deteniendo el proceso (PID: $PID)..."
  kill "$PID"

  # Verificar que el proceso se haya detenido
  sleep 2
  if ! ps -p "$PID" > /dev/null; then
    echo "Proceso detenido correctamente."

    # Mostrar un resumen de los cambios
    BRANCH_NAME=$(git branch --show-current)
    COMMIT_COUNT=$(git rev-list --count HEAD)

    echo "Cambios realizados hasta el momento:"
    echo "- Rama actual: $BRANCH_NAME"
    echo "- Número de commits: $COMMIT_COUNT"

    # Preguntar si desea ver los últimos commits
    read -p "¿Deseas ver los últimos 5 commits? (s/n): " SHOW_COMMITS
    if [ "$SHOW_COMMITS" = "s" ] || [ "$SHOW_COMMITS" = "S" ]; then
      echo "Últimos 5 commits:"
      git log -n 5 --oneline
    fi
  else
    echo "No se pudo detener el proceso. Intenta ejecutar 'kill -9 $PID' manualmente."
  fi
fi

exit 0
