import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "./LoadingScreen";
import { Alert, AlertDescription, AlertTitle } from "./Alert";

const SignUp = () => {
  interface Notification {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    description?: string; // milliseconds
  }

  const [authType, setAuthType] = useState("sign-up");
  const [authHeader, setAuthHeader] = useState("Sign Up");
  const [authIntro, setAuthIntro] = useState("Already");
  const [authCTA, setAuthCTA] = useState("Log In");
  const [initializedAuth, setInitializedAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [emailErr, setEmailErr] = useState<string>("");
  const [passwordErr, setPasswordErr] = useState<string>("");

  const {
    loading,
    signup,
    login,
    userFiles,
    isAdmin,
    notification: authNotification,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const path = isAdmin ? "/admin-dashboard" : "/dashboard";

  useEffect(() => {
    if (loading == false && isAuthenticated) {
      navigate(`${path}`, { state: { userFiles } });
    }
  }, [loading, navigate, path]); // did not include isAuthenticated because it is dependent on loading state

  useEffect(() => {
    if (location.pathname.includes("login")) {
      setAuthType("log-in");
      setAuthHeader("Log In");
      setAuthIntro("Don't");
      setAuthCTA("Sign Up");
    } else {
      setAuthType("sign-up");
      setAuthHeader("Sign Up");
      setAuthIntro("Already");
      setAuthCTA("Log In");
    }
    if (notification || authNotification) {
      const timeout = setTimeout(() => {
        setNotification(null);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    if (authNotification && authNotification.type !== "info") {
      setNotification({ message: authNotification.message });
    } else {
      setNotification(null);
    }
  }, [authNotification]);

  const signupForm = useRef<HTMLFormElement>(null);
  const loginForm = useRef<HTMLFormElement>(null);
  const handleAuthTypeChange = () => {
    if (authType === "sign-up") {
      setAuthType("log-in");
      setAuthHeader("Log In");
      setAuthIntro("Don't");
      setAuthCTA("Sign Up");
    } else {
      setAuthType("sign-up");
      setAuthHeader("Sign Up");
      setAuthIntro("Already");
      setAuthCTA("Log in");
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
      setEmailErr("Please enter a valid email address.");
      return false;
    }

    setEmailErr("");
    return true;
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(){}|<>,.":]/.test(password);

    if (password.length < minLength) {
      setPasswordErr("Password must at least 8 characters long.");
      return false;
    }

    if (!hasUpperCase) {
      setPasswordErr("Password must contain at least one uppercase letter.");
      return false;
    }

    if (!hasLowerCase) {
      setPasswordErr("Password must contain at least one lowercase letter.");
      return false;
    }

    if (!hasNumber) {
      setPasswordErr("Password must contain at least one number.");
      return false;
    }

    if (!hasSpecialChar) {
      setPasswordErr("Password must contain at least one special character.");
      return false;
    }

    setPasswordErr("");
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setAuthType("sign-up");
    const form = signupForm.current;
    if (!form) {
      setNotification({ message: "Form is not available." });
      return;
    }

    try {
      const formData = new FormData(form);

      const firstName = formData.get("firstname") as string;
      const lastName = formData.get("lastname") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!firstName || !lastName || !email || !password) {
        setNotification({ message: "Please fill out all required fields." });
        return;
      }

      if (!validateEmail(email)) return;

      if (!validatePassword(password)) return;

      setInitializedAuth(true);

      await signup(firstName, lastName, email, password);
      setNotification(null);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Login failed:", error);
    } finally {
      setTimeout(() => {
        setInitializedAuth(false);
      }, 3000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setAuthType("log-in");
    try {
      const form = loginForm.current;
      if (!form) {
        console.warn("loginForm ref is null");
        return;
      }

      const formData = new FormData(form);

      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      setInitializedAuth(true);

      await login(email, password);

      setNotification(null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setTimeout(() => {
        setInitializedAuth(false);
      }, 3000);
    }
  };

  const renderNotification = (notification: Notification) => {
    return (
      <div className={`auth-notification`}>
        <p>{notification.message}</p>
        <p>{notification?.description}</p>
      </div>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-div">
          <Link to={"/"} className="cancel-btn">
            <img src="/icons/xmark-solid.svg" alt="cancel" />
          </Link>
        </div>
        <div className="auth-div-1">
          <h1>{authHeader}</h1>
        </div>
        <div className="auth-div">
          <p>
            {authIntro} have an account?{" "}
            <Link to={""} onClick={handleAuthTypeChange}>
              {authCTA}
            </Link>
          </p>
        </div>
        {authType === "sign-up" ? (
          <form id="signup-form" ref={signupForm} onSubmit={handleSignup}>
            <input
              name="firstname"
              type="text"
              placeholder="first name"
              required
            />
            <input
              name="lastname"
              type="text"
              placeholder="last name"
              required
            />
            <input name="email" type="email" placeholder="email" required />
            {emailErr && <div className="auth-notification">{emailErr}</div>}
            <input
              name="password"
              type="password"
              placeholder="password"
              required
            />
            {passwordErr && (
              <div className="auth-notification">{passwordErr}</div>
            )}
            {notification && renderNotification(notification)}
            <button type="submit" className="primary-btn">
              {loading && initializedAuth ? <LoadingSpinner /> : authHeader}
            </button>
          </form>
        ) : (
          <form id="login-form" ref={loginForm} onSubmit={handleLogin}>
            <input name="email" type="email" placeholder="email" required />
            <input
              name="password"
              type="password"
              placeholder="password"
              required
            />
            {notification && renderNotification(notification)}
            <div className="button-div">
              <Link to={"/auth/verify-email"} className="forgot-password">Forgot Password?</Link>
              <button type="submit" className="primary-btn">
                {loading && initializedAuth ? <LoadingSpinner /> : authHeader}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
