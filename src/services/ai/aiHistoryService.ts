import { api } from '../../lib/api';
import { AIQuery, AIResponse } from './aiService';

export interface AIHistoryEntry {
  id: string;
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
      const response = await api.get(`/ai/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI history:', error);
      return [];
    }
  }

  async addEntry(entry: Omit<AIHistoryEntry, 'id'>): Promise<AIHistoryEntry> {
    try {
      const response = await api.post('/ai/history', entry);
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

export const aiHistoryService = new AIHistoryService();
