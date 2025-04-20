import { EvidenceSource } from '../../../types/clinicalDashboard';
import { BaseSource, VerificationDetails } from './BaseSource';
import { PubMedApi } from '../api/PubMedApi';

export class PubMedSource extends BaseSource {
  private readonly api: PubMedApi;

  constructor() {
    super();
    this.api = new PubMedApi();
  }

  /**
   * Verifica una fuente en PubMed
   */
  public async verify(source: EvidenceSource): Promise<VerificationDetails> {
    try {
      let pubmedIds: string[] = [];

      // Intentar buscar por DOI si está disponible
      if (source.url) {
        const doi = this.extractDoi(source.url);
        if (doi) {
          pubmedIds = await this.api.searchByDoi(doi);
        }
      }

      // Si no se encontró por DOI, intentar por título
      if (pubmedIds.length === 0) {
        pubmedIds = await this.api.searchByTitle(source.name);
      }

      // Si no se encontró el artículo
      if (pubmedIds.length === 0) {
        return { exists: false };
      }

      // Obtener detalles del primer artículo encontrado
      const articleDetails = await this.api.getArticleDetails(pubmedIds[0]);
      
      return {
        exists: true,
        details: {
          title: articleDetails.title,
          authors: articleDetails.authors,
          abstract: articleDetails.abstract || undefined,
          publicationDate: articleDetails.publicationDate,
          journal: articleDetails.journal
        }
      };
    } catch (error) {
      console.error('Error al verificar fuente en PubMed:', error);
      return { exists: false };
    }
  }
} 