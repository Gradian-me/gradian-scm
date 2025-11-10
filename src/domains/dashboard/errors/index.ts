import { AppError, NotFoundError, ValidationError } from '@/gradian-ui/shared/errors';

export class DashboardDataNotFoundError extends NotFoundError {
  constructor() {
    super('Dashboard data');
  }
}

export class InvalidDateRangeError extends ValidationError {
  constructor() {
    super('Invalid date range provided');
  }
}

export class InvalidFilterError extends ValidationError {
  constructor(filter: string) {
    super(`Invalid filter: ${filter}`);
  }
}

export class ChartDataError extends ValidationError {
  constructor(chartType: string) {
    super(`Failed to generate chart data for ${chartType}`);
  }
}

export class KpiCalculationError extends ValidationError {
  constructor(kpi: string) {
    super(`Failed to calculate KPI: ${kpi}`);
  }
}

export class PerformanceMetricsError extends ValidationError {
  constructor() {
    super('Failed to calculate performance metrics');
  }
}

export class ActivityDataError extends ValidationError {
  constructor() {
    super('Failed to fetch activity data');
  }
}

export class DeadlineDataError extends ValidationError {
  constructor() {
    super('Failed to fetch deadline data');
  }
}
