export const config = {
  dataSource: process.env.DATA_SOURCE || 'mock',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  schemaApi: {
    basePath: process.env.NEXT_PUBLIC_SCHEMA_API_BASE || '/api/schemas',
  },
  relationTypeApi: {
    basePath: process.env.NEXT_PUBLIC_RELATION_TYPE_API_BASE || '/api/data/relation-types',
  },
} as const;

export type DataSource = 'mock' | 'database';

export const isMockData = (): boolean => {
  return config.dataSource === 'mock';
};

export const isDatabaseData = (): boolean => {
  return config.dataSource === 'database';
};
