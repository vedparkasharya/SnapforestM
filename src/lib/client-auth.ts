export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of ["snapforest_user", "snapforest_admin"]) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      if (stored?.token) return String(stored.token);
    } catch {
      // Ignore malformed local storage and try the other key.
    }
  }

  return null;
}

export function withAuthHeaders(headers: HeadersInit = {}): Headers {
  const result = new Headers(headers);
  const token = getStoredAuthToken();
  if (token) result.set("Authorization", `Bearer ${token}`);
  result.set("Accept", "application/json");
  return result;
}
