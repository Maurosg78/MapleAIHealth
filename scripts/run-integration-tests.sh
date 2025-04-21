#!/bin/bash

# Configurar variables de entorno para pruebas
export NODE_ENV=test
export MONGO_URI=mongodb://localhost:27017
export ELASTIC_URI=http://localhost:9200
export DB_NAME=maple_health_test
export COLLECTION_NAME=medical_data_test
export INDEX_NAME=medical_search_test

# Ejecutar pruebas de integración
echo "Ejecutando pruebas de integración..."
jest --config jest.config.js --testMatch "**/src/**/__tests__/**/*.test.ts" --runInBand

# Limpiar recursos de prueba
echo "Limpiando recursos de prueba..."
mongo $MONGO_URI/$DB_NAME --eval "db.dropDatabase()"
curl -X DELETE "$ELASTIC_URI/$INDEX_NAME"

echo "Pruebas de integración completadas" 