// Helper function to check if demo mode is enabled
// Checks both DEMO_MODE (server-side) and NEXT_PUBLIC_DEMO_MODE (client-side)
// DEMO_MODE takes precedence if both are set
const isDemoModeEnabled = (): boolean => {
  // Check server-side DEMO_MODE first (takes precedence)
  const serverValue = process.env.DEMO_MODE;
  if (serverValue !== undefined && serverValue !== null) {
    const truthyValues = new Set(['true', '1', 'yes', 'on']);
    return truthyValues.has(serverValue.toLowerCase());
  }
  
  // Fall back to client-side NEXT_PUBLIC_DEMO_MODE
  const clientValue = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (clientValue !== undefined && clientValue !== null) {
    const truthyValues = new Set(['true', '1', 'yes', 'on']);
    return truthyValues.has(clientValue.toLowerCase());
  }
  
  // Default to true if neither is set
  return true;
};

// Get the schema API base URL based on demo mode
const getSchemaApiBaseUrl = (): string => {
  const isDemo = isDemoModeEnabled();
  if (isDemo) {
    // In demo mode, use local API routes
    return process.env.NEXT_PUBLIC_SCHEMA_API_BASE || '/api/schemas';
  } else {
    // In non-demo mode, use external API URL
    const externalUrl = process.env.NEXT_PUBLIC_URL_SCHEMA_CRUD?.replace(/\/+$/, '') || '';
    return externalUrl ? `${externalUrl}/api/schemas` : '/api/schemas';
  }
};

// Get the data API base URL based on demo mode
const getDataApiBaseUrl = (): string => {
  const isDemo = isDemoModeEnabled();
  if (isDemo) {
    // In demo mode, use local API routes
    return '/api/data';
  } else {
    // In non-demo mode, use external API URL
    const externalUrl = process.env.NEXT_PUBLIC_URL_DATA_CRUD?.replace(/\/+$/, '') || '';
    return externalUrl ? `${externalUrl}/api/data` : '/api/data';
  }
};

export const config = {
  dataSource: process.env.DATA_SOURCE || 'mock',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  schemaApi: {
    basePath: getSchemaApiBaseUrl(),
  },
  dataApi: {
    basePath: getDataApiBaseUrl(),
  },
  relationTypeApi: {
    basePath: process.env.NEXT_PUBLIC_RELATION_TYPE_API_BASE || '/api/data/relation-types',
  },
  demoMode: {
    enabled: isDemoModeEnabled(),
  },
} as const;

export type DataSource = 'mock' | 'database';

export const isMockData = (): boolean => {
  return config.dataSource === 'mock';
};

export const isDatabaseData = (): boolean => {
  return config.dataSource === 'database';
};
