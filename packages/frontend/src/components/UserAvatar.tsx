"use client";

import { useState, useRef, useEffect } from "react";

interface UserAvatarProps {
  name: string;
  email: string;
  usedStoragePercentage: number;
  avatarUrl?: string;
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  usedStoragePercentage,
}: UserAvatarProps) {
  const [open, setOpen] = useState(false);
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
          <div className="settings-options">
            <button className="dropdown-item">Change Password</button>
            <button className="dropdown-item">Manage Storage</button>
            <button className="dropdown-item" type="submit">
              Log Out
            </button>
            <button className="dropdown-item">Delete Account</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
