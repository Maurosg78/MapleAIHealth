# MapleAI Health

Sistema integrado de gestión médica con asistencia de IA para profesionales de la salud.

## Estado del Proyecto

Actualmente el proyecto se encuentra en la fase final del Sprint 1, con las siguientes funcionalidades disponibles:

- ✅ Sistema completo de autenticación y autorización
- ✅ Gestión de pacientes (CRUD completo)
- ✅ Integración con APIs médicas (PubMed)
- 🚧 Documentación de APIs (en progreso)

Para más detalles, consulte [Estado del Proyecto](.github/STATUS.md).

## Características

### Implementadas

- **Autenticación Segura**: Sistema de login/registro con soporte JWT
- **Recuperación de Contraseña**: Flujo completo para restablecer contraseñas olvidadas
- **Gestión de Pacientes**: CRUD completo con búsqueda avanzada y filtros
- **Consumo de APIs Médicas**: Integración con PubMed para acceso a evidencia científica
- **Roles de Usuario**: Sistema de permisos con múltiples roles (médico, admin)

### Próximas Versiones

- Dashboard clínico con visualización de datos relevantes
- Asistente IA para apoyo en decisiones clínicas
- Registro de interacciones para análisis y mejora continua

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Maurosg78/MapleAIHealth.git

# Navegar al directorio
cd MapleAIHealth

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Material UI
- **Autenticación**: JWT, OAuth 2.0
- **APIs**: PubMed
- **Caché**: React Query

## Contribuir

Si desea contribuir, consulte nuestras [guías de contribución](CONTRIBUTING.md) y revise los issues abiertos en [nuestro tablero de proyecto](https://github.com/users/Maurosg78/projects/2).

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para más detalles.
