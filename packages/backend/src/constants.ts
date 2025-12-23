// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Password Configuration
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  RESET_TOKEN_EXPIRY_HOURS: 1,
};

// Dummy User for Testing (should be removed in production)
export const DUMMY_USER = {
  id: "user-1",
  email: "test@local",
  password: "password",
};
