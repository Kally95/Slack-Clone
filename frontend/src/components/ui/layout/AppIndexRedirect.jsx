import {Navigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import CreateWorkspaceModal from "@/components/ui/createWorkspaceModal.jsx";
import {useState} from "react";

export default function AppIndexRedirect() {
    const [open, setOpen] = useState(false)
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

    return (
        <div className="ml-16 flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    Welcome
                </h1>

                <p className="mt-2 text-zinc-400">
                    Create a workspace to get started.
                </p>

                <button className="mt-4 rounded bg-emerald-600 px-4 py-2 cursor-pointer" onClick={() => setOpen(true)}>
                    Create Workspace
                </button>
                <CreateWorkspaceModal open={open} onOpenChange={setOpen}/>
            </div>
        </div>
    );
}