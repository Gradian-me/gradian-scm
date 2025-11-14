import { ApiResponse, PaginationParams } from '../types/common';
import { handleError } from '../errors';
import { config } from '@/lib/config';

// Helper function to resolve API endpoint URL based on demo mode
function resolveApiUrl(endpoint: string): string {
  // If endpoint is already a full URL, return as is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // Handle data API endpoints (with or without trailing slash)
  if (endpoint.startsWith('/api/data')) {
    const path = endpoint.replace('/api/data', '');
    return `${config.dataApi.basePath}${path}`;
  }

  // Handle schema API endpoints (with or without trailing slash)
  if (endpoint.startsWith('/api/schemas')) {
    const path = endpoint.replace('/api/schemas', '');
    return `${config.schemaApi.basePath}${path}`;
  }

  // For other endpoints, use as-is (relative URLs)
  return endpoint;
}

const isDevEnvironment = (): boolean => process.env.NODE_ENV === 'development';

const extractCallerFromStack = (): string | undefined => {
  const stack = new Error().stack;
  if (!stack) return undefined;

  const frames = stack
    .split('\n')
    .map((line) => line.trim())
    // Skip the first frames which belong to Error creation and api helpers themselves
    .slice(3);

  const callerFrame = frames.find(
    (frame) =>
      frame &&
      !frame.includes('ApiClient') &&
      !frame.includes('apiRequest') &&
      !frame.includes('api.ts')
  );

  if (!callerFrame) return undefined;

  // Frame format examples:
  // at someFunction (path:line:column)
  // at path:line:column
  const cleaned = callerFrame.replace(/^at\s+/, '');
  const parts = cleaned.split(' ');

  if (parts.length > 1) {
    return parts[0];
  }

  return cleaned;
};

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Resolve the endpoint URL based on demo mode configuration
    const resolvedEndpoint = resolveApiUrl(endpoint);
    const url = `${this.baseURL}${resolvedEndpoint}`;
    
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      // Add status code to response
      const responseWithStatus: ApiResponse<T> = {
        ...data,
        statusCode: response.status,
      };

      if (!response.ok) {
        // Return error response with status code
        return {
          success: false,
          error: data.error || data.message || `HTTP error! status: ${response.status}`,
          statusCode: response.status,
          data: null as any,
        };
      }

      return responseWithStatus;
    } catch (error) {
      // If it's a network error, we don't have a status code
      const errorResponse = handleError(error);
      return {
        success: false,
        error: errorResponse.message || 'An unexpected error occurred',
        statusCode: undefined,
        data: null as any,
      };
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    requestOptions?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    const result = await this.request<T>(url, {
      ...requestOptions,
      method: 'GET',
    });
    return result;
  }

  async post<T>(
    endpoint: string,
    data?: any,
    requestOptions?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...requestOptions,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    requestOptions?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...requestOptions,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    requestOptions?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...requestOptions,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, requestOptions?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...requestOptions,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

/**
 * Generic API request function for easy usage
 * @param endpoint - The API endpoint
 * @param options - Request options (method, body, headers, etc.)
 * @returns Promise with ApiResponse
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    callerName?: string;
  }
): Promise<ApiResponse<T>> {
  const method = options?.method || 'GET';
  const isDev = isDevEnvironment();
  const callerName = isDev ? options?.callerName || extractCallerFromStack() || 'unknown' : undefined;
  const baseHeaders = options?.headers ? { ...options.headers } : undefined;
  const headersWithCaller =
    isDev && callerName
      ? { ...(baseHeaders || {}), 'x-function-name': callerName }
      : baseHeaders;

  if (isDev && callerName) {
    console.info(`[apiRequest] ${method} ${endpoint} invoked by ${callerName}`);
  }
  
  try {
    switch (method) {
      case 'GET':
        return await apiClient.get<T>(endpoint, options?.params, headersWithCaller ? { headers: headersWithCaller } : undefined);
      case 'POST':
        return await apiClient.post<T>(endpoint, options?.body, headersWithCaller ? { headers: headersWithCaller } : undefined);
      case 'PUT':
        return await apiClient.put<T>(endpoint, options?.body, headersWithCaller ? { headers: headersWithCaller } : undefined);
      case 'PATCH':
        return await apiClient.patch<T>(endpoint, options?.body, headersWithCaller ? { headers: headersWithCaller } : undefined);
      case 'DELETE':
        return await apiClient.delete<T>(endpoint, headersWithCaller ? { headers: headersWithCaller } : undefined);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
      data: null as any,
      statusCode: undefined,
    };
  }
}

export const buildQueryString = (params: PaginationParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  return searchParams.toString();
};

export const formatApiError = (error: any): string => {
  if (error.message) return error.message;
  if (error.error) return error.error;
  return 'An unexpected error occurred';
};
