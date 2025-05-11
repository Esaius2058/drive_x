import { Link } from "react-router-dom";
import {useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const SignUp = () => {
  const [authType, setAuthType] = useState("sign-up");
  const [authHeader, setAuthHeader] = useState("Sign Up");
  const [authIntro, setAuthIntro] = useState("Already");
  const [authCTA, setAuthCTA] = useState("Log In");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const { signup, login, user, userFiles} = useAuth();
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = signupForm.current;
    if (!form) return;

    const formData = new FormData(form);

    const firstName = formData.get("firstname") as string;
    const lastName = formData.get("lastname") as string;

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signup(firstName, lastName, email, password);

    setIsAuthenticated(true);
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

    await login(email, password);

    //handle loading state
    //handle error state
    setIsAuthenticated(true);
  };

  const navigate = useNavigate();

  return (
    <>
      {isAuthenticated ? (
        navigate('/dashboard', { state: { userFiles } })
      ) : (
        <div className="auth-page">
          <div className="auth-form">
            <div className="auth-div">
              <Link to={"/"} className="cancel-btn">
                <img src="/xmark-solid.svg" alt="cancel" />
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
                <input name="firstname" type="text" placeholder="first name" required />
                <input name="lastname" type="text" placeholder="last name" required />
                <input name="email" type="email" placeholder="email" required />
                <input name="password" type="password" placeholder="password" required />
                <button type="submit" className="primary-btn">
                  {authHeader}
                </button>
              </form>
            ) : (
              <form id="login-form" ref={loginForm} onSubmit={handleLogin}>
                <input name="email" type="email" placeholder="email" required />
                <input name="password" type="password" placeholder="password" required />
                <div className="button-div">
                  <button className="secondary-btn">Forgot Password?</button>
                  <button type="submit" className="primary-btn">
                    Log In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
