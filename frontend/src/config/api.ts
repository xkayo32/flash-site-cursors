export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://173.208.151.106:8180';

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
    get: (id: string) => `${API_BASE_URL}/api/v1/courses/${id}`,
    create: `${API_BASE_URL}/api/v1/courses`,
    update: (id: string) => `${API_BASE_URL}/api/v1/courses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/courses/${id}`,
    thumbnail: (id: string) => `${API_BASE_URL}/api/v1/courses/${id}/thumbnail`,
    uploadImage: (id: string) => `${API_BASE_URL}/api/v1/courses/${id}/image`,
    modules: {
      list: (courseId: string) => `${API_BASE_URL}/api/v1/courses/${courseId}/modules`,
      get: (courseId: string, id: string) => `${API_BASE_URL}/api/v1/courses/${courseId}/modules/${id}`,
      create: (courseId: string) => `${API_BASE_URL}/api/v1/courses/${courseId}/modules`,
      update: (courseId: string, id: string) => `${API_BASE_URL}/api/v1/courses/${courseId}/modules/${id}`,
      delete: (courseId: string, id: string) => `${API_BASE_URL}/api/v1/courses/${courseId}/modules/${id}`,
      reorder: (courseId: string) => `${API_BASE_URL}/api/v1/courses/${courseId}/modules/reorder`,
    },
    lessons: {
      list: (moduleId: string) => `${API_BASE_URL}/api/v1/modules/${moduleId}/lessons`,
      get: (moduleId: string, id: string) => `${API_BASE_URL}/api/v1/modules/${moduleId}/lessons/${id}`,
      create: (moduleId: string) => `${API_BASE_URL}/api/v1/modules/${moduleId}/lessons`,
      update: (moduleId: string, id: string) => `${API_BASE_URL}/api/v1/modules/${moduleId}/lessons/${id}`,
      delete: (moduleId: string, id: string) => `${API_BASE_URL}/api/v1/modules/${moduleId}/lessons/${id}`,
      reorder: (moduleId: string) => `${API_BASE_URL}/api/v1/modules/${moduleId}/lessons/reorder`,
      addResource: (moduleId: string, lessonId: string) => `${API_BASE_URL}/api/v1/modules/${moduleId}/lessons/${lessonId}/resources`,
    },
  },
  settings: {
    get: `${API_BASE_URL}/api/v1/settings`,
    update: `${API_BASE_URL}/api/v1/settings`,
    uploadLogo: `${API_BASE_URL}/api/v1/settings/logo`,
  },
  profile: {
    get: `${API_BASE_URL}/api/v1/profile`,
    update: `${API_BASE_URL}/api/v1/profile`,
    uploadAvatar: `${API_BASE_URL}/api/v1/profile/avatar`,
  },
  health: {
    check: `${API_BASE_URL}/api/v1/health`,
  },
  categories: {
    list: `${API_BASE_URL}/api/v1/categories`,
    get: (id: string) => `${API_BASE_URL}/api/v1/categories/${id}`,
    create: `${API_BASE_URL}/api/v1/categories`,
    update: (id: string) => `${API_BASE_URL}/api/v1/categories/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/categories/${id}`,
  },
  dashboard: {
    stats: `${API_BASE_URL}/api/v1/dashboard/stats`,
    activities: `${API_BASE_URL}/api/v1/dashboard/activities`,
    performance: `${API_BASE_URL}/api/v1/dashboard/performance`,
    student: `${API_BASE_URL}/api/v1/dashboard/student`,
  },
};