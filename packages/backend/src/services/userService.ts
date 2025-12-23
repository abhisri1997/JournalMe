import prisma from "../db";
import { PasswordService } from "./passwordService";

export interface CreateUserData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName?: string | null;
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: CreateUserData): Promise<UserResponse> {
    const { email, password } = data;

    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Validate password
    const passwordValidation = PasswordService.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("User already exists");
    }

    // Hash password and create user
    const passwordHash = await PasswordService.hash(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  /**
   * Authenticate user by email and password
   */
  static async authenticateUser(
    email: string,
    password: string
  ): Promise<UserResponse | null> {
    if (!email || !password) {
      return null;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    const isValidPassword = await PasswordService.compare(
      password,
      user.passwordHash
    );
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    displayName: string
  ): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { displayName },
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  /**
   * Set password reset token for user
   */
  static async setResetToken(
    userId: string,
    token: string,
    expiryDate: Date
  ): Promise<void> {
    const hashedToken = await PasswordService.hashResetToken(token);
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiryDate,
      },
    });
  }

  /**
   * Find user by valid reset token
   */
  static async findByResetToken(token: string): Promise<UserResponse | null> {
    const users = await prisma.user.findMany({
      where: {
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    for (const user of users) {
      if (
        user.resetToken &&
        (await PasswordService.compare(token, user.resetToken))
      ) {
        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        };
      }
    }

    return null;
  }

  /**
   * Reset user password
   */
  static async resetPassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const passwordValidation = PasswordService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    const passwordHash = await PasswordService.hash(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }
}
