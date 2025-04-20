import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'PUBMED_API_KEY', 
  'COCHRANE_API_KEY',
  'MONGO_URI',
  'ELASTIC_URI'
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Advertencia: ${envVar} no está definida en las variables de entorno`);
  }
}

// Configuración base
export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Configuración de APIs médicas
  medical: {
    pubmed: {
      apiKey: process.env.PUBMED_API_KEY,
      baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
      contactEmail: process.env.PUBMED_CONTACT_EMAIL
    },
    cochrane: {
      apiKey: process.env.COCHRANE_API_KEY,
      baseUrl: 'https://www.cochranelibrary.com/api'
    },
    cache: {
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 86400000, // 24 horas
      maxSize: process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE) : 1000
    }
  },

  // Configuración de búsqueda
  search: {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    elasticUri: process.env.ELASTIC_URI || 'http://localhost:9200',
    databaseName: process.env.DB_NAME || 'maple_health',
    collectionName: process.env.COLLECTION_NAME || 'medical_data',
    indexName: process.env.INDEX_NAME || 'medical_search'
  }
}; 