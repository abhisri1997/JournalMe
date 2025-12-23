import { authFetch } from "../auth";
import { API_ENDPOINTS } from "../constants";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
}

export interface DiscoveredUser {
  id: string;
  email: string;
  displayName?: string | null;
  outgoingFollowId?: string | null;
  outgoingStatus?: string | null;
  incomingFollowId?: string | null;
  incomingStatus?: string | null;
}

export interface FollowRequest {
  id: string;
  followerId: string;
  followingId: string;
  status: string;
  follower?: { id: string; email: string; displayName?: string | null };
  following?: { id: string; email: string; displayName?: string | null };
  createdAt?: string;
}

export interface FollowConnection {
  id: string;
  user: { id: string; email: string; displayName?: string | null };
  since: string;
}

export interface FeedEntry {
  id: string;
  text: string;
  createdAt: string;
  audioPath?: string | null;
  user: { id: string; email: string; displayName?: string | null };
  isPublic: boolean;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Login failed");
    }

    return res.json();
  }

  static async register(
    credentials: RegisterCredentials
  ): Promise<LoginResponse> {
    const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let err;
      try {
        err = JSON.parse(errorText);
      } catch {
        err = { error: errorText || `HTTP ${res.status}` };
      }
      throw new Error(err.error || "Register failed");
    }

    return res.json();
  }

  static async forgotPassword(email: string): Promise<void> {
    const res = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to process request");
    }
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const res = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to reset password");
    }
  }
}

export class UserService {
  static async updateProfile(displayName: string): Promise<{
    id: string;
    email: string;
    displayName: string;
  }> {
    const res = await authFetch(API_ENDPOINTS.USERS.PROFILE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to update profile");
    }

    return res.json();
  }

  static async listUsers(query = ""): Promise<DiscoveredUser[]> {
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    const res = await authFetch(`${API_ENDPOINTS.USERS.LIST}${qs}`);
    if (!res.ok) {
      throw new Error("Failed to load users");
    }

    const data = await res.json();
    return data.users ?? [];
  }
}

export class JournalService {
  static async fetchEntries(): Promise<any[]> {
    const res = await authFetch(API_ENDPOINTS.JOURNALS.BASE);
    if (res.status === 401) return [];
    return res.json();
  }

  static async createEntry(
    text: string,
    audioBlob?: Blob,
    isPublic = false
  ): Promise<any> {
    const form = new FormData();
    form.append("text", text);
    form.append("isPublic", isPublic ? "true" : "false");

    if (audioBlob) {
      let extension = "webm";
      if (audioBlob.type.includes("mp4")) extension = "mp4";
      else if (audioBlob.type.includes("ogg")) extension = "ogg";
      form.append("audio", new File([audioBlob], `recording.${extension}`));
    }

    const res = await authFetch(API_ENDPOINTS.JOURNALS.BASE, {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error("Failed to save");
    return res.json();
  }

  static async deleteEntry(id: string): Promise<void> {
    const res = await authFetch(API_ENDPOINTS.JOURNALS.BY_ID(id), {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");
  }
}

export class FollowService {
  static async sendRequest(targetUserId: string) {
    const res = await authFetch(API_ENDPOINTS.FOLLOWS.REQUEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to send request");
    }

    return res.json();
  }

  static async acceptRequest(id: string) {
    const res = await authFetch(API_ENDPOINTS.FOLLOWS.ACCEPT(id), {
      method: "POST",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to accept request");
    }

    return res.json();
  }

  static async rejectRequest(id: string) {
    const res = await authFetch(API_ENDPOINTS.FOLLOWS.REJECT(id), {
      method: "POST",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to reject request");
    }

    return res.json();
  }

  static async listRequests(
    direction: "sent" | "received" = "received"
  ): Promise<FollowRequest[]> {
    const res = await authFetch(
      `${API_ENDPOINTS.FOLLOWS.REQUESTS}?direction=${direction}`
    );
    if (!res.ok) {
      throw new Error("Failed to load follow requests");
    }
    const data = await res.json();
    return data.requests ?? [];
  }

  static async listConnections(): Promise<{
    following: FollowConnection[];
    followers: FollowConnection[];
  }> {
    const res = await authFetch(API_ENDPOINTS.FOLLOWS.CONNECTIONS);
    if (!res.ok) {
      throw new Error("Failed to load connections");
    }
    return res.json();
  }

  static async fetchFeed(): Promise<FeedEntry[]> {
    const res = await authFetch(API_ENDPOINTS.FOLLOWS.FEED);
    if (!res.ok) {
      throw new Error("Failed to load feed");
    }
    return res.json();
  }
}
