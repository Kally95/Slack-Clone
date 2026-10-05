import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";

export default function AppIndexRedirect() {
    const [cookies] = useCookies([
        "currentOrganisation",
        "currentChannel",
    ]);

    if (cookies.currentOrganisation && cookies.currentChannel) {
        return (
            <Navigate
                to={`/app/organisations/${cookies.currentOrganisation}/channels/${cookies.currentChannel}`}
                replace
            />
        );
    }

    return <Navigate to="/app/organisations" replace />;
}