import { apiRequest } from "./queryClient";

export const api = {
  // Comments
  async getComments(filters?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    const res = await apiRequest("GET", `/api/comments?${params}`);
    return res.json();
  },

  async createComment(data: any) {
    const res = await apiRequest("POST", "/api/comments", data);
    return res.json();
  },

  // Analysis
  async analyzeSentiment(text: string) {
    const res = await apiRequest("POST", "/api/analyze", { text });
    return res.json();
  },

  // Snapshots
  async getSnapshots(range?: string, group?: string) {
    const params = new URLSearchParams();
    if (range) params.append("range", range);
    if (group) params.append("group", group);
    const res = await apiRequest("GET", `/api/snapshots?${params}`);
    return res.json();
  },

  // Authors
  async getAuthors() {
    const res = await apiRequest("GET", "/api/authors");
    return res.json();
  },

  // Suggestions
  async getSuggestions(category?: string) {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    const res = await apiRequest("GET", `/api/suggestions?${params}`);
    return res.json();
  },

  // Topic analysis
  async getTopicBreakdown() {
    const res = await apiRequest("GET", "/api/topic-breakdown");
    return res.json();
  },

  // Geo data
  async getGeoData() {
    const res = await apiRequest("GET", "/api/geo");
    return res.json();
  },

  // Config
  async getConfig() {
    const res = await apiRequest("GET", "/api/config");
    return res.json();
  },

  async updateConfig(data: any) {
    const res = await apiRequest("PUT", "/api/config", data);
    return res.json();
  },

  // Reports
  async generatePDFReport() {
    const res = await apiRequest("POST", "/api/report/pdf");
    return res.json();
  },

  async generateExcelReport() {
    const res = await apiRequest("POST", "/api/report/excel");
    return res.json();
  },

  async generateInfographic() {
    const res = await apiRequest("POST", "/api/report/infographic");
    return res.json();
  },
};
