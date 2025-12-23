import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer, PageHeader } from "../components/Layout";
import {
  FormInput,
  FormButton,
  ErrorMessage,
  SuccessMessage,
} from "../components/Form";
import { AuthService } from "../services/api";
import { ValidationUtils } from "../utils/validation";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("No reset token provided. Please check your email link.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  async function submit() {
    // Validate passwords match
    const matchValidation = ValidationUtils.validatePasswordMatch(
      newPassword,
      confirmPassword
    );
    if (!matchValidation.isValid) {
      setError(matchValidation.error!);
      return;
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error!);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await AuthService.resetPassword(token, newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title='Reset Password'
        backButton={{ label: "Back to Login", to: "/login" }}
      />

      <div className='flex flex-col gap-3'>
        {!token ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <FormInput
              id='password'
              label='New Password'
              type='password'
              value={newPassword}
              onChange={setNewPassword}
              placeholder='Enter new password'
              helperText='At least 8 characters'
            />

            <FormInput
              id='confirm'
              label='Confirm Password'
              type='password'
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder='Confirm new password'
            />

            <ErrorMessage message={error} />

            {success && (
              <SuccessMessage message='Password reset successfully! Redirecting to login...' />
            )}

            <FormButton
              onClick={submit}
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </FormButton>
          </>
        )}
      </div>
    </PageContainer>
  );
}
