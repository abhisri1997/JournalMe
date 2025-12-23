import { STORAGE_KEYS } from "./constants";

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(t: string) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, t);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch {
    // Ignore errors during logout
  }
  // Redirect to login so ProtectedRoute re-evaluates immediately
  if (typeof window !== "undefined") {
    const to = "/login";
    if (window.location.pathname !== to) {
      window.location.href = to;
    }
  }
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    logout();
  }
  return res;
}
