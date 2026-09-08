export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates whether an email string adheres to basic email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validates login form inputs
 * @param {Object} data
 * @param {string} [data.email]
 * @param {string} [data.password]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateLoginForm(data = {}) {
  const email = data.email ? data.email.trim() : "";
  const password = data.password;

  if (!email) {
    return {
      isValid: false,
      error: "Please enter your email address.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address.",
    };
  }

  if (!password || (typeof password === "string" && password.length === 0)) {
    return {
      isValid: false,
      error: "Please enter your password.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates signup form inputs
 * @param {Object} data
 * @param {string} [data.name]
 * @param {string} [data.email]
 * @param {string} [data.password]
 * @param {string} [data.confirmPassword]
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateSignupForm(data = {}) {
  const name = data.name ? data.name.trim() : "";
  const email = data.email ? data.email.trim() : "";
  const password = data.password || "";
  const confirmPassword = data.confirmPassword || "";

  if (!name) {
    return {
      isValid: false,
      error: "Please enter your full name.",
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: "Name must be 100 characters or fewer.",
    };
  }

  if (!email) {
    return {
      isValid: false,
      error: "Please enter your email address.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address.",
    };
  }

  if (!password) {
    return {
      isValid: false,
      error: "Please enter a password.",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters long.",
    };
  }

  if (!confirmPassword) {
    return {
      isValid: false,
      error: "Please confirm your password.",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

