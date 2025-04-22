import { Outlet } from "react-router-dom";

const AuthWrapper = () => {
    return (
        <div className="auth-wrapper">
            <Outlet />
        </div>
    );
}

export default AuthWrapper;