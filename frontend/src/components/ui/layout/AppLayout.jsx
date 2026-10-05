import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import OrganisationRail from "@/components/ui/OrganisationRail.jsx";
import { useState } from "react";

export default function AppLayout() {
    const { user, isAuthLoading } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    if (isAuthLoading) {
        return <div className="text-white p-6">Auth loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="h-screen w-screen overflow-hidden">
            <OrganisationRail />

            <Outlet context={{ isConnected, setIsConnected }} />
        </div>
    );
}