import { DashboardStats, SpendAnalysisData, KpiCard, ActivityItem, DeadlineItem } from '../types';
import { IDashboardRepository, dashboardRepository } from '../repositories/dashboard.repository';
import { 
  DashboardDataNotFoundError,
  InvalidDateRangeError,
  InvalidFilterError,
  ChartDataError,
  KpiCalculationError,
  PerformanceMetricsError,
  ActivityDataError,
  DeadlineDataError
} from '../errors';
import { dashboardFiltersSchema } from '../schemas';
import { validateFormData } from '@/gradian-ui/shared/utils/validation';

export interface IDashboardService {
  getDashboardStats(filters?: any): Promise<DashboardStats>;
  getSpendAnalysisData(filters?: any): Promise<SpendAnalysisData>;
  getKpiCards(): Promise<KpiCard[]>;
  getRecentActivity(limit?: number): Promise<ActivityItem[]>;
  getUpcomingDeadlines(limit?: number): Promise<DeadlineItem[]>;
  getPerformanceMetrics(): Promise<any>;
  validateFilters(filters: any): { success: true; data: any } | { success: false; errors: Record<string, string> };
}

export class DashboardService implements IDashboardService {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async getDashboardStats(filters?: any): Promise<DashboardStats> {
    // Validate filters if provided
    if (filters) {
      const validation = this.validateFilters(filters);
      if (!validation.success) {
        throw new InvalidFilterError('Invalid filter parameters');
      }
    }

    try {
      return await this.dashboardRepository.getDashboardStats();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new DashboardDataNotFoundError();
      }
      throw error;
    }
  }

  async getSpendAnalysisData(filters?: any): Promise<SpendAnalysisData> {
    // Validate filters if provided
    if (filters) {
      const validation = this.validateFilters(filters);
      if (!validation.success) {
        throw new InvalidFilterError('Invalid filter parameters');
      }
    }

    try {
      return await this.dashboardRepository.getSpendAnalysisData();
    } catch (error) {
      throw new ChartDataError('spend analysis');
    }
  }

  async getKpiCards(): Promise<KpiCard[]> {
    try {
      return await this.dashboardRepository.getKpiCards();
    } catch (error) {
      throw new KpiCalculationError('KPI cards');
    }
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    try {
      const activities = await this.dashboardRepository.getRecentActivity();
      return activities.slice(0, limit);
    } catch (error) {
      throw new ActivityDataError();
    }
  }

  async getUpcomingDeadlines(limit: number = 10): Promise<DeadlineItem[]> {
    try {
      const deadlines = await this.dashboardRepository.getUpcomingDeadlines();
      return deadlines.slice(0, limit);
    } catch (error) {
      throw new DeadlineDataError();
    }
  }

  async getPerformanceMetrics(): Promise<any> {
    try {
      return await this.dashboardRepository.getPerformanceMetrics();
    } catch (error) {
      throw new PerformanceMetricsError();
    }
  }

  validateFilters(filters: any): { success: true; data: any } | { success: false; errors: Record<string, string> } {
    return validateFormData(dashboardFiltersSchema, filters);
  }
}

export const dashboardService = new DashboardService(dashboardRepository);
