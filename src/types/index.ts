export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "super_admin" | "admin" | "client";
  phone?: string;
  avatar?: string;
  status: "active" | "inactive";
  createdAt?: string;
}

export interface BackendApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data: T;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}


// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface UsersPaginatedResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Practice Types
export type PracticeType = "listening" | "reading" | "writing" | "speaking";
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type QuestionType = "mcq" | "short_answer" | "audio" | "essay";

export interface Practice {
  _id: string;
  title: string;
  type: PracticeType;
  level?: CEFRLevel;
  durationMinutes: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PracticesPaginatedResponse {
  practices: Practice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Practice Question Types
export interface MediaContent {
  audio?: string;
  image?: string;
}

export interface PracticeQuestion {
  _id: string;
  examId: string | Practice;
  number: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correct?: number;
  score: number;
  media?: MediaContent;
  difficulty?: CEFRLevel;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PracticeQuestionsPaginatedResponse {
  questions: PracticeQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
