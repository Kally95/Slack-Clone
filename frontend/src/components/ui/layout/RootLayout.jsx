import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "@/contexts/AuthContext.jsx";

export default function RootLayout() {
    const {user, isAuthLoading} = useAuth();

    if (isAuthLoading) {
        return null;
    }

    if (user) {
        return <Navigate to="/app" replace/>;
    }

    return (
        <Outlet/>
    );
}