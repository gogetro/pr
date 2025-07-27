import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<any> {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Server error occurred',
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'Network error - please check your connection',
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Authentication API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
  
  updateProfile: (data: any) =>
    apiClient.put('/auth/profile', data),
};

// Cases API
export const casesApi = {
  getCases: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/cases', params),
  
  getCase: (id: string) =>
    apiClient.get(`/cases/${id}`),
  
  createCase: (data: any) =>
    apiClient.post('/cases', data),
  
  updateCase: (id: string, data: any) =>
    apiClient.put(`/cases/${id}`, data),
  
  deleteCase: (id: string) =>
    apiClient.delete(`/cases/${id}`),
  
  getCaseStats: () =>
    apiClient.get('/cases/stats'),
};

// Evidence API
export const evidenceApi = {
  getEvidence: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/evidence`),
  
  uploadEvidence: (caseId: string, file: File, metadata: any, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    return apiClient.client.post(`/cases/${caseId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  
  deleteEvidence: (evidenceId: string) =>
    apiClient.delete(`/evidence/${evidenceId}`),
  
  analyzeEvidence: (evidenceId: string, analysisType: string) =>
    apiClient.post(`/evidence/${evidenceId}/analyze`, { analysisType }),
  
  getAnalysisResults: (evidenceId: string) =>
    apiClient.get(`/evidence/${evidenceId}/analysis`),
};

// Analysis API
export const analysisApi = {
  analyzeImage: (file: File) =>
    apiClient.uploadFile('/analysis/vision', file),
  
  analyzeDocument: (file: File) =>
    apiClient.uploadFile('/analysis/document', file),
  
  analyzeCDR: (file: File) =>
    apiClient.uploadFile('/analysis/cdr', file),
  
  getKnowledgeGraph: (caseId?: string) =>
    apiClient.get('/analysis/knowledge-graph', { caseId }),
  
  searchEntities: (query: string) =>
    apiClient.get('/analysis/entities/search', { query }),
};

// Interrogation API
export const interrogationApi = {
  createSession: (data: any) =>
    apiClient.post('/interrogation/sessions', data),
  
  getSessions: (caseId?: string) =>
    apiClient.get('/interrogation/sessions', { caseId }),
  
  getSession: (sessionId: string) =>
    apiClient.get(`/interrogation/sessions/${sessionId}`),
  
  updateSession: (sessionId: string, data: any) =>
    apiClient.put(`/interrogation/sessions/${sessionId}`, data),
  
  uploadAudio: (sessionId: string, file: File, onProgress?: (progress: number) => void) =>
    apiClient.uploadFile(`/interrogation/sessions/${sessionId}/audio`, file, onProgress),
  
  transcribeAudio: (sessionId: string) =>
    apiClient.post(`/interrogation/sessions/${sessionId}/transcribe`),
  
  formatTranscript: (sessionId: string) =>
    apiClient.post(`/interrogation/sessions/${sessionId}/format`),
  
  exportToSheets: (sessionId: string, sheetId: string) =>
    apiClient.post(`/interrogation/sessions/${sessionId}/export`, { sheetId }),
  
  getQuestionSuggestions: (sessionId: string, context: string) =>
    apiClient.post(`/interrogation/sessions/${sessionId}/suggestions`, { context }),
};

// Reports API
export const reportsApi = {
  getReports: (caseId?: string) =>
    apiClient.get('/reports', { caseId }),
  
  getReport: (reportId: string) =>
    apiClient.get(`/reports/${reportId}`),
  
  generateReport: (data: any) =>
    apiClient.post('/reports/generate', data),
  
  updateReport: (reportId: string, data: any) =>
    apiClient.put(`/reports/${reportId}`, data),
  
  approveReport: (reportId: string) =>
    apiClient.post(`/reports/${reportId}/approve`),
  
  exportReport: (reportId: string, format: string) =>
    apiClient.get(`/reports/${reportId}/export`, { format }),
};

// Predictive Policing API
export const predictiveApi = {
  uploadCrimeData: (file: File, onProgress?: (progress: number) => void) =>
    apiClient.uploadFile('/predictive/crime-data', file, onProgress),
  
  getCrimeData: (params?: any) =>
    apiClient.get('/predictive/crime-data', params),
  
  getHotspots: (params?: any) =>
    apiClient.get('/predictive/hotspots', params),
  
  generateHeatmap: (params: any) =>
    apiClient.post('/predictive/heatmap', params),
  
  getPredictions: (params: any) =>
    apiClient.post('/predictive/predictions', params),
};

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    apiClient.get('/dashboard/stats'),
  
  getRecentActivity: (limit?: number) =>
    apiClient.get('/dashboard/activity', { limit }),
  
  getNotifications: () =>
    apiClient.get('/dashboard/notifications'),
  
  markNotificationRead: (notificationId: string) =>
    apiClient.put(`/dashboard/notifications/${notificationId}/read`),
};

// System API
export const systemApi = {
  getConfig: () =>
    apiClient.get('/system/config'),
  
  updateConfig: (config: any) =>
    apiClient.put('/system/config', config),
  
  getAuditLogs: (params?: any) =>
    apiClient.get('/system/audit-logs', params),
  
  exportAuditLogs: (params?: any) =>
    apiClient.get('/system/audit-logs/export', params),
  
  healthCheck: () =>
    apiClient.get('/system/health'),
};

export default apiClient;