import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AuthProvider} from "@/contexts/AuthContext.jsx";
import {Toaster} from "sonner";
import {queryClient} from "@/react-query/queryClient.js";
import {QueryClientProvider} from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {routes} from "@/routes.jsx";
import {TooltipProvider} from "@/components/ui/tooltip.jsx";
import {CookiesProvider} from "react-cookie";

export const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
        <CookiesProvider>
            <AuthProvider>
                <Toaster position="top-right"/>
                <TooltipProvider>

                        <RouterProvider router={router}/>

                </TooltipProvider>
                <ReactQueryDevtools initialIsOpen={false}/>
            </AuthProvider>
        </CookiesProvider>
    </QueryClientProvider>
);