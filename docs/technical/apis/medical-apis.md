# Documentación de APIs Médicas

Esta documentación detalla los endpoints disponibles para interactuar con bases de datos médicas externas desde MapleAI Health.

## PubMed API

La integración con PubMed permite buscar y recuperar artículos científicos médicos para su uso en la plataforma.

### Configuración

Para utilizar la API de PubMed, se requiere:

1. **API Key**: Para aumentar los límites de velocidad (opcional pero recomendado)
2. **Email de contacto**: Requerido por PubMed para contacto en caso de uso incorrecto

Estos valores deben configurarse en el archivo `.env`:

```
PUBMED_API_KEY=tu_api_key
PUBMED_CONTACT_EMAIL=tu_email@ejemplo.com
```

### Endpoints Disponibles

#### Búsqueda de Artículos

Permite buscar artículos en PubMed basado en términos de búsqueda.

```typescript
async searchArticles(query: string, maxResults: number = 10): Promise<string[]>
```

**Parámetros:**
- `query` (string): Término de búsqueda
- `maxResults` (number, opcional): Número máximo de resultados (por defecto: 10)

**Retorno:**
- Array de IDs de PubMed (string[])

**Ejemplo:**

```typescript
const pubmedApi = new PubMedApi();
const articleIds = await pubmedApi.searchArticles("diabetes treatment", 5);
// Returns: ["12345678", "23456789", "34567890", "45678901", "56789012"]
```

---

#### Obtener Detalles de Artículo

Recupera información detallada de un artículo específico usando su ID de PubMed.

```typescript
async getArticleDetails(pubmedId: string): Promise<ArticleDetails>
```

**Parámetros:**
- `pubmedId` (string): ID de PubMed del artículo

**Retorno:**
- Objeto `ArticleDetails` con la siguiente estructura:
  ```typescript
  {
    title: string;
    authors: string[];
    abstract?: string;
    publicationDate?: Date;
    journal: string;
  }
  ```

**Ejemplo:**

```typescript
const pubmedApi = new PubMedApi();
const article = await pubmedApi.getArticleDetails("12345678");
// Returns: {
//   title: "Recent advances in diabetes treatment",
//   authors: ["Smith J", "Johnson M", "Williams R"],
//   abstract: "This review examines the latest treatments...",
//   publicationDate: Date("2022-03-15"),
//   journal: "Journal of Clinical Endocrinology"
// }
```

---

#### Búsqueda por DOI

Busca artículos utilizando su DOI (Digital Object Identifier).

```typescript
async searchByDoi(doi: string): Promise<string[]>
```

**Parámetros:**
- `doi` (string): DOI del artículo

**Retorno:**
- Array de IDs de PubMed (string[])

**Ejemplo:**

```typescript
const pubmedApi = new PubMedApi();
const articleIds = await pubmedApi.searchByDoi("10.1056/NEJMoa1200111");
// Returns: ["23456789"]
```

---

#### Búsqueda por Título

Busca artículos por su título exacto.

```typescript
async searchByTitle(title: string): Promise<string[]>
```

**Parámetros:**
- `title` (string): Título del artículo

**Retorno:**
- Array de IDs de PubMed (string[])

**Ejemplo:**

```typescript
const pubmedApi = new PubMedApi();
const articleIds = await pubmedApi.searchByTitle("Effect of Metformin on Glucose Control in Type 2 Diabetes");
// Returns: ["34567890"]
```

### Limitaciones y Consideraciones

- **Límites de Velocidad**: Sin API key, el límite es de 3 solicitudes por segundo. Con API key, 10 solicitudes por segundo.
- **Formato de Respuesta**: Los detalles de artículos se obtienen en formato XML y se convierten a objetos JavaScript.
- **Manejo de Errores**: Todas las funciones incluyen manejo de errores básico con información de diagnóstico en la consola.

### Usos Recomendados

1. **Búsqueda de Evidencia**: Para obtener artículos relevantes a condiciones de pacientes
2. **Validación de Referencias**: Para verificar y obtener detalles completos de artículos citados
3. **Investigación Clínica**: Para acceder a literatura científica actualizada

---

## Próximas Integraciones

### Cochrane Library API

La integración con la biblioteca Cochrane está planificada para una versión futura, permitiendo acceso a revisiones sistemáticas de alta calidad.

### MEDLINE API  

Se planea integración con MEDLINE para acceso a una base de datos más amplia de literatura biomédica. 