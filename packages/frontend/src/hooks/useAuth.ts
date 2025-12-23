import { useEffect, useState } from "react";
import { getToken } from "../auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(!!getToken());

    window.addEventListener("storage", updateAuth);
    window.addEventListener("focus", updateAuth);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("focus", updateAuth);
    };
  }, []);

  return { isAuthenticated };
}
