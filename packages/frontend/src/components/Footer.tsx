import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer">
      <div className="footer-top">
        <div className="footer-section">
          <h3>Drive X</h3>
          <Link to="/about" className="footer-link">
            About This App
          </Link>
          <Link to="/privacy" className="footer-link">
            Privacy Policy
          </Link>
          <Link to="/terms" className="footer-link">
            Terms of Service
          </Link>
          <Link to="/help" className="footer-link">
            Help Center
          </Link>
        </div>
        <div className="footer-section">
          <h3>Features</h3>
          <p>Secure File Storage</p>
          <p>Fast Uploads</p>
          <p>Multiple File Types</p>
          <p>Easy Sharing</p>
        </div>
        <div className="footer-section">
          <h3>Support</h3>
          <a href="https://status.fileuploader.com" className="footer-link">
            <i className="fas fa-server"></i> System Status
          </a>
          <Link to="/feedback" className="footer-link">
            <i className="fas fa-comment"></i> Send Feedback
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="social-media">
          <img
            src="/icons/github-brands.svg"
            alt="github"
            className="social-icon"
          />
          <img
            src="/icons/x-twitter-brands.svg"
            alt="x-twitter"
            className="social-icon"
          />
          <img
            src="/icons/discord-brands.svg"
            alt="discord"
            className="social-icon"
          />
        </div>

        <div className="copyright">
          &copy; {currentYear} File Uploader App. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
