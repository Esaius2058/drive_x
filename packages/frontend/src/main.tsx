import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainRoutes from "./routes";
import { AuthProvider } from "./components/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const router = createBrowserRouter(MainRoutes());
const rootElement = document.getElementById("root") as HTMLElement;

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  </StrictMode>
);
