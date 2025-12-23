// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  JOURNALS: {
    BASE: "/api/journals/",
    BY_ID: (id: string) => `/api/journals/${id}`,
  },
  USERS: {
    PROFILE: "/api/users/profile",
    LIST: "/api/users/search",
  },
  FOLLOWS: {
    BASE: "/api/follows",
    CONNECTIONS: "/api/follows/connections",
    REQUEST: "/api/follows/request",
    REQUESTS: "/api/follows/requests",
    ACCEPT: (id: string) => `/api/follows/${id}/accept`,
    REJECT: (id: string) => `/api/follows/${id}/reject`,
    FEED: "/api/follows/feed",
  },
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: "jm_token",
  USER: "jm_user",
  MIC_DEVICE: "jm_mic_device",
};

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  RESET_TOKEN_EXPIRY_HOURS: 1,
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
