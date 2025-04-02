
export interface AIHistoryEntry {
import { HttpService } from "../../../lib/api";  id: string;
  query: AIQuery;
  response: AIResponse;
  timestamp: string;
  userId: string;
  feedback?: {
    helpful: boolean;
    comment?: string;
  };
}

class AIHistoryService {
  async getHistory(userId: string): Promise<AIHistoryEntry[]> {
    try {

      return response.data;
    } catch (error) {
      console.error('Error fetching AI history:', error);
      return [];
    }
  }

  async addEntry(entry: Omit<AIHistoryEntry, 'id'>): Promise<AIHistoryEntry> {
    try {

      return response.data;
    } catch (error) {
      console.error('Error adding AI history entry:', error);
      throw error;
    }
  }

  async addFeedback(
    entryId: string,
    feedback: AIHistoryEntry['feedback']
  ): Promise<void> {
    try {
      await api.post(`/ai/history/${entryId}/feedback`, feedback);
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }
}

export
