import {useOutletContext} from "react-router-dom";
import MessageArea from "@/components/ui/MessageArea.jsx";

export default function OrganisationWorkspace() {

    const {
        organisation,
        organisationId,
        isConnected,
        messages,
        input,
        setInput,
        sendMessage,
    } = useOutletContext();
    console.log(organisation, isConnected)
    console.log("123123123")
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

            {"Figure out what should go here when a channel is not selected ??????????"}
        </div>
    )
}