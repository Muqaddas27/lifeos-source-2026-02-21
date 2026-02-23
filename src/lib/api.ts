const API_BASE = "/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const cacheKey = `cache_${endpoint}`;
    
    // Check if offline
    if (!navigator.onLine && options.method === "GET") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Something went wrong");
    }

    const data = await response.json();
    
    // Cache GET requests
    if (options.method === "GET" || !options.method) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }

    return data;
  },

  auth: {
    login: (data: any) => api.request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    signup: (data: any) => api.request("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  },

  tasks: {
    getAll: () => api.request("/tasks"),
    create: (data: any) => api.request("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/tasks/${id}`, { method: "DELETE" }),
  },

  habits: {
    getAll: () => api.request("/habits"),
    create: (data: any) => api.request("/habits", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/habits/${id}`, { method: "DELETE" }),
    log: (id: number, data: any) => api.request(`/habits/${id}/log`, { method: "POST", body: JSON.stringify(data) }),
  },

  goals: {
    getAll: () => api.request("/goals"),
    create: (data: any) => api.request("/goals", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/goals/${id}`, { method: "DELETE" }),
  },

  finance: {
    getAll: () => api.request("/finance"),
    create: (data: any) => api.request("/finance", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/finance/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/finance/${id}`, { method: "DELETE" }),
  },

  notes: {
    getAll: () => api.request("/notes"),
    create: (data: any) => api.request("/notes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/notes/${id}`, { method: "DELETE" }),
  },

  notifications: {
    getAll: () => api.request("/notifications"),
    markAsRead: (id: number) => api.request(`/notifications/${id}/read`, { method: "PUT" }),
    markAllAsRead: () => api.request("/notifications/read-all", { method: "PUT" }),
  },

  activityLogs: {
    getAll: () => api.request("/activity-logs"),
  },

  tags: {
    getAll: () => api.request("/tags"),
    create: (data: any) => api.request("/tags", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/tags/${id}`, { method: "DELETE" }),
    getRelations: (type: string, id: number) => api.request(`/tags/relations/${type}/${id}`),
    addRelation: (data: any) => api.request("/tags/relations", { method: "POST", body: JSON.stringify(data) }),
    removeRelation: (tagId: number, type: string, id: number) => api.request(`/tags/relations/${tagId}/${type}/${id}`, { method: "DELETE" }),
  },

  user: {
    getSettings: () => api.request("/user/settings"),
    updateSettings: (data: any) => api.request("/user/settings", { method: "PUT", body: JSON.stringify(data) }),
    deleteAccount: () => api.request("/user/account", { method: "DELETE" }),
    exportData: () => api.request("/user/export"),
    exportSource: () => api.request("/admin/source"),
  },
};
