import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable input field tailored for authentication forms with left icon and optional password toggle
 */
export default function AuthInput({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  showPasswordToggle = false,
  required = false,
  autoComplete,
  disabled = false,
  ariaLabel,
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const effectiveType = showPasswordToggle
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

  return (
    <div className="auth-input-wrapper">
      {Icon && (
        <span className="auth-input-icon" aria-hidden="true">
          <Icon size={22} />
        </span>
      )}

      <input
        id={id}
        name={name}
        type={effectiveType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        className={`auth-input ${Icon ? "has-left-icon" : ""} ${
          showPasswordToggle ? "has-right-toggle" : ""
        }`}
      />

      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setIsPasswordVisible((prev) => !prev)}
          className="auth-input-toggle-btn"
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {isPasswordVisible ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      )}
    </div>
  );
}
