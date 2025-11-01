export const config = {
  dataSource: process.env.DATA_SOURCE || 'mock',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  schemaApi: {
    basePath: process.env.NEXT_PUBLIC_SCHEMA_API_BASE || '/api/schemas',
  },
} as const;

export type DataSource = 'mock' | 'database';

export const isMockData = (): boolean => {
  return config.dataSource === 'mock';
};

export const isDatabaseData = (): boolean => {
  return config.dataSource === 'database';
};
