import WorkspaceButton from "@/components/ui/WorkspaceButton.jsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import CreateWorkspaceModal from "@/components/ui/createWorkspaceModal.jsx";
import {useOrganisations} from "@/hooks/useOrganisations.js";

export default function OrganisationRail() {
    const {data: organisations} = useOrganisations()
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const [, setCookie] = useCookies(['currentOrganisation'])

    return <div
        className="fixed left-0 top-0 z-50 h-screen w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-3 gap-3">
        {organisations?.map(org => (
            <WorkspaceButton
                key={org.id}
                organisation={org}
                onClick={() => {
                    navigate(`/app/organisations/${org.id}`);
                    setCookie('currentOrganisation', org.id, {path: '/'})
                }}
            />
        ))}

        <WorkspaceButton className="outline" onClick={() => setOpen(true)}>
            +
        </WorkspaceButton>

        <CreateWorkspaceModal
            open={open}
            onOpenChange={setOpen}
        />
    </div>
}