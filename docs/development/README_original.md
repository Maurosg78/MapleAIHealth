# MapleAI Health

## Descripción

MapleAI Health es una plataforma inteligente para profesionales de la salud que combina un sistema de registro médico electrónico (EMR) con asistencia de IA para toma de decisiones clínicas basadas en evidencia.

## Instalación

1. Clona el repositorio:

    ```bash
    git clone https://github.com/Maurosg78/MapleAIHealth.git
    cd MapleAIHealth
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

## MVP: Reorganización del Proyecto

Para la implementación del MVP se ha reorganizado el proyecto en tres sprints secuenciales:

1. **Sprint 1: MVP Core** - Infraestructura base y seguridad
2. **Sprint 2: MVP Clínico** - Gestión de evidencia médica
3. **Sprint 3: MVP Asistente** - IA y experiencia de usuario

Para más detalles, consulta [MVP_README.md](./MVP_README.md).

### Configuración del Script de Reorganización

Para ejecutar el script que reorganiza los issues y sprints en GitHub:

1. Crea un token de acceso personal de GitHub con permisos de repo
2. Crea un archivo `.env` en la raíz del proyecto:
   ```
   GITHUB_TOKEN=tu_token_de_github
   ```
3. Ejecuta el script:
   ```bash
   node scripts/reorganizeMVPSprint.js
   ```

## Configuración de ESLint y Prettier

Este proyecto utiliza ESLint y Prettier para mantener un código limpio y consistente. Asegúrate de tener las siguientes extensiones instaladas en tu editor:

- ESLint
- Prettier

### Scripts

- **Desarrollo**: Para iniciar el servidor de desarrollo:
    ```bash
    npm run dev
    ```

- **Lint**: Para verificar problemas de código:
    ```bash
    npm run lint
    ```

- **Format**: Para formatear el código:
    ```bash
    npm run format
    ```

- **Test**: Para ejecutar las pruebas:
    ```bash
    npm run test
    ```

## Estructura del Proyecto

- `src/`: Contiene el código fuente de la aplicación.
    - `components/`: Componentes reutilizables.
    - `services/`: Servicios para manejar la lógica de negocio.
    - `hooks/`: Hooks personalizados.
    - `pages/`: Páginas de la aplicación.
    - `types/`: Tipos TypeScript utilizados en la aplicación.
    - `config/`: Configuración de la aplicación.

## APIs Externas

El proyecto utiliza las siguientes APIs externas:

- **PubMed**: Para búsqueda de evidencia médica científica
- **Cochrane Library**: Para acceso a revisiones sistemáticas
- **MongoDB**: Para almacenamiento de datos
- **Elasticsearch**: Para búsqueda eficiente

## Contribución

Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1. Revisa los issues abiertos o crea uno nuevo.
2. Haz un fork del repositorio.
3. Crea una rama específica para tu contribución (`git checkout -b feature/nueva-funcionalidad`).
4. Realiza tus cambios siguiendo los estándares de código del proyecto.
5. Ejecuta las pruebas y asegúrate de que pasan.
6. Crea un Pull Request con una descripción clara de los cambios.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
