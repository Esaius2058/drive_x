import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { LoadingSpinner } from "./LoadingScreen";

const VerifyEmail = () => {
  interface Notification {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    description?: string; // milliseconds
  }
  const [emailErr, setEmailErr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const { supabase } = useAuth();
  const resetForm = useRef<HTMLFormElement>(null);

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
      setEmailErr("Please enter a valid email address.");
      return false;
    }

    setEmailErr("");
    return true;
  };

  const handleReset = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const form = resetForm.current;

    if (!form) {
      setNotification({ message: "Form is not available." });
      return;
    }

    const formData = new FormData(form);
    try {
      const email = formData.get("email") as string;
      validateEmail(email);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: import.meta.env.VITE_PASSWORD_RESET_REDIRECT as string,
      });

      setLoading(false)
      if (data) {
        setNotification({
          message: `Password reset email sent to ${email}`,
          type: "success",
        });

        if (error) throw error;
      }
    } catch (error: any) {
      setNotification({
        message: "Error Sending Password Reset Email",
        type: "error",
      });
    }finally {
      setTimeout(() => {    
        setNotification(null);
      }, 5000);
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
      <div className="auth-form" id="auth-form-alt">
        <div className="auth-div">
          <Link to={"/"} className="cancel-btn">
            <img src="/icons/xmark-solid.svg" alt="cancel" />
          </Link>
        </div>
        <div className="auth-div-1">
          <h1>Verify Email</h1>
        </div>
        <form id="login-form" ref={resetForm} onSubmit={handleReset}>
          <input name="email" type="email" placeholder="email" required />
          {emailErr && <div className="auth-notification">{emailErr}</div>}
          {notification && renderNotification(notification)}
          <div className="button-div">
            <button type="submit" className="primary-btn">
              {loading ? <LoadingSpinner /> : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
