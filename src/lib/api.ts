export interface HttpService {
  get<T>(url: string, params?: Record<string, string | number | boolean>): Promise<T>;
  post<T>(url: string, data?: Record<string, unknown>): Promise<T>;
  put<T>(url: string, data?: Record<string, unknown>): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

class ApiService implements HttpService {
  private readonly baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown>,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, String(params[key]))
      );
    }
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url.toString(), options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, params);
  }
  
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }
  
  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const apiService = new ApiService(
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
);

export default apiService;
