import { useEffect, useState } from "react";
import {
  loginUser,
  signUpUser,
  fetchUserProfile,
  logoutUser,
} from "../services/auth";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Notification {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  description?: string; // milliseconds
}

interface UserFiles {
  userNames?: object;
  folders?: object;
  folderIds?: object;
  folderNames?: object;
  files?: object;
  user?: object;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userFiles, setUserFiles] = useState<UserFiles>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Check if the token is expired
      isJWTExpired(storedToken).then(async (expired) => {
        if (expired) {
          console.warn("JWT token is expired, clearing state");
          // If expired, clear the state
          setUser(null);
          setToken(null);
          setUserFiles({});
          setIsAdmin(false);
          setLoading(false); // Ensure loading is false
          console.log("Redirecting to login due to expired token");
          setNotification({
            message: "Your session is expired",
            type: "warning",
            description: "Redirecting to login due to expired token",
          });

          const navigate = useNavigate();
          navigate("/auth/login"); // Redirect to login page

          await logoutUser();
        }
      });
    } else {
      console.warn("No token found in localStorage, setting loading to false");
      setLoading(false);
    }
  }, [token]);

  async function getProfile() {
    try {
      const userData = await fetchUserProfile();

      // Handle case where userData is undefined (fetch failed)
      if (!userData) {
        throw new Error("Failed to load user profile");
      }

      // Process user data
      if (userData.files) {
        setUserFiles(userData);
      }

      if (userData.role === "admin") {
        setIsAdmin(true);
        console.log("Admin logged in");
      }
    } catch (error) {
      console.error("Error in getProfile:", error);
      // You might want to handle errors here (e.g., show error message to user)
    }
  }

  async function signup(
    firstname: string,
    lastname: string,
    email: string,
    password: string
  ) {
    try {
      setLoading(true);
      const user = await signUpUser(firstname, lastname, email, password);
      const storedToken = localStorage.getItem("token");

      setUser(user);
      setToken(storedToken);
      console.log("User signed up:", user); // Single consolidated log

      // fetch and set user profile
      await getProfile();
    } catch (error: any) {
      if (error.status == 422) {
        setNotification({
          message: "User already exists. Login instead.",
        });
      } else {
        setNotification({
          message: "Unexpected error. Try again.",
        });
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      // authenticate user with the server
      const user = await loginUser(email, password);
      if (!user) {
        setNotification({
          message: "Login failed: No user data returned",
        });
        return; // exit early without throwing
      }

      // retrieve and validate token
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setNotification({
          message: "No authentication token found. Try again.",
        });
        return;
      }

      // update client-side state
      setUser(user);
      setToken(storedToken);
      console.log("User logged in:", user); // Single consolidated log

      // fetch and set user profile
      await getProfile();
    } catch (error: any) {
      setLoading(false);
      if (error.status == 400) {
        setNotification({
          message: "Invalid Email or Password. Try again.",
        });
      } else {
        setNotification({
          message: "Unexpected error. Try again.",
        });
      }
      console.error(error);
      // clear state on failure to avoid inconsistencies
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");

      throw error;
    } finally {
      setLoading(false); // ensure loading state is reset
    }
  }

  async function logout() {
    try {
      await logoutUser(); // First attempt to logout on the server

      // Clear client-side state
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      setUserFiles({});

      // Optional: You might want to redirect or perform other cleanup
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);

      // Even if server logout fails, we can still clear local state
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      setUserFiles({});

      // Optional: Show error message to user
      setError({
        name: "Internal Server Error",
        message: "Failed to logout properly, but local session was cleared",
      });
    }
  }

  async function isJWTExpired(token: string): Promise<boolean> {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return true; // Assume expired if there's an error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        error,
        user,
        token,
        userFiles,
        isAdmin,
        signup,
        login,
        logout,
        notification,
        setNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
