import { VALIDATION } from "../constants";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationUtils {
  static validateEmail(email: string): ValidationResult {
    if (!email) {
      return { isValid: false, error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Invalid email format" };
    }

    return { isValid: true };
  }

  static validatePassword(password: string): ValidationResult {
    if (!password) {
      return { isValid: false, error: "Password is required" };
    }

    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return {
        isValid: false,
        error: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      };
    }

    return { isValid: true };
  }

  static validatePasswordMatch(
    password: string,
    confirmPassword: string
  ): ValidationResult {
    if (password !== confirmPassword) {
      return { isValid: false, error: "Passwords do not match" };
    }

    return { isValid: true };
  }

  static validateRequiredField(
    value: string,
    fieldName: string
  ): ValidationResult {
    if (!value || !value.trim()) {
      return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
  }
}
