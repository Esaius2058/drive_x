import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";
import { AlignJustify, X } from "lucide-react";
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
      <div className="navbar-links">
        <Link to="/#landing-features">Features</Link>
        <Link to="/about">Docs</Link>
        <Link to="/auth/signup">Sign Up</Link>
      </div>
    </nav>
  );
};

const LandingNavBarMobile = () => {
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <>
      <nav className="mobile-navbar welcome-nav">
        <Link to={"/"} className="navbar-logo">
          <img src="/icons/cloud-white.svg" alt="cloud-icon" />
          <h1 className="navbar-logo-header-1">drive X</h1>
        </Link>
        <button onClick={toggleMenu} aria-label="Toggle menu">
          {openMenu ? <X color="white" /> : <AlignJustify color="white" />}
        </button>
      </nav>

      {/* Mobile menu that appears when openMenu is true */}
      {openMenu && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <Link to="/features" onClick={() => setOpenMenu(false)}>
              Features
            </Link>
            <Link to="/pricing" onClick={() => setOpenMenu(false)}>
              Pricing
            </Link>
            <Link to="/about" onClick={() => setOpenMenu(false)}>
              About Us
            </Link>
            <Link to="/auth/login" onClick={() => setOpenMenu(false)}>
              Login
            </Link>
            <Link 
              to="/auth/signup" 
              className="signup-button"
              onClick={() => setOpenMenu(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

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
  const convertToLocaleString = (raw: string): string => {
    const date = new Date(raw);

    const formatted = date.toLocaleString();
    return formatted;
  };

  const FileSearch = ({ files, folders }: any) => {
    const filteredFiles = files.filter((file: any) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const useDecimal = decimalStorage;

    return (
      <div className="search-results">
        {
          <div className="search-results-desktop desktop-only">
            <tbody>
              {filteredFiles.map((file: any) => (
                <tr key={file.id} className="search-result">
                  <td className="filename-cell">{file.name}</td>
                  <td>
                    {useDecimal
                      ? decimalStorageConversion(Number(file.size))
                      : binaryStorageConversion(Number(file.size))}
                  </td>
                  <td>{userNames[file.user_id]}</td>
                  <td className="search-hidden">{file.updated_at}</td>
                </tr>
              ))}
            </tbody>
          </div>
        }
        {
          <div className="search-results-mobile mobile-only">
            {filteredFiles.map((file: any) => (
              <div key={file.id} className="file-item">
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-owner">
                    {userNames[file.user_id]} -{" "}
                    {convertToLocaleString(file.updated_at)}
                  </div>
                </div>
                <button className="file-menu-btn">⋮</button>
              </div>
            ))}
          </div>
        }
      </div>
    );
  };

  const mobileNavbar = () => (
    <nav className="mobile-navbar dashboard-nav">
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
          <button className="search-btn" onClick={() => setSearchQuery("")}>
            <img
              src="/icons/xmark-solid.svg"
              alt="x-icon"
              className="navbar-icon cancel-icon"
            />
          </button>
        </div>
        <div className="search-results-container">
          {searchQuery && <FileSearch files={files} />}
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

  const desktopNavbar = () => (
    <nav className="navbar dashboard-nav">
      <Link to={"/"} className="navbar-logo">
        <img src="/icons/cloud-solid.svg" alt="cloud-icon" />
        <h1 className="navbar-logo-header-2">drive X</h1>
      </Link>
      <div className="navbar-filler"></div>
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
          <button className="search-btn" onClick={() => setSearchQuery("")}>
            <img
              src="/icons/xmark-solid.svg"
              alt="x-icon"
              className="navbar-icon cancel-icon"
            />
          </button>
        </div>
        <div className="search-results-container">
          {searchQuery && <FileSearch files={files} />}
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

  return (
    <div>
      {mobileNavbar()}
      {desktopNavbar()}
    </div>
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
};

export { LandingNavBar, LandingNavBarMobile, DashboardNavBar, AdminNavBar };
