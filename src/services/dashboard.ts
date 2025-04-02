import { api } from './api';
import type { DashboardMetrics } from '../types/dashboard';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get<DashboardMetrics>('/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  async getHealthScore(): Promise<number> {
    try {
      const response = await api.get<{ score: number }>(
        '/dashboard/health-score'
      );
      return response.data.score;
    } catch (error) {
      console.error('Error fetching health score:', error);
      throw error;
    }
  },

  async getActivityHistory(): Promise<Array<{ date: string; value: number }>> {
    try {
      const response = await api.get<Array<{ date: string; value: number }>>(
        '/dashboard/activity-history'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching activity history:', error);
      throw error;
    }
  },
};
