export const API_BASE_URL = 'http://173.208.151.106:8180';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
    register: `${API_BASE_URL}/api/v1/auth/register`,
    verify: `${API_BASE_URL}/api/v1/auth/verify`,
    logout: `${API_BASE_URL}/api/v1/auth/logout`,
  },
  users: {
    list: `${API_BASE_URL}/api/v1/users`,
    get: (id: string) => `${API_BASE_URL}/api/v1/users/${id}`,
    create: `${API_BASE_URL}/api/v1/users`,
    update: (id: string) => `${API_BASE_URL}/api/v1/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/users/${id}`,
    profile: `${API_BASE_URL}/api/v1/users/profile`,
  },
  courses: {
    list: `${API_BASE_URL}/api/v1/courses`,
    detail: (id: string) => `${API_BASE_URL}/api/v1/courses/${id}`,
  },
};