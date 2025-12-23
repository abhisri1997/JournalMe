import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../components/Layout";
import {
  FormInput,
  FormButton,
  ErrorMessage,
  LinkButton,
} from "../components/Form";
import { AuthService } from "../services/api";
import { STORAGE_KEYS } from "../constants";
import { ValidationUtils } from "../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");

    // Validate inputs
    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      setLoading(false);
      return;
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error!);
      setLoading(false);
      return;
    }

    try {
      const data = await AuthService.login({ email, password });
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      if (data.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      }
      window.location.href = "/";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader title='Login' backButton={{ label: "Home", to: "/" }} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ display: "grid", gap: 12 }}
      >
        <FormInput
          name='email'
          placeholder='Email'
          type='email'
          value={email}
          onChange={setEmail}
          autocomplete='email'
        />
        <FormInput
          name='password'
          placeholder='Password'
          type='password'
          value={password}
          onChange={setPassword}
          autocomplete='current-password'
          inputMode='text'
        />
        <ErrorMessage message={error} />
        <FormButton type='submit' disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </FormButton>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <LinkButton onClick={() => navigate("/register")}>
            Register here
          </LinkButton>
        </div>
        <div style={{ marginTop: 12, textAlign: "center", fontSize: "0.9rem" }}>
          <LinkButton onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </LinkButton>
        </div>
      </form>
    </PageContainer>
  );
}
