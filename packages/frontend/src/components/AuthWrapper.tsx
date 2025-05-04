import { Outlet } from "react-router-dom";

const AuthWrapper = () => {
    return (
        <div className="app-container">
            <Outlet />
        </div>
    );
}

export default AuthWrapper;