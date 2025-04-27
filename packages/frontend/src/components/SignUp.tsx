import { Link } from "react-router-dom";

const SignUp = () => {
    return (
        <div className="auth-page">
            <div className="auth-form">
                <div className="auth-div"><img src="/xmark-solid.svg" alt="cancel" /></div>
                <div className="auth-div-1"><h1>Sign Up</h1></div>
                <div className="auth-div"><p>Already have an account? <Link to="/auth/login">Log In</Link></p></div>
                <form action="/api/sign-up" method="POST">
                    <input type="text" placeholder="first name" required />
                    <input type="text" placeholder="last name" required />
                    <input type="email" placeholder="email" required />
                    <input type="password" placeholder="password" required />
                    <button type="submit">Sign Up</button>
                </form>
            </div>
            <div className="auth-form">
            <div className="auth-div"><img src="/xmark-solid.svg" alt="cancel" /></div>
                <div className="auth-div-1"><h1>Log In</h1></div>
                <div className="auth-div"><p>Don't have an account? <Link to="/auth/signup">Sign Up</Link></p></div>
                <form action="/api/log-in" method="POST">
                    <input type="email" placeholder="email" required />
                    <input type="password" placeholder="password" required />
                    <div className="button-div">
                        <button className="secondary-btn">Forgot Password?</button>
                        <button className="primary-btn" type="submit">Log In</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;