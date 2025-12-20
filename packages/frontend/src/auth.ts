export function getToken(): string | null {
  return localStorage.getItem("jm_token");
}
export function setToken(t: string) {
  localStorage.setItem("jm_token", t);
}
export function clearToken() {
  localStorage.removeItem("jm_token");
}

export function logout() {
  try {
    localStorage.removeItem("jm_token");
    localStorage.removeItem("jm_user");
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
