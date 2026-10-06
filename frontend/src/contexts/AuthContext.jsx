import {createContext, use, useContext, useEffect, useState} from "react";
import api from "../api/client.js"
import {queryClient} from "@/react-query/queryClient.js";
import {socket} from "@/socket.js";
import {useCookies} from "react-cookie";

const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [, , removeCookie] = useCookies([
        "currentOrganisation",
        "currentChannel",
    ]);

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setIsAuthLoading(false);
            }
        }
        loadUser();
    }, []);

    useEffect(() => {
        if (user) {
            console.log("auth user exists, connecting socket");
            socket.connect();
            socket.emit("hello")
        } else {
            console.log("no auth user, disconnecting socket");
            socket.disconnect();
        }
    }, [user]);

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.log(err)
        } finally {
            setUser(null);
            removeCookie("currentOrganisation", { path: "/" });
            removeCookie("currentChannel", { path: "/" });
            queryClient.clear();
        }
    };

    return (
        <AuthContext.Provider value={{user, setUser, logout, isAuthLoading}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}