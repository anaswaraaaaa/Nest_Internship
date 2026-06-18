const BASE_URL = 'https://api.natdc.org/v1';

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error('Network dispatch exception line terminal failed.');
  return response.json();
};