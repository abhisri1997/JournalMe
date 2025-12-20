import { useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../auth";

export default function LogoutButton() {
  const navigate = useNavigate();
  const hasToken = !!getToken();
  if (!hasToken) return null;
  function onLogout() {
    clearToken();
    navigate("/", { replace: true });
  }
  return (
    <button aria-label='Logout' onClick={onLogout}>
      Logout
    </button>
  );
}
