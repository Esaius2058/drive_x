import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";
import { useState } from "react";

interface Notification {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  description?: string; 
}

interface DashboardNavbarProps {
  name: string;
  email: string;
  usedStoragePercentage: number;
  avatarUrl?: string;
  notification: Notification | null;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
  files: any;
  userNames: any;
  decimalStorage: boolean;
  setDecimalStorage: React.Dispatch<React.SetStateAction<boolean>>;
  binaryStorageConversion: (bytes: number) => string;
  decimalStorageConversion: (bytes: number) => string;
}

interface AdminNavbarProps {
  name: string;
  email: string;
  avatarUrl?: string;
  notification: Notification | null;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
  decimalStorage: boolean;
  setDecimalStorage: React.Dispatch<React.SetStateAction<boolean>>;
}

const LandingNavBar = () => {
  return (
    <nav className="navbar welcome-nav">
      <Link to={"/"} className="navbar-logo">
        <img src="/icons/cloud-white.svg" alt="cloud-icon" />
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
  decimalStorage,
  setDecimalStorage,
  binaryStorageConversion,
  decimalStorageConversion,
  notification,
  setNotification,
  files,
  userNames,
}: DashboardNavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const FileSearch = ({ files, folders }: any) => {
    const filteredFiles = files.filter((file: any) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    {/*const filteredFolders = folders.filter((folder: any) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );*/}

    const useDecimal = decimalStorage;

    return (
      <div className="search-results">
        <tbody>
          {/*filteredFolders.map((folder: any) => (
            <tr key={folder.id} className="search-result">
              <td>{folderNames[folder.id]}</td>
              <td>{folderNames[folder.parent_id] || "--"}</td>
              <td>
                {useDecimal
                  ? decimalStorageConversion(Number(folder.size))
                  : binaryStorageConversion(Number(folder.size))}
              </td>
              <td>{userNames[folder.user_id]}</td>
              <td>{folder.updated_at || folder.created_at}</td>
            </tr>
          ))*/}
          {filteredFiles.map((file: any) => (
            <tr key={file.id} className="search-result">
              <td>{file.name}</td>
              <td>--</td>
              <td>
                {useDecimal
                  ? decimalStorageConversion(Number(file.size))
                  : binaryStorageConversion(Number(file.size))}
              </td>
              <td>{userNames[file.user_id]}</td>
              <td>{file.updated_at}</td>
            </tr>
          ))}
        </tbody>
      </div>
    );
  };

  return (
    <nav className="navbar dashboard-nav">
      <Link to={"/"} className="navbar-logo">
        <img src="/icons/cloud-solid.svg" alt="cloud-icon" />
        <h1 className="navbar-logo-header-2">drive X</h1>
      </Link>
      <div className="navbar-search">
        <div className="search-header">
          <button className="search-btn">
            <img
              src="/icons/search-solid.svg"
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
              src="/icons/xmark-solid.svg"
              alt="x-icon"
              className="navbar-icon cancel-icon"
            />
          </button>
        </div>
        <div className="search-results-container">
          {searchQuery && <FileSearch files={files}/>}
        </div>
      </div>
      <UserAvatar
        name={name}
        email={email}
        avatarUrl={avatarUrl}
        usedStoragePercentage={usedStoragePercentage}
        setNotification={setNotification}
        decimalStorage={decimalStorage}
        setDecimalStorage={setDecimalStorage}
      />
    </nav>
  );
};

const AdminNavBar = ({
  name,
  email,
  avatarUrl,
  decimalStorage,
  setDecimalStorage,
  notification,
  setNotification,
}: AdminNavbarProps) => {
  return (
    <nav className="navbar dashboard-nav">
      <Link to={"/"} className="navbar-logo">
        <img src="/icons/cloud-solid.svg" alt="cloud-icon" />
        <h1 className="navbar-logo-header-2">drive X</h1>
      </Link>
      <UserAvatar
        name={name}
        email={email}
        avatarUrl={avatarUrl}
        setNotification={setNotification}
        decimalStorage={decimalStorage}
        setDecimalStorage={setDecimalStorage}
      />
    </nav>
  );
}

export { LandingNavBar, LandingNavBarMobile, DashboardNavBar, AdminNavBar};
