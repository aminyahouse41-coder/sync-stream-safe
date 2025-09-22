import { toast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:8080";

// Token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

// API Request wrapper with auth
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // Handle authentication errors
  if (response.status === 401) {
    removeAuthToken();
    window.location.href = "/login";
    throw new Error("Authentication required");
  }

  return response;
};

// Types
export interface User {
  id: number;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export interface FileUploadResponse {
  message: string;
  filename: string;
  size: number;
  hash: string;
  deduplicated?: boolean;
}

export interface FileInfo {
  id: number;
  filename: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
  is_public?: boolean;
  download_count?: number;
  tags?: string[];
}

export interface FileListResponse {
  files: FileInfo[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFiles: number;
  };
}

export interface SearchParams {
  filename?: string;
  mime_type?: string;
  min_size_bytes?: number;
  max_size_bytes?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
}

export interface StorageStats {
  total_storage_used_bytes: number;
  original_storage_used_bytes: number;
  storage_savings_bytes: number;
  storage_savings_percentage: number;
  storage_quota_mb: number;
  quota_used_percentage: number;
}

// Authentication API
export const auth = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Login failed");
    }

    return response.json();
  },

  register: async (userData: RegisterRequest): Promise<void> => {
    const response = await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Registration failed");
    }
  },

  logout: (): void => {
    removeAuthToken();
  },
};

// Files API
export const files = {
  upload: async (fileList: FileList): Promise<FileUploadResponse[]> => {
    const formData = new FormData();
    
    Array.from(fileList).forEach((file) => {
      formData.append("file", file);
    });

    const response = await apiRequest("/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Upload failed");
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [result];
  },

  list: async (page: number = 1, pageSize: number = 20): Promise<FileListResponse> => {
    const response = await apiRequest(`/files?page=${page}&pageSize=${pageSize}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }

    return response.json();
  },

  search: async (params: SearchParams): Promise<FileListResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    const response = await apiRequest(`/search?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error("Search failed");
    }

    return response.json();
  },

  download: async (fileId: number): Promise<Blob> => {
    const response = await apiRequest(`/files/${fileId}/download`);
    
    if (!response.ok) {
      throw new Error("Download failed");
    }

    return response.blob();
  },

  preview: async (fileId: number): Promise<Blob> => {
    const response = await apiRequest(`/files/${fileId}/preview`);
    
    if (!response.ok) {
      throw new Error("Preview failed");
    }

    return response.blob();
  },

  delete: async (fileId: number): Promise<void> => {
    const response = await apiRequest(`/files/${fileId}/delete`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Delete failed");
    }
  },

  getStats: async (): Promise<StorageStats> => {
    const response = await apiRequest("/stats");
    
    if (!response.ok) {
      throw new Error("Failed to fetch statistics");
    }

    return response.json();
  },
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileTypeFromMime = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "document";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "archive";
  if (mimeType.includes("javascript") || mimeType.includes("json") || mimeType.includes("xml")) return "code";
  return "document";
};

export const downloadFile = async (fileId: number, filename: string): Promise<void> => {
  try {
    const blob = await files.download(fileId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download successful",
      description: `${filename} has been downloaded`,
    });
  } catch (error) {
    toast({
      title: "Download failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
  }
};