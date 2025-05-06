//fetching a user once on mount
import {ReactNode, useEffect, useState} from "react";
import {UserContext} from "./contexts/UserContext";

export const UserProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if(!token){
                    throw new Error("Unauthorized! No token provided.")
                }
                const response = await fetch("http://localhost:3000/api/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{user, loading, error}}>
            {children}
        </UserContext.Provider>
    );
}