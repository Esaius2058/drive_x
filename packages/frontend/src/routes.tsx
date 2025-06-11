import App from "./App";
import Landing from "./components/Landing";
import AuthWrapper from "./components/AuthWrapper";
import SignUp from "./components/SignUp";
import { Dashboard } from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import { ErrorPage } from "./components/404";
import { ErrorBoundaryWrapper } from "./components/ErrorBoundary";

const MainRoutes = () => {
  const routes = [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <Landing />,
        },
        {
          path: "auth",
          element: <AuthWrapper />,
          children: [
            {
              path: "signup",
              element: <SignUp />,
            },
            {
              path: "login",
              element: <SignUp />,
            },
          ],
        },
        {
          path: "dashboard",
          element: (
              <Dashboard />
          ),
        },
        {
          path: "admin-dashboard",
          element: <AdminDashboard />,
        },
        {
          path: "*",
          element: <ErrorPage />,
        },
      ],
    },
  ];

  return routes;
};

export default MainRoutes;