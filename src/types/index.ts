export type PlanType = "trial" | "basic" | "advanced" | "premium";
export type PlanCategory = "preparation" | "training";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  category?: PlanCategory;
  duration_days: number;
  price: number; // Legacy field - will be price_rwf
  price_rwf: number; // Price in Rwandan Francs
  price_usd: number; // Price in US Dollars
  description?: string;
  features: string[];
  popular: boolean;
  is_active: boolean;
  details: {
    co: number;
    ce: number;
    eo: number;
    ee: number;
    correction: boolean;
    streak: boolean;
    history: boolean;
  };
  training_details?: {
    sessions: number;
    duration_days: number;
  };
}

export interface Subscription {
  id: string;
  plan: {
    id: string;
    name: string;
    type: PlanType;
    duration_days: number;
    price: number;
  };
  status: SubscriptionStatus;
  start_date: Date;
  end_date: Date;
  days_remaining: number;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "super_admin" | "admin" | "client" | "trainer";
  phone?: string;
  avatar?: string;
  status: "active" | "inactive";
  createdAt?: string;
  subscription?: Subscription | null;
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
  freemium: boolean;
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
  answer?: string; // For essay and short answer questions - supports markdown
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

export interface PracticeWithQuestions {
  practice: {
    id: string;
    title: string;
    level?: CEFRLevel;
    durationMinutes: number;
    totalQuestions: number;
  };
  questions: PracticeQuestion[];
  questionCount: number;
}

export interface SpeakingPracticesResponse {
  practices: PracticeWithQuestions[];
  totalPractices: number;
}

// Practice Session Types
export type SessionStatus = "in_progress" | "completed" | "expired";
export type SessionGrade = "excellent" | "good" | "needs_improvement";

export interface SessionAnswer {
  questionId: string;
  questionNumber: number;
  selectedAnswer?: number; // Optional for essay/short answer questions
  textAnswer?: string; // For essay and short answer questions - supports markdown
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: Date;
}

export interface PracticeSession {
  _id: string;
  userId: string;
  practiceId: string | Practice;
  startedAt: Date;
  completedAt?: Date;
  answers: SessionAnswer[];
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  status: SessionStatus;
  timeElapsedSeconds: number;
  durationMinutes: number;
  grade?: SessionGrade;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeSessionsPaginatedResponse {
  sessions: PracticeSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SessionResult {
  _id: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  status: SessionStatus;
  timeElapsedSeconds: number;
  grade: SessionGrade;
  message: string;
  color: string;
  completedAt: Date;
}

export interface SubmitAnswerResponse {
  answer: {
    questionNumber: number;
    isCorrect: boolean;
    pointsEarned: number;
  };
  currentScore: number;
  answeredQuestions: number;
  totalQuestions: number;
  progressPercent: number;
}

export interface SessionStatistics {
  totalSessions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalTimeSeconds: number;
}

// Blog Types
export type BlogStatus = "draft" | "published" | "archived";

export interface BlogAuthor {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Blog {
  _id: string;
  title: string;
  description: string;
  body: string;
  cover_image?: string;
  written_by: BlogAuthor;
  status: BlogStatus;
  published_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsPaginatedResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateBlogRequest {
  title: string;
  description: string;
  body: string;
  cover_image?: string;
  status?: BlogStatus;
}

export interface UpdateBlogRequest {
  title?: string;
  description?: string;
  body?: string;
  cover_image?: string;
  status?: BlogStatus;
}
