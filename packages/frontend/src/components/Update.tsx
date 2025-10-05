import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { LoadingSpinner } from "./LoadingScreen";

const UpdateUser = () => {
  interface Notification {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    description?: string; // milliseconds
  }
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { notification: authNotification, supabase } = useAuth();

  const navigate = useNavigate();
  const path = "/auth/login"; 

  useEffect(() => {
      if (loading == false && success) {
        navigate(path);
      }
    }, [loading, success]);

  const updateForm = useRef<HTMLFormElement>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(updateForm.current!);
    const new_password = formData.get("password");

    const { data, error } = await supabase.auth.updateUser({
      password: new_password,
    });

    setLoading(false);
    if (data) {
      setNotification({
        message: "Password updated successfully. Redirecting...",
        type: "success",
      });
      setTimeout(() => {
        setSuccess(true);
      }, 3000);
    } else if (error) {
      setNotification({
        message: "Failed to update password. Try again.",
        type: "error",
      });
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
          <h1>Update Password</h1>
        </div>
        <form id="login-form" ref={updateForm} onSubmit={handleUpdate}>
          <input name="email" type="email" placeholder="email" required />
          <input
            name="password"
            type="password"
            placeholder="password"
            required
          />
          {notification && renderNotification(notification)}
          <div className="button-div">
            <button type="submit" className="primary-btn">
              {loading ? <LoadingSpinner /> : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
