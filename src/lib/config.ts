export const config = {
  dataSource: process.env.DATA_SOURCE || 'mock',
  database: {
    url: process.env.DATABASE_URL || '',
  },
} as const;

export type DataSource = 'mock' | 'database';

export const isMockData = (): boolean => {
  return config.dataSource === 'mock';
};

export const isDatabaseData = (): boolean => {
  return config.dataSource === 'database';
};
