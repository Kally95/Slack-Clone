import {NavLink, useOutletContext, useParams} from "react-router-dom";
import MessageArea from "@/components/ui/MessageArea.jsx";
import {useChannels} from "@/hooks/useChannels.js";
import CreateWorkspaceModal from "@/components/ui/createWorkspaceModal.jsx";
import {useState} from "react";
import CreateChannelModal from "@/components/CreateChannelModal.jsx";
import {capitalise} from "@/lib/utils.js";

export default function OrganisationWorkspace() {
    const [open, setOpen] = useState()
    const {
        organisation,
        organisationId,
        channels,
        isConnected,
    } = useOutletContext();
    return (
        <div>
            <header className="bg-emerald-700 p-5">
                <h1 className="text-xl font-bold underline">
                    {organisation?.name}
                </h1>
                <p>
                    Status:{" "}
                    <strong>
                        {isConnected ? "Connected" : "Disconnected"}
                    </strong>
                </p>
            </header>

            <div className="ml-16 flex min-h-screen items-center justify-center">
                <div className="text-center">


                    {!channels && <>
                        <h1 className="text-2xl font-bold">
                            Welcome to {organisation?.name}
                        </h1>

                        <p className="mt-2 text-zinc-400">
                            No channel selected. Create a channel to start a conversation with your team.
                        </p>


                        <button className="mt-4 rounded bg-emerald-600 px-4 py-2 cursor-pointer"
                                onClick={() => setOpen(true)}>
                            Create a Channel
                        </button>

                        <CreateChannelModal open={open} onOpenChange={setOpen} organisationId={organisationId}/></>
                    }

                    {channels && <>
                        <h1 className="text-2xl font-bold">
                            Welcome to {capitalise(organisation?.name)}
                        </h1>

                        <p className="mt-2 mb-2 text-zinc-400">
                            No channel selected. Choose a channel below or create one.
                        </p>
                        {channels.map((channel) => (
                            <NavLink
                                key={channel.id}
                                to={`channels/${channel.id}`}
                                className="rounded px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                # {channel.name}
                            </NavLink>
                        ))}
                    </>
                    }
                </div>
            </div>
        </div>
    )
}