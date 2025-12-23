import { useState } from "react";
import { PageContainer, PageHeader } from "../components/Layout";
import {
  FormInput,
  FormButton,
  ErrorMessage,
  SuccessMessage,
} from "../components/Form";
import { AuthService } from "../services/api";
import { ValidationUtils } from "../utils/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    setSuccess(false);

    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      setLoading(false);
      return;
    }

    try {
      await AuthService.forgotPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process request";
      setError(message);
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title='Forgot Password'
        backButton={{ label: "Back to Login", to: "/login" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FormInput
          id='email'
          label='Email'
          type='email'
          value={email}
          onChange={setEmail}
          placeholder='your@email.com'
        />

        <ErrorMessage message={error} />

        {success && (
          <SuccessMessage message='If an account exists with this email, a password reset link has been sent. Check your email!' />
        )}

        <FormButton onClick={submit} disabled={loading || !email}>
          {loading ? "Sending..." : "Send Reset Link"}
        </FormButton>

        <p style={{ textAlign: "center", fontSize: 14, marginTop: 16 }}>
          Remember your password?{" "}
          <a
            href='/login'
            style={{
              color: "#007bff",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Back to Login
          </a>
        </p>
      </div>
    </PageContainer>
  );
}
