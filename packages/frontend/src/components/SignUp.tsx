import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "./LoadingScreen";

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

  const {
    loading,
    signup,
    login,
    userFiles,
    isAdmin,
    notification: authNotification,
  } = useAuth();

  const navigate = useNavigate();
  const path = isAdmin ? "/admin-dashboard" : "/dashboard";

  useEffect(() => {
    if (loading === false && isAuthenticated) {
      navigate(`${path}`, { state: { userFiles } });
    }

    if (notification || authNotification) {
      const timeout = setTimeout(() => {
        setNotification(null);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [loading, notification]); // did not include isAuthenticated because it is dependent on loading state

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
      setNotification({
        message: "Please enter a valid email address.",
      });
      return false;
    }

    return true;
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(){}|<>,.":]/.test(password);

    if (password.length < minLength) {
      setNotification({
        message: "Password must at least 8 characters long.",
      });
      return false;
    }

    if (!hasUpperCase) {
      setNotification({
        message: "Password must contain at least one uppercase letter.",
      });
      return false;
    }

    if (!hasLowerCase) {
      setNotification({
        message: "Password must contain at least one lowercase letter.",
      });
      return false;
    }

    if (!hasNumber) {
      setNotification({
        message: "Password must contain at least one number.",
      });
      return false;
    }

    if (!hasSpecialChar) {
      setNotification({
        message: "Password must contain at least one special character.",
      });
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const emailValidation = validateEmail(email);
      if (!emailValidation) {
        setNotification({ message: "Invalid email format." });
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation) {
        setNotification({ message: "Password does not meet criteria." });
        return;
      }

      setInitializedAuth(true);

      if (authNotification) {
        setNotification({ message: authNotification.message });
      }

      await signup(firstName, lastName, email, password);
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

    try {
      const form = loginForm.current;
      if (!form) {
        console.warn("loginForm ref is null");
        return;
      }

      const formData = new FormData(form);

      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
        console.warn("Email or password is missing from the form.");
        setNotification({ message: "Please fill in all required fields." });
        return;
      }

      setInitializedAuth(true);

      if (authNotification) {
        setNotification({ message: authNotification.message });
      }

      await login(email, password);
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

  console.log("Notification:", notification);
  
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
            <input
              name="password"
              type="password"
              placeholder="password"
              required
            />
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
              <button className="secondary-btn">Forgot Password?</button>
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
