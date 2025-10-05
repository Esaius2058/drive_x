import React, { createContext, useContext } from "react";

interface Notification {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  description?: string; // milliseconds
}

export type AuthContextType = {
  user: any;
  userFiles: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (
    firstname: string,
    lastname: string,
    email: string,
    password: string
  ) => Promise<void>;
  supabase: any;
  isAdmin: boolean;
  loading: boolean;
  error: Error | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  notification: Notification | null;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
