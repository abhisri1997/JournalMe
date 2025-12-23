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

      <div className='flex flex-col gap-3'>
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

        <p className='mt-4 text-center text-sm'>
          Remember your password?{" "}
          <a href='/login' className='text-blue-600 hover:underline'>
            Back to Login
          </a>
        </p>
      </div>
    </PageContainer>
  );
}
