
class DashboardService {
import { HttpService } from "../../../lib/api";  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get('/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getRecentActivities() {
    try {
      const response = await api.get('/dashboard/activities');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
