import { Link } from "react-router-dom";

const LandingNavBar = () => {
    return (
        <nav className="navbar">
            <Link to={"/"} className="navbar-logo">
                <img src="./cloud-white.svg" alt="cloud-icon" className="h-8 w-8 mr-2"/>
                <h1>driveX</h1>
            </Link>
            <div className="navbar-filler"></div>
            <div className="navbar-links">
                <Link to="/">Features</Link>
                <Link to="/about">Docs</Link>
                <Link to="/signup">Sign Up</Link>
            </div>
        </nav>
    );
}

export { LandingNavBar };