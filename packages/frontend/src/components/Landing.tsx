import { Link } from "react-router-dom";
import { LandingNavBar } from "./NavBar";
import Footer from "./Footer";

const Landing = () => {
    return (
        <div className="landing-page">
            <LandingNavBar />
            <section className="landing-hero" id="landing-hero">
                <div className="hero-content">
                    <div className="hero-tagline">
                        <h1>Drive X</h1>
                        <h2>Securely upload and access your files from anywhere.</h2>
                        <div className="button-div">
                            <button className="primary-btn">
                                <Link to="/auth/signup">Get Started</Link>
                            </button>
                            <button className="tertiary-btn">Learn More</button>
                        </div>
                    </div>
                </div>
                <img src="" alt="drive-x" />
            </section>
            <section className="landing-features" id="landing-features">
                <div className="feature">
                    <img src="" alt="encryption" />
                    <div className="feature-description">
                        <h1>End to End Encryption</h1>
                        <button className="tertiary-btn">Read More</button>
                    </div>
                </div>
                <div className="feature">
                    <img src="" alt="uploads" />
                    <div className="feature-description">
                        <h1>Fast Uploads</h1>
                        <button className="tertiary-btn">Read More</button>
                    </div>
                </div>
                <div className="feature">
                    <img src="" alt="folders" />
                    <div className="feature-description">
                        <h1>Smart Folders</h1>
                        <button className="tertiary-btn">Read More</button>
                    </div>
                </div>
            </section>
            <section className="landing-pivot" id="landing-pivot">
                <div className="pivot-wrapper">
                    <h1>Sign Up Today</h1>
                    <div className="button-div">
                        <button className="tertiary-btn">
                            <Link to={""}>Learn More</Link>
                        </button>
                        <button className="primary-btn">
                            <Link to={"/auth/signup"}>Get Started</Link>
                        </button>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default Landing;