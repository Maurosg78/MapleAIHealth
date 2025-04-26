# MapleAI Health (AiduxCare EMR & Assistant)

## Descripción general
MapleAI Health, también conocido como **AiduxCare**, es una plataforma de Gestión Electrónica de Registros Médicos (EMR) y asistente clínico potenciada por Inteligencia Artificial. Está diseñada para ofrecer a profesionales de la salud herramientas de administración de pacientes, análisis de datos médicos y recomendaciones automatizadas basadas en modelos de lenguaje.

### Componentes principales

1. **EMR (Electronic Medical Records)**
   - Registro y gestión de pacientes, historias clínicas y notas médicas.
   - Módulos de control de citas, tratamientos y seguimiento de signos vitales.
   - Integración con sistemas de bases de datos (MongoDB, Elasticsearch).

2. **Asistente Clínico con IA**
   - Módulo de chat inteligente que ayuda a generar diagnósticos, planes de tratamiento y resúmenes de casos.
   - Utiliza APIs de OpenAI, Anthropic o servicios propios (AIDUXCARE) para procesamiento de lenguaje natural.
   - Evaluación de evidencia clínica y búsquedas en PubMed/Cochrane.

## Características

- Autenticación segura con JWT y refresco de token.
- Control de permisos y rutas protegidas.
- Cache local de datos frecuentes para optimizar rendimiento.
- Frontend en React + Vite + Material-UI.
- Backend (servicio API) en Node.js/Express (desde el SDK de AIDUXCARE o API remotas).
- Testing de componentes e2e, unitarios e integración.

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone <URL_REPOSITORIO>
cd MapleAIHealth

# Instalar dependencias
npm install

# Variables de entorno (crear .env en raíz)
# API_BASE_URL=https://app.aiduxcare.com/api
# OPENAI_API_KEY=<tu_api_key>

# Ejecutar modo desarrollo (frontend)
npm run dev

# Construir aplicación (frontend)
npm run build

# Iniciar servidor de preview de producción
ejecuta: npm run preview
``` 

## Estructura del proyecto

```
/README.md                 → Documentación principal
docs/                      → Guías y diagramas adicionales
src/
  ├─ pages/                → Vistas y rutas de aplicación
  ├─ services/             → Lógica de llamadas a API y utilidades
  ├─ contexts/             → Contextos de React (Auth, Theme, etc.)
  ├─ hooks/                → Hooks personalizados
  ├─ components/           → Componentes UI reutilizables
  ├─ config/               → Constantes y configuración global
  ├─ middleware/           → Middleware (backend) para Express
  └─ styles/               → Estilos globales y teming
scripts/                   → Scripts de utilidad y pruebas simples
tests/                     → Suites de pruebas unitarias e2e
vite.config.ts             → Configuración de Vite
package.json               → Scripts y dependencias
``` 

## Pruebas rápidas de integración

- **Scripts de ejemplo**: `scripts/testLoginSimple.js` para validar el flujo de autenticación contra AIDUXCARE.
- Ejecuta:
  ```bash
  API_BASE_URL=https://app.aiduxcare.com/api node scripts/testLoginSimple.js
  ```

## Contribución

1. Crea un _branch_ para tu feature:
   ```bash
   git checkout -b feature/[nombre]
   ```
2. Implementa y agrega tests.
3. Haz _commit_ y _push_:
   ```bash
   git add .
   git commit -m "feat: descripción corta"
   git push origin feature/[nombre]
   ```
4. Abre un Pull Request en GitHub.

## Licencia
Propietario – Todos los derechos reservados.
