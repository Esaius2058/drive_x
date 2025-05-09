"use client";
import { useAuth } from "./AuthContext";

import { useState, useRef, useEffect, ReactEventHandler } from "react";
import { updatePassword } from "../services/update";

interface Notification {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // milliseconds
}

interface UserAvatarProps {
  name: string;
  email: string;
  usedStoragePercentage: number;
  avatarUrl?: string;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  usedStoragePercentage,
  setNotification,
}: UserAvatarProps) {
  const [open, setOpen] = useState(false);
  const [passwordToggle, setPasswordToggle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    //clean up when the component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      logout();

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Logout failed");
      }
    } catch (error: any) {
      console.error("Logout failed:", error);
      // Handle error (e.g., show a notification)
      setNotification({
        message: error.message,
        type: "error",
      });
    } finally {
      // redirect the user to login
      window.location.href = "/auth/login";
    }
  };

  const passwordRef = useRef<HTMLFormElement>(null);
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = passwordRef.current;
    if (!form) return;

    try {
      const formData = new FormData(form);
      const oldPassword = formData.get("oldpassword");
      const newPassword = formData.get("newpassword");
      const confirmNewPassword = formData.get("confirmpassword");

      if (newPassword !== confirmNewPassword) {
        throw new Error("New password and confirm password do not match.");
      }

      const update = await updatePassword(
        oldPassword as string,
        newPassword as string
      );

      if (!update) {
        throw new Error("No response from server");
      }else{
        setNotification({
          message: update.message || "Password updated successfully!",
          type: "success",
        });
      }

      if (update.error) {
        throw new Error(update.error);
      }

      setPasswordToggle(false);
      form.reset();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error changing password:", error.message);
        setNotification({
          message: error.message,
          type: "error",
        });
      } else {
        console.error("Error changing password:", error);
        setNotification({
          message: "Failed to change password. Try again.",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="user-avatar-container" ref={menuRef}>
      <button className="avatar-button" onClick={() => setOpen(!open)}>
        {avatarUrl !== "" ? (
          <img src={avatarUrl} alt="user-avatar" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <img src="\user-solid.svg" alt="user" className="avatar-image" />
          </div>
        )}
      </button>

      {open && (
        <div className="dropdown-menu">
          <div className="profile-info">
            <span className="profile-name">{name || "John Doe"}</span>
            <span className="profile-email">
              {email || "john345@gmail.com"}
            </span>
            <p className="user-storage">
              Storage: {usedStoragePercentage}% used
            </p>
          </div>
          <hr className="divider" />
          {passwordToggle == false ? (
            <div className="settings-options">
              <button
                className="dropdown-item"
                onClick={() => setPasswordToggle(true)}
              >
                Change Password
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={handleLogout}
              >
                Log Out
              </button>
              <button className="dropdown-item">Delete Account</button>
            </div>
          ) : (
            <div className="password-change">
              <form onSubmit={handlePasswordChange} ref={passwordRef}>
                <input
                  type="text"
                  name="oldpassword"
                  id="old-password"
                  placeholder="old password"
                  required
                />
                <input
                  type="text"
                  name="newpassword"
                  id="new-password"
                  placeholder="new password"
                  required
                />
                <input
                  type="text"
                  name="confirmpassword"
                  id="confirm-password"
                  placeholder="confirm new password"
                  required
                />
                <div className="button-div">
                  <button className="primary-btn" type="submit">
                    Change Password
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => setPasswordToggle(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
