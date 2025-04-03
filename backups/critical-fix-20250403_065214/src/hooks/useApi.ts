interface ApiError {
  message: string;
  status: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Función base para hacer peticiones HTTP
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(error.message);
  }

  return response.json();
}

// Hook para obtener datos
export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: UseQueryOptions<ApiResponse<T>, Error>
) {
  return useQuery<ApiResponse<T>, Error>({
    queryKey: key,
    queryFn: () => fetchApi<T>(url),
    ...options,
  });
}

// Hook para crear datos
export function useApiMutation<T, V>(url: string, queryKey?: string[]) {
  return useMutation<ApiResponse<T>, Error, V>({
    mutationFn: (variables: V) =>
      fetchApi<T>(url, {
        method: 'POST',
        body: JSON.stringify(variables),
      }),
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

// Hook para actualizar datos
export function useApiUpdate<T, V>(url: string, queryKey?: string[]) {
  return useMutation<ApiResponse<T>, Error, V>({
    mutationFn: (variables: V) =>
      fetchApi<T>(url, {
        method: 'PUT',
        body: JSON.stringify(variables),
      }),
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

// Hook para eliminar datos
export function useApiDelete<T>(url: string, queryKey?: string[]) {
  return useMutation<ApiResponse<T>, Error, void>({
    mutationFn: () =>
      fetchApi<T>(url, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
