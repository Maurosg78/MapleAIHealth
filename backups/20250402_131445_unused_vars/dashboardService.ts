
class DashboardService {
import { HttpService } from "../../../lib/api";  async getMetrics(): Promise<DashboardMetrics> {
    try {

      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getRecentActivities() {
    try {

      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }
}

export
