import { EvidenceSource } from '../../../types/clinicalDashboard';
import { BaseSource, VerificationDetails } from './BaseSource';

interface CochraneResponse {
  reviews: Array<{
    id: string;
    title: string;
    authors: string[];
    abstract: string;
    publicationDate: string;
    doi: string;
  }>;
}

export class CochraneSource extends BaseSource {
  private readonly baseUrl = 'https://www.cochranelibrary.com/api';
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey;
  }

  /**
   * Verifica una fuente en Cochrane
   */
  public async verify(source: EvidenceSource): Promise<VerificationDetails> {
    try {
      // Buscar la revisión por DOI o título
      const searchResult = await this.searchReview(source);
      if (!searchResult.exists) {
        return { exists: false };
      }

      // Obtener detalles de la revisión
      if (!searchResult.id) {
        return { exists: false };
      }
      const reviewDetails = await this.getReviewDetails(searchResult.id);
      return {
        exists: true,
        details: {
          title: reviewDetails.title,
          authors: reviewDetails.authors,
          abstract: reviewDetails.abstract,
          publicationDate: new Date(reviewDetails.publicationDate),
          journal: 'Cochrane Database of Systematic Reviews'
        }
      };
    } catch (error) {
      console.error('Error al verificar fuente en Cochrane:', error);
      return { exists: false };
    }
  }

  /**
   * Busca una revisión en Cochrane
   */
  private async searchReview(source: EvidenceSource): Promise<{ exists: boolean; id?: string }> {
    const searchTerms = [
      source.url ? `doi:${this.extractDoi(source.url)}` : '',
      `title:"${this.normalizeTitle(source.name)}"`
    ].filter(Boolean).join(' OR ');

    const searchUrl = `${this.baseUrl}/search?query=${encodeURIComponent(searchTerms)}${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
    
    const response = await fetch(searchUrl);
    const data: CochraneResponse = await response.json();

    if (data.reviews.length === 0) {
      return { exists: false };
    }

    return {
      exists: true,
      id: data.reviews[0].id
    };
  }

  /**
   * Obtiene los detalles de una revisión
   */
  private async getReviewDetails(reviewId: string): Promise<{
    title: string;
    authors: string[];
    abstract: string;
    publicationDate: string;
  }> {
    const detailsUrl = `${this.baseUrl}/reviews/${reviewId}${this.apiKey ? `?api_key=${this.apiKey}` : ''}`;
    
    const response = await fetch(detailsUrl);
    const data = await response.json();

    return {
      title: data.title,
      authors: data.authors,
      abstract: data.abstract,
      publicationDate: data.publicationDate
    };
  }
} 