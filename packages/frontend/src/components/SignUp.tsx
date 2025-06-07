import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingDashboard from "./LoadingScreen";

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

  const { loading, setLoading, signup, login, userFiles, isAdmin } = useAuth();

  const navigate = useNavigate();
  const path = isAdmin ? "/admin-dashboard" : "/dashboard";

  useEffect(() => {
    if (loading === false && isAuthenticated) {
      navigate(`${path}`, { state: { userFiles } });
    }

    if (notification) {
      const timeout = setTimeout(() => {
        setNotification(null);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [loading, isAuthenticated, notification]);

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
    const regex = /^[\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      setNotification({
        message: "Please enter a valid email address."
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
        message: "Password must contain at least one lowercase letter.",
      });
      return false;
    }

    if (!hasLowerCase) {
      setNotification({
        message: "Password must contain at least one uppercase letter.",
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
    if (!form) return;

    const formData = new FormData(form);

    const firstName = formData.get("firstname") as string;
    const lastName = formData.get("lastname") as string;

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if(emailValidation === false){
      return;
    }

    if (passwordValidation === false) {
      return;
    }

    setInitializedAuth(true);

    await signup(firstName, lastName, email, password);

    setIsAuthenticated(true);
    setTimeout(() => {
      setInitializedAuth(false);
      setLoading(false);
    }, 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

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

    //handle loading state
    //handle error state
    setIsAuthenticated(true);
    setTimeout(() => {
      setInitializedAuth(false);
      setLoading(false);
    }, 3000);
  };

  const renderNotification = (notification: Notification) => {
    return (
      <div className={`auth-notification`}>
        <p>{notification.message}</p>
      </div>
    );
  };

  if (loading && initializedAuth) {
    console.log("Loading State(SignUp):", loading);
    return <LoadingDashboard />;
  }

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
              {authHeader}
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
                {authHeader}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
