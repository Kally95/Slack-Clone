import RootLayout from "@/components/ui/layout/RootLayout.jsx";
import {LoginPage} from "@/pages/LoginPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";
import AppLayout from "@/components/ui/layout/AppLayout.jsx";
import OrganisationWorkspace from "@/pages/OrganisationWorkspace.jsx";
import OrganisationLayout from "@/components/ui/layout/OrganisationLayout.jsx";
import ChannelPage from "@/pages/ChannelPage.jsx";
import AppIndexRedirect from "@/components/ui/layout/AppIndexRedirect.jsx";
import DirectMessagePage from "@/pages/DirectMessagePage.jsx";

export const routes = [
    {
        path: "/",
        element: <RootLayout/>,
        children: [
            {path: "login", element: <LoginPage/>},
            {path: "register", element: <RegisterPage/>},
        ],
    },
    {
        path: "/app",
        element: <AppLayout/>,
        children: [
             {
            index: true,
            element: <AppIndexRedirect />,
        },
            {
                path: "organisations/:organisationId",
                element: <OrganisationLayout/>,
                children: [
                    {
                        index: true,
                        element: <OrganisationWorkspace/>,
                    },
                    {
                        path: "channels/:channelId",
                        element: <ChannelPage/>,
                    },
                    {
                        path: "direct-messages/:directMessageId",
                        element: <DirectMessagePage/>,
                    }

                ],
            },
        ],
    }

];