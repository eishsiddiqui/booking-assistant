import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import AuthInput from "./AuthInput";
import { useAuth } from "../../hooks/useAuth";
import { loginUser } from "../../api/auth";
import { validateLoginForm } from "../../utils/validation";

export default function LoginForm() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.prefillEmail || "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || null
  );

  const { login } = useAuth();
  const navigate = useNavigate();

  // Redirect destination after successful login
  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear alerts when user begins typing again
    if (error) setError(null);
    if (infoMessage) setInfoMessage(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSuccessMessage(null);

    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response && response.token && response.user) {
        login(response.user, response.token);
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error("Invalid response received from server.");
      }
    } catch (err) {
      setError(
        err.message || "Failed to sign in. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setInfoMessage(
      "Password reset functionality will be enabled in the upcoming update.",
    );
  };

  return (
    <div className="login-card">
      <header className="login-header">
        <h1 className="login-title">Sign In</h1>
        <p className="login-subtitle">
          Welcome! Please sign in to your account
        </p>
      </header>

      {successMessage && (
        <div className="login-alert login-alert-success" role="status">
          <CheckCircle2 size={22} className="login-alert-icon" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="login-alert login-alert-error" role="alert">
          <AlertCircle size={22} className="login-alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="login-alert login-alert-info" role="status">
          <span>{infoMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="login-form">
        <div className="form-fields">
          <AuthInput
            id="login-email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            autoComplete="email"
            disabled={isLoading}
            required
          />

          <AuthInput
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            showPasswordToggle={true}
            autoComplete="current-password"
            disabled={isLoading}
            required
          />
        </div>

        <div className="forgot-password-row">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="forgot-password-btn"
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="login-submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={22} className="btn-spinner" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <footer className="login-footer">
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up now!
          </Link>
        </p>
      </footer>
    </div>
  );
}
