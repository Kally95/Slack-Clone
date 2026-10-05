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

    return (
        <>
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

            {/*<main className="flex h-full flex-col px-6">*/}
            {/*    <div className="flex min-h-0 flex-1 flex-col p-2">*/}
            {/*        <ul className="min-h-0 flex-1 overflow-y-auto">*/}
            {/*            {messages.map((msg, index) => (*/}
            {/*                <li key={index} className="py-1">*/}
            {/*                    {msg}*/}
            {/*                </li>*/}
            {/*            ))}*/}
            {/*        </ul>*/}
            {/*    </div>*/}

            {/*    <MessageArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..."*/}
            {/*              onClick={sendMessage}/>*/}
            {/*</main>*/}
        </>
    )
}