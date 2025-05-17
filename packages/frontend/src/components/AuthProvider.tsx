import { useEffect, useState } from "react";
import { loginUser, signUpUser } from "../services/auth";
import { AuthContext } from "./AuthContext";

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

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Unauthorized! No token provided.");
        }

        const res = await fetch("http://localhost:3000/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();

        setUserFiles(data);
        console.log("User Files(AuthProvider)", data);

        if (data.role == "admin") {
          setIsAdmin(true);
          console.log("Admin logged in");
        }

        console.log("Loading State:", loading);
        return data;
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching user files:", err);
      } finally {
        setLoading(false);
        console.log("Loading State:", loading);
      }
    };

    fetchUserFiles();
  }, []);

  async function signup(
    firstname: string,
    lastname: string,
    email: string,
    password: string
  ) {
    const user = await signUpUser(firstname, lastname, email, password);
    const storedToken = localStorage.getItem("token");

    setUser(user);
    setToken(storedToken);
  }

  async function login(email: string, password: string) {
    const user = await loginUser(email, password);
    const storedToken = localStorage.getItem("token");
    console.log("Logged User(login):", user);

    setUser(user);
    setToken(storedToken);
    console.log("Token", token);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ loading, error, user, token, userFiles, isAdmin, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
