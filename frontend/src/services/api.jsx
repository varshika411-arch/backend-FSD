const TOKEN_KEY = 'sam_auth_token';

const request = async (method, url, body, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && body !== null && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`/api${url}`, {
    method,
    headers,
    body: body == null ? undefined : isFormData ? body : JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.response = { data, status: response.status };
    throw error;
  }

  return { data };
};

export const api = {
  get: (url, options) => request('GET', url, null, options),
  post: (url, body, options) => request('POST', url, body, options),
  put: (url, body, options) => request('PUT', url, body, options),
  delete: (url, options) => request('DELETE', url, null, options)
};

export { TOKEN_KEY };
