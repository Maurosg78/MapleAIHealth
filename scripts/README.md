# Scripts para Sincronización con GitHub Projects

Este directorio contiene varios scripts para sincronizar información del proyecto MapleAI Health con tableros de GitHub Projects, permitiendo mantener actualizado el estado del proyecto de forma automatizada.

## Requisitos Previos

Para utilizar estos scripts, necesitarás:

1. **Token de Acceso Personal de GitHub**: Con permisos para:
   - `repo` (acceso completo al repositorio)
   - `project` (acceso a los proyectos)

   Puedes crear un token en [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)

2. **Dependencias**: Según el script que elijas utilizar

## Scripts Disponibles

### 1. Script de Node.js (Recomendado)

El script `sync_github_projects_v2.js` utiliza la API GraphQL de GitHub para sincronizar con GitHub Projects v2 (la versión actual).

#### Instalación

```bash
# Instalar dependencias
cd scripts
npm install
```

#### Uso

```bash
GITHUB_TOKEN=tu_token_personal_aquí npm run sync
```

### 2. Script de Python

El script `sync_github_projects.py` es una alternativa que utiliza Python.

#### Instalación

```bash
# Instalar dependencias
pip install requests
```

#### Uso

```bash
GITHUB_TOKEN=tu_token_personal_aquí python sync_github_projects.py
```

### 3. Script de Shell (Bash)

El script `sync_github_project.sh` usa cURL y jq para interactuar con la API de GitHub.

#### Instalación

Asegúrate de tener instalado `jq`:

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Fedora
sudo dnf install jq
```

#### Uso

```bash
GITHUB_TOKEN=tu_token_personal_aquí ./sync_github_project.sh
```

## Qué hacen estos scripts

1. **Crean issues** basados en la información de STATUS.md
2. **Asocian los issues** al tablero de GitHub Projects
3. **Organizan los issues** en las columnas correctas (Todo, In Progress, Done)

## Solución de problemas

Si encuentras errores:

1. **Verifica tu token**: Asegúrate de que tenga los permisos correctos
2. **Verifica la configuración**: El número de proyecto y el nombre de usuario/organización
3. **Revisa los logs**: Los scripts muestran información detallada de los errores

## Personalización

Si necesitas personalizar los scripts:

1. Modifica los nombres de las tareas y descripciones
2. Ajusta las etiquetas aplicadas a cada issue
3. Cambia el propietario/repositorio si es necesario 