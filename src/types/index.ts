export type PlanType = "trial" | "basic" | "advanced" | "premium";
export type PlanCategory = "preparation" | "training";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  category?: PlanCategory;
  duration_days: number;
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
    price_rwf: number;
    price_usd: number;
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
  lastLoginAt?: string;
  subscription?: Subscription | null;
  subscriptions?: Array<Subscription & { createdAt: string }>;
  corporateRole?: CorporateRole | null;
  corporate?: {
    id: string;
    name: string;
    location: string;
  } | null;
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
  requiresEmailVerification?: boolean;
  nextStep?: string;
  redirectTo?: string;
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
  slug: string;
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

// Corporate Types
export interface Corporate {
  _id: string;
  name: string;
  location: string;
  email?: string;
  phone?: string;
  maxTrainers: number;
  maxLearners: number;
  isActive: boolean;
  trainerCount?: number;
  learnerCount?: number;
  dedicatedPlans?: Array<{
    _id: string;
    name: string;
    type: string;
    category: string;
    duration_days: number;
    price: number;
    price_rwf: number;
    price_usd: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CorporatesPaginatedResponse {
  corporates: Corporate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateCorporateRequest {
  name: string;
  location: string;
  email?: string;
  phone?: string;
  maxTrainers?: number;
  maxLearners?: number;
}

export interface UpdateCorporateRequest {
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  maxTrainers?: number;
  maxLearners?: number;
  isActive?: boolean;
}

export type CorporateRole = "trainer" | "learner";

// Trainer Dashboard Types
export interface TrainerDashboardStats {
  totalLearners: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalPracticeSessions: number;
  averageScore: number;
  totalPracticeTime: number;
  recentActivity: TrainerRecentActivity[];
  learnersNeedingAttention: TrainerLearnerAttention[];
  performanceByType: TrainerPerformanceByType[];
}

export interface TrainerRecentActivity {
  id: string;
  learner: {
    id: string;
    name: string;
  };
  practice: {
    title: string;
    type: string;
    level?: string;
  };
  percentageScore: number;
  grade: "excellent" | "good" | "needs_improvement";
  completedAt: string;
  timeElapsedSeconds: number;
}

export interface TrainerLearnerAttention {
  id: string;
  name: string;
  email: string;
  reasons: string[];
  lastActivity: string | null;
  averageScore: number | null;
}

export interface TrainerPerformanceByType {
  type: string;
  averageScore: number;
  totalSessions: number;
}

export interface LearnerActivity {
  id: string;
  practice: {
    id: string;
    title: string;
    type: string;
    level?: string;
  };
  completedAt: string;
  startedAt: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  timeElapsedSeconds: number;
  durationMinutes: number;
  totalQuestions: number;
  correctAnswers: number;
  grade: "excellent" | "good" | "needs_improvement";
}

// Practice Sequence Types
export interface SequenceQuestion {
  tache: number;
  questionId: string | PracticeQuestion | null;
  practiceId: string | Practice | null;
}

export interface Sequence {
  _id: string;
  type: "speaking" | "writing";
  number: number;
  questions: SequenceQuestion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SequencesPaginatedResponse {
  sequences: Sequence[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
