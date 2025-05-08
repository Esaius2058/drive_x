import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";

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
}

const LandingNavBarMobile = () => {}

const DashboardNavBar = ({name, email, avatarUrl, usedStoragePercentage, notification, setNotification}: DashboardNavbarProps) => {
    return (
        <nav className="navbar dashboard-nav">
            <Link to={"/"} className="navbar-logo">
                <img src="/cloud-solid.svg" alt="cloud-icon" />
                <h1 className="navbar-logo-header-2">drive X</h1>
            </Link>
            <div className="navbar-search">
                <img src="/search-solid.svg" alt="search-icon" className="navbar-icon"/>
                <input type="text" placeholder="Search in Drive" className="search-input"/>
                <img src="/xmark-solid.svg" alt="x-icon" className="navbar-icon"/>
            </div>
            <UserAvatar name={name} email={email} avatarUrl={avatarUrl} usedStoragePercentage={usedStoragePercentage} setNotification={setNotification}/>
        </nav>
    );
}

export { LandingNavBar, LandingNavBarMobile, DashboardNavBar };