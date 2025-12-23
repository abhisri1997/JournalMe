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

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit() {
    setError("");

    // Validate inputs
    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      return;
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error!);
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.register({ email, password });
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      }
      if (data.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      }
      navigate("/journal");
    } catch (err) {
      console.error("Register exception:", err);
      const message = (err as Error).message || "Register failed";
      // Parse Prisma unique constraint error
      if (
        message.includes("User already exists") ||
        message.includes("Unique")
      ) {
        setError(
          "This email is already registered. Try logging in or using a different email."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader title='Register' backButton={{ label: "Home", to: "/" }} />
      <ErrorMessage message={error} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ display: "grid", gap: 12, marginTop: error ? 12 : 0 }}
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
          placeholder='Password (min 8 characters)'
          type='password'
          value={password}
          onChange={setPassword}
          autocomplete='new-password'
          inputMode='text'
        />
        <FormButton type='submit' disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </FormButton>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <LinkButton onClick={() => navigate("/login")}>Login here</LinkButton>
        </div>
      </form>
    </PageContainer>
  );
}
