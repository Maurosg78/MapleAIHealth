import crypto from 'crypto';
import { Logger } from '../../../lib/logger';
import { PatientData } from '../types';

export class EPICAdapter {
  private logger = new Logger('EPICAdapter');

  constructor(private baseUrl: string, private apiKey: string) {
    this.logger.info('EPICAdapter initialized');
  }

  async searchPatients(query: string): Promise<PatientData[]> {
    this.logger.info(`Searching patients with query: ${query}`);
    
    // Simulado para simplificar
    return [
      {
        id: crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1980-01-01',
        gender: 'F',
        email: 'test@example.com',
        phone: '555-555-5555',
        address: '123 Test St, Test City, TS 12345'
      }
    ];
  }

  mapStatus(status: string): "active" | "inactive" | "pending" | "cancelled" | "completed" {
    switch (status.toLowerCase()) {
      case 'active': return 'active' as const;
      case 'inactive': return 'inactive' as const;
      case 'pending': return 'pending' as const;
      case 'cancelled': return 'cancelled' as const;
      case 'completed': return 'completed' as const;
      default: return 'active' as const;
    }
  }
}

export default EPICAdapter;
