//a clean TypeScript-safe context.
import { createContext, useContext } from "react";

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
}

type UserContextType = {
    user: User | null;
    loading: boolean;
    error: Error | null;
};

export const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    error: null,
});

export const useUser = () => useContext(UserContext);