import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="footer">
        <div className="about">
          <Link to="/about"><p>Get To Know Us</p></Link>
          <Link to={""}><p>Return Policy</p></Link>
          <Link to={""}><p>FAQs</p></Link>
        </div>
        <div className="social-media">
          <Link to={""}><img src={"/phone-solid.svg"} alt={"phone"} /></Link>
          <Link to={""}><img src={"/envelope-solid.svg"} alt={"email"} /></Link>
          <Link to={""}><img src={"/instagram-brands.svg"} alt={"instagram"} /></Link>
          <Link to={""}><img src={"/x-twitter-brands.svg"} alt={"x-twitter"} /></Link>
          <Link to={""}><img src={"/github-brands.svg"} alt={"github"} /></Link>
        </div>
      </div>
    );
}

export default Footer;