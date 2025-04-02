
export const dashboardService = {
import { HttpService } from "../../../lib/api";  async getMetrics(): Promise<DashboardMetrics> {
    try {

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
       value: number }>>(
        '/dashboard/activity-history'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching activity history:', error);
      throw error;
    }
  },
};
