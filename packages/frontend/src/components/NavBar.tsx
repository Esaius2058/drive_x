import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";
import { useState } from "react";

interface Notification {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // milliseconds
}

interface DashboardNavbarProps {
  name: string;
  email: string;
  usedStoragePercentage: number;
  avatarUrl?: string;
  notification: Notification;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
  files: any;
  folders: any;
}

const LandingNavBar = () => {
  return (
    <nav className="navbar welcome-nav">
      <Link to={"/"} className="navbar-logo">
        <img src="./cloud-white.svg" alt="cloud-icon" />
        <h1 className="navbar-logo-header-1">drive X</h1>
      </Link>
      <div className="navbar-filler"></div>
      <div className="navbar-links">
        <Link to="/#landing-features">Features</Link>
        <Link to="/about">Docs</Link>
        <Link to="/auth/signup">Sign Up</Link>
      </div>
    </nav>
  );
};

const LandingNavBarMobile = () => {};

const DashboardNavBar = ({
  name,
  email,
  avatarUrl,
  usedStoragePercentage,
  notification,
  setNotification,
  files,
  folders,
}: DashboardNavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const FileSearch = ({ files, folders }: any) => {
    const filteredFiles = files.filter((file: any) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFolders = folders.filter((folder: any) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="search-results">
        {filteredFolders.map((folder: any) => (
          <div key={folder.id} className="search-result">
            {folder.name}
          </div>
        ))}
        {filteredFiles.map((file: any) => (
          <div key={file.id} className="search-result">
            {file.name}
          </div>
        ))}
      </div>
    );
  };

  return (
    <nav className="navbar dashboard-nav">
      <Link to={"/"} className="navbar-logo">
        <img src="/cloud-solid.svg" alt="cloud-icon" />
        <h1 className="navbar-logo-header-2">drive X</h1>
      </Link>
      <div className="navbar-search">
        <div className="search-header">
          <button className="search-btn">
            <img
              src="/search-solid.svg"
              alt="search-icon"
              className="navbar-icon search-icon"
            />
          </button>
          <input
            type="text"
            placeholder="Search in Drive"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">
            <img
              src="/xmark-solid.svg"
              alt="x-icon"
              className="navbar-icon cancel-icon"
            />
          </button>
        </div>
        <div className="search-results-container">
          {searchQuery && <FileSearch files={files} folders={folders} />}
        </div>
        
      </div>
      <UserAvatar
        name={name}
        email={email}
        avatarUrl={avatarUrl}
        usedStoragePercentage={usedStoragePercentage}
        setNotification={setNotification}
      />
    </nav>
  );
};

export { LandingNavBar, LandingNavBarMobile, DashboardNavBar };
