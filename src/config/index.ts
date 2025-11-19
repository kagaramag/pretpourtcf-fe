export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  cloudFlarePublicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-52a29c3c256446bcb8fcb5dbee9ba062.r2.dev/",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
  appName: "PRET POUR TCF BO",
  appVersion: "1.0.0",
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",
  ME: "/auth/me",
  PROFILE: "/auth/profile",
  CHANGE_PASSWORD: "/auth/change-password",

  // Auth
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // Analytics
  ANALYTICS_OVERVIEW: "/analytics/overview",
  ANALYTICS_BY_AGENT: "/analytics/by-agent",
  ANALYTICS_BY_CLIENT: "/analytics/by-client",
  ANALYTICS_BY_DATE: "/analytics/by-date",
  ANALYTICS_EXPORT: "/analytics/export",

  // Payments
  PAYMENTS: "/payments",
  OVERDUE_PAYMENTS: "/payments/overdue",
  PAYMENT_SUMMARY: "/payments/summary",
  PAYMENT_ALERTS: "/payments/alerts",

  // Follow-ups
  FOLLOWUPS: "/followups",
  FOLLOWUP_TASKS: "/followups/tasks",
  FOLLOWUP_COMPLETE: "/followups/:id/complete",

  // Clients
  CLIENTS: "/clients",
  CLIENT_DETAILS: "/clients/:id",

  // Agents/Users
  USERS: "/users",
  USER_DETAILS: "/users/:id",

  // Practices
  PRACTICES: "/practices",
  PRACTICE_DETAILS: "/practices/:id",
  PRACTICE_QUESTIONS: "/practices/questions/all",

  // Practice Sessions
  PRACTICE_SESSIONS: "/practice-sessions",
  START_SESSION: "/practice-sessions/start",
  SUBMIT_ANSWER: "/practice-sessions/answer",
  COMPLETE_SESSION: "/practice-sessions/complete",
  BULK_SUBMIT_COMPLETE: "/practice-sessions/bulk-submit-complete",
  SESSION_STATS: "/practice-sessions/stats/summary",

  // Upload
  UPLOAD_QUESTION_MEDIA: "/upload/question-media",

  // Subscriptions
  SUBSCRIPTION_PLANS: "/subscriptions/plans",
  MY_SUBSCRIPTION: "/subscriptions/my-subscription",
  SUBSCRIBE: "/subscriptions/subscribe",
  CANCEL_SUBSCRIPTION: "/subscriptions/cancel",

  // Locations
  LOCATIONS: "/locations",

  // Reports
  REPORTS_AGENT: "/reports/agent",
  REPORTS_CLIENT: "/reports/client",
  REPORTS_PAYMENTS: "/reports/payments",

  // Contact
  CONTACT: "/contact",

  // Blogs (Admin)
  BLOGS: "/blogs",
  BLOG_DETAILS: "/blogs/:id",

  // Public Blogs
  PUBLIC_BLOGS: "/public/blogs",
  PUBLIC_BLOG_DETAILS: "/public/blogs/:id",
};
