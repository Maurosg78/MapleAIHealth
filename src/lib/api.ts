export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(
      new Error(error.message || 'Error en la respuesta de la API')
    );
  }
);

export interface HttpService {
  get<T>(url: string, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T>;

  post<T>(url: string, data?: unknown, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T>;

  put<T>(url: string, data?: unknown, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T>;

  delete<T>(url: string, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T>;
}

class HttpServiceImpl implements HttpService {
  async get<T>(url: string, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: config?.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(url: string, data?: unknown, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(url: string, data?: unknown, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(url: string, config?: {
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: config?.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export
