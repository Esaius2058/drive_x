// src/components/DownError.tsx
import React from "react";
// Assuming you use react-router for navigation
import { useNavigate } from "react-router-dom";

interface DownErrorProps {
  isLoggedIn?: boolean; // Made optional
}

const DownError: React.FC<DownErrorProps> = ({ isLoggedIn = false }) => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  const handleRedirect = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="error-page">
      <h1 className="">503</h1>
      <h2 className="">Service Unavailable</h2>
      <p className="error-page-p">
        The system is currently down, likely because the{" "}
        Supabase free tier database has paused due to
        inactivity.
        Please contact the administrator at{" "}
        <a
          href="mailto:isaiahgrt2058@gmail.com"
          className="text-blue-600 font-medium underline hover:text-blue-800"
        >
          isaiahgrt2058@gmail.com
        </a>{" "}
        to restart the server.
      </p>

      <div className="button-div">
        <button
          className="primary-btn px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleReload}
        >
          Try Again
        </button>
        <button
          className="secondary-btn px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          onClick={handleRedirect}
        >
          {isLoggedIn ? "Back to Dashboard" : "Back to Home Page"}
        </button>
      </div>
    </div>
  );
};

export default DownError;
