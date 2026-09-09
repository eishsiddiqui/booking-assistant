import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import AuthInput from "./AuthInput";
import { signupUser } from "../../api/auth";
import { validateSignupForm } from "../../utils/validation";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user edits fields
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      const response = await signupUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response && response.user) {
        navigate("/login", {
          state: {
            successMessage: "Account created successfully! Please sign in with your credentials.",
            prefillEmail: formData.email.trim(),
          },
          replace: true,
        });
      } else {
        throw new Error("Invalid response received from server.");
      }
    } catch (err) {
      setError(
        err.message || "Failed to create an account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-header">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Sign up today to start booking your appointments
        </p>
      </header>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle size={22} className="auth-alert-icon" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <div className="form-fields">
          <AuthInput
            id="signup-name"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            autoComplete="name"
            disabled={isLoading}
            required
          />

          <AuthInput
            id="signup-email"
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
            id="signup-password"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            showPasswordToggle={true}
            autoComplete="new-password"
            disabled={isLoading}
            required
          />

          <AuthInput
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={Lock}
            showPasswordToggle={true}
            autoComplete="new-password"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={22} className="btn-spinner" />
              <span>Creating account...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <footer className="auth-footer">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in now!
          </Link>
        </p>
      </footer>
    </div>
  );
}
