import { medicalConfig } from '../../../config/medicalConfig';

interface PubMedSearchResponse {
  esearchresult: {
    idlist: string[];
    count: string;
    retmax: string;
    retstart: string;
  };
}

interface RequestOptions {
  tool: string;
  email: string;
  retmax?: number;
  retmode?: 'json' | 'xml';
}

interface UrlParams {
  [key: string]: string | number | undefined;
}

interface ArticleDetails {
  title: string;
  authors: string[];
  abstract?: string;
  publicationDate?: Date;
  journal: string;
}

export class PubMedApi {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly defaultOptions: RequestOptions;
  private lastRequestTime: number = 0;
  private readonly requestDelay: number;

  constructor() {
    this.baseUrl = medicalConfig.pubmed.baseUrl;
    this.apiKey = medicalConfig.pubmed.apiKey;
    this.requestDelay = this.apiKey ? 100 : 333; // 10 req/sec con API key, 3 req/sec sin ella
    this.defaultOptions = {
      tool: 'MapleAIHealth',
      email: medicalConfig.pubmed.contactEmail || 'no-reply@mapleaihealth.com',
      retmax: 10,
      retmode: 'json'
    };
  }

  /**
   * Maneja el límite de velocidad de las solicitudes
   */
  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Construye la URL con los parámetros comunes
   */
  private buildUrl(base: string, params: UrlParams): string {
    const allParams = {
      ...params,
      tool: this.defaultOptions.tool,
      email: this.defaultOptions.email,
      api_key: this.apiKey
    };

    const queryString = Object.entries(allParams)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    return `${base}?${queryString}`;
  }

  /**
   * Busca artículos en PubMed
   */
  public async searchArticles(query: string, maxResults: number = 10): Promise<string[]> {
    await this.throttleRequest();
    
    const url = this.buildUrl(`${this.baseUrl}/esearch.fcgi`, {
      db: 'pubmed',
      term: query,
      retmax: maxResults,
      retmode: this.defaultOptions.retmode
    });
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PubMedSearchResponse = await response.json();
      return data.esearchresult.idlist;
    } catch (error) {
      console.error('Error al buscar artículos en PubMed:', error);
      throw new Error('Error al buscar artículos en PubMed');
    }
  }

  /**
   * Obtiene los detalles de un artículo específico
   */
  public async getArticleDetails(pubmedId: string): Promise<ArticleDetails> {
    const detailsUrl = this.buildUrl(`${this.baseUrl}/efetch.fcgi`, {
      db: 'pubmed',
      id: pubmedId,
      retmode: 'xml'
    });
    
    try {
      const response = await fetch(detailsUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const article = xmlDoc.getElementsByTagName('Article')[0];
      const journal = article?.getElementsByTagName('Journal')[0];
      const title = article?.getElementsByTagName('ArticleTitle')[0]?.textContent || '';
      const abstract = article?.getElementsByTagName('AbstractText')[0]?.textContent || undefined;
      
      const authors = Array.from(article?.getElementsByTagName('Author') || [])
        .map(author => {
          const lastName = author.getElementsByTagName('LastName')[0]?.textContent || '';
          const foreName = author.getElementsByTagName('ForeName')[0]?.textContent || '';
          const initials = author.getElementsByTagName('Initials')[0]?.textContent || '';
          return `${lastName} ${foreName} ${initials}`.trim();
        });

      const pubDate = article?.getElementsByTagName('PubDate')[0];
      const year = pubDate?.getElementsByTagName('Year')[0]?.textContent || '';
      const month = pubDate?.getElementsByTagName('Month')[0]?.textContent || '1';
      const day = pubDate?.getElementsByTagName('Day')[0]?.textContent || '1';
      
      const publicationDate = year ? new Date(`${year}-${month}-${day}`) : undefined;
      const journalTitle = journal?.getElementsByTagName('Title')[0]?.textContent || '';

      return {
        title,
        authors,
        abstract,
        publicationDate,
        journal: journalTitle
      };
    } catch (error) {
      console.error('Error al obtener detalles del artículo:', error);
      throw new Error('Error al obtener detalles del artículo');
    }
  }

  /**
   * Busca artículos por DOI
   */
  public async searchByDoi(doi: string): Promise<string[]> {
    return this.searchArticles(`"${doi}"[doi]`);
  }

  /**
   * Busca artículos por título
   */
  public async searchByTitle(title: string): Promise<string[]> {
    return this.searchArticles(`"${title}"[title]`);
  }
} 