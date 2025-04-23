import { EvidenceSource } from '../../../types/clinicalDashboard';;;;;

export interface VerificationDetails {
  exists: boolean;
  details?: {
    title: string;
    authors: string[];
    abstract?: string;
    publicationDate?: Date;
    journal: string;
  };
}

export abstract class BaseSource {
  /**
   * Verifica una fuente médica
   */
  public abstract verify(source: EvidenceSource): Promise<VerificationDetails>;

  /**
   * Valida una URL
   */
  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extrae el DOI de una URL
   */
  protected extractDoi(url: string): string | null {
    const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
    const match = url.match(doiPattern);
    return match ? match[0] : null;
  }

  /**
   * Normaliza el título de un artículo
   */
  protected normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  }
} 