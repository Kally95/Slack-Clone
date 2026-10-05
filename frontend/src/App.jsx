import {useEffect, useState} from "react";
import {socket} from "./socket";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronsUpDown,
    LogOut,
    Settings,
    User,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarProvider,
    SidebarInset,
} from "@/components/ui/sidebar";
import {Textarea} from "@/components/ui/textarea.jsx";
import {useAuth} from "@/contexts/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import api from "../src/api/client.js"
import OrganisationRail from "@/components/ui/OrganisationRail.jsx";


export default function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const {user, logout} = useAuth()
    const navigate = useNavigate()

    const [organisations, setOrganisations] = useState([])

    useEffect(() => {
        const getOrganisations = async () => {
            const response = await api.get("/organisations/");
            setOrganisations(response.data);
        };

        getOrganisations();
    }, []);
    console.log(organisations)
    useEffect(() => {
        function onConnect() {
            console.log("Connected with id:", socket.id);
            setIsConnected(true);
        }

        function onDisconnect() {
            console.log("Disconnected");
            setIsConnected(false);
        }

        function onServerMessage(data) {
            console.log("Message from server:", data);
            setMessages((prev) => [...prev, data.text]);
        }

        function onConnectError(err) {
            console.error("Connection error:", err.message);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("server_message", onServerMessage);
        socket.on("connect_error", onConnectError);

        socket.connect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("server_message", onServerMessage);
            socket.off("connect_error", onConnectError);
            socket.disconnect();
        };
    }, []);

    function sendMessage() {
        if (!input.trim()) return;

        socket.emit("client_message", {text: input});
        setInput("");
    }

    function joinGeneral() {
        socket.emit("join_room", {room: "general"});
    }

    return (<></>
        // <div className="h-screen w-screen overflow-hidden">
        //     <OrganisationRail/>
        //
        //     <SidebarProvider>
        //         <Sidebar className="!left-16">
        //             <SidebarHeader>
        //                 <div className="p-2 font-semibold">
        //                     Current Workspace
        //                 </div>
        //             </SidebarHeader>
        //
        //             <SidebarContent>
        //                 <SidebarGroup>
        //                     <div className="p-2" onClick={joinGeneral}>
        //                         # general
        //                     </div>
        //                 </SidebarGroup>
        //             </SidebarContent>
        //
        //             <SidebarFooter>
        //                 <DropdownMenu>
        //                     <DropdownMenuTrigger asChild>
        //                         <button
        //                             className="m-2 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg border border-zinc-700 p-2 hover:bg-zinc-800 transition-colors">
        //                             <div className="flex items-center gap-2">
        //                                 <div className="relative w-10 h-10">
        //                                     <img
        //                                         src="/avatar.png"
        //                                         alt="User"
        //                                         className="w-full h-full rounded-full"
        //                                     />
        //
        //                                     {isConnected && (
        //                                         <span
        //                                             className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"/>
        //                                     )}
        //                                 </div>
        //
        //                                 <div className="text-left">
        //                                     <p className="text-sm font-semibold">
        //                                         {user.username}
        //                                     </p>
        //
        //                                     <p className="text-xs text-zinc-400">
        //                                         Online
        //                                     </p>
        //                                 </div>
        //                             </div>
        //
        //                             <ChevronsUpDown className="h-4 w-4 text-zinc-400"/>
        //                         </button>
        //                     </DropdownMenuTrigger>
        //
        //                     <DropdownMenuContent
        //                         side="top"
        //                         align="end"
        //                         className="w-56"
        //                     >
        //                         <DropdownMenuLabel>
        //                             My Account
        //                         </DropdownMenuLabel>
        //
        //                         <DropdownMenuSeparator/>
        //
        //                         <DropdownMenuItem>
        //                             <User className="mr-2 h-4 w-4"/>
        //                             Profile
        //                         </DropdownMenuItem>
        //
        //                         <DropdownMenuItem>
        //                             <Settings className="mr-2 h-4 w-4"/>
        //                             Settings
        //                         </DropdownMenuItem>
        //
        //                         <DropdownMenuSeparator/>
        //
        //                         <DropdownMenuItem
        //                             onClick={() => {
        //                                 logout();
        //                                 navigate("/login", {replace: true});
        //                             }}
        //                             className="text-red-500 focus:text-red-500"
        //                         >
        //                             <LogOut className="mr-2 h-4 w-4"/>
        //                             Logout
        //                         </DropdownMenuItem>
        //                     </DropdownMenuContent>
        //                 </DropdownMenu>
        //             </SidebarFooter>
        //         </Sidebar>
        //
        //         <SidebarInset className="h-screen !ml-16">
        //             <header className="bg-emerald-700 p-5">
        //                 <h1 className="text-xl font-bold underline">
        //                     Channel name or Current DM participant
        //                 </h1>
        //
        //                 <p>
        //                     Status:{" "}
        //                     <strong>
        //                         {isConnected ? "Connected" : "Disconnected"}
        //                     </strong>
        //                 </p>
        //             </header>
        //
        //             <main className="flex h-full flex-col px-6">
        //                 <div className="flex min-h-0 flex-1 flex-col p-2">
        //                     <ul className="min-h-0 flex-1 overflow-y-auto">
        //                         {messages.map((msg, index) => (
        //                             <li key={index} className="py-1">
        //                                 {msg}
        //                             </li>
        //                         ))}
        //                     </ul>
        //                 </div>
        //
        //                 <div className="relative pt-3">
        //                     <Textarea
        //                         className="p-2 mb-3 h-32 leading-normal resize-none"
        //                         value={input}
        //                         onChange={(e) => setInput(e.target.value)}
        //                         placeholder="Type a message..."
        //                     />
        //
        //                     <Button
        //                         onClick={sendMessage}
        //                         className="absolute bottom-5 right-2"
        //                     >
        //                         Send
        //                     </Button>
        //                 </div>
        //             </main>
        //         </SidebarInset>
        //     </SidebarProvider>
        // </div>
    );
}