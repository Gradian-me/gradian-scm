import { ApiResponse, PaginationParams } from '../types/common';
import { handleError } from '../errors';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
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

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    const result = await this.request<T>(url, { method: 'GET' });
    return result;
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
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
  }
): Promise<ApiResponse<T>> {
  const method = options?.method || 'GET';
  
  try {
    switch (method) {
      case 'GET':
        return await apiClient.get<T>(endpoint, options?.params);
      case 'POST':
        return await apiClient.post<T>(endpoint, options?.body);
      case 'PUT':
        return await apiClient.put<T>(endpoint, options?.body);
      case 'PATCH':
        return await apiClient.patch<T>(endpoint, options?.body);
      case 'DELETE':
        return await apiClient.delete<T>(endpoint);
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
