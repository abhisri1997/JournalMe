import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export class PasswordService {
  private static readonly SALT_ROUNDS = Number(
    process.env.BCRYPT_SALT_ROUNDS ?? 10
  );

  /**
   * Hash a password using bcrypt
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async compare(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a random reset token
   */
  static generateResetToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Hash a reset token for storage
   */
  static async hashResetToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!password) {
      return { isValid: false, error: "Password is required" };
    }
    if (password.length < 8) {
      return {
        isValid: false,
        error: "Password must be at least 8 characters",
      };
    }
    return { isValid: true };
  }
}
