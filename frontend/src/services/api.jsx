const TOKEN_KEY = 'sam_auth_token';

const trimTrailingSlash = value => value.replace(/\/+$/, '');

const getApiBase = () => {
  const configuredBase = import.meta.env.VITE_API_BASE?.trim();
  if (configuredBase) {
    return trimTrailingSlash(configuredBase);
  }

  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  return '/api';
};

const API_BASE = getApiBase();

const parseResponse = async response => {
  const raw = await response.text();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw.trim().startsWith('<')
      ? {}
      : { message: raw.trim() };
  }
};

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

  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: body == null ? undefined : isFormData ? body : JSON.stringify(body)
    });
  } catch {
    const origin = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
    const error = new Error(`Unable to reach the server at ${origin}`);
    error.response = { data: { message: error.message }, status: 0 };
    throw error;
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    const message = data.message || `Request failed (${response.status})`;
    const error = new Error(message);
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
