# Maple AI Health

Sistema de asistencia clínica basado en IA para profesionales de la salud.

## Características Principales

- 🤖 Asistente clínico IA integrado
- 📊 Dashboard de interacciones en tiempo real
- 📝 Integración con notas SOAP
- 🔍 Sistema de sugerencias contextuales
- 📈 Análisis de datos clínicos
- 🌐 Soporte multilenguaje

## Requisitos Previos

- Node.js >= 18
- npm >= 9
- OpenAI API Key

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Maurosg78/MapleAIHealth.git
cd MapleAIHealth
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
- Copiar `.env.example` a `.env`
- Configurar la API key de OpenAI
- Ajustar otras configuraciones según sea necesario

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── components/         # Componentes React
│   ├── assistant/     # Componentes del asistente IA
│   ├── patients/      # Componentes de gestión de pacientes
│   └── interactions/  # Componentes de tracking
├── services/          # Servicios y lógica de negocio
│   ├── ai/           # Servicios de IA
│   └── interactions/ # Servicios de tracking
├── models/           # Modelos y tipos
├── hooks/            # Hooks personalizados
└── config/          # Archivos de configuración
```

## Documentación

- [Documentación Técnica](./docs/TECHNICAL.md)
- [Guía de Usuario](./docs/USER_GUIDE.md)
- [Documentación de API](./docs/API.md)
- [Cierre del Sprint](./docs/SPRINT_CLOSURE.md)

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con coverage
npm run test:coverage
```

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Estado del Proyecto

- ✅ Sprint actual completado
- 🔄 Pruebas unitarias en progreso
- 📝 Documentación actualizada
- 🚀 Listo para despliegue

## Contacto

Mauricio Sobarzo - [@Maurosg78](https://github.com/Maurosg78)
