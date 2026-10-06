import {
    Outlet,
    NavLink,
    useNavigate,
    useOutletContext,
    useParams,
    Navigate,
} from "react-router-dom";
import {useState} from "react";
import Avatar from "boring-avatars";
import {
    Hash,
    MessageCircle,
    SquareArrowRightExit,
    ChevronsUpDown,
    LogOut,
    Settings,
    User,
    MessageSquareText
} from "lucide-react";
import {useAuth} from "@/contexts/AuthContext.jsx";
import {
    useAddOrganisationMember,
    useGetOrganisationMembers,
    useOrganisation,
} from "@/hooks/useOrganisations.js";
import {useChannels, useCreateChannel} from "@/hooks/useChannels.js";
import {useDirectConversations} from "@/hooks/useDirectConversations.js";
import {socket} from "@/socket.js";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar.jsx";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";

import {Modal} from "@/components/ui/Modal.jsx";
import {Field} from "@/components/ui/field.jsx";
import {Label} from "@/components/ui/label.jsx";
import {Input} from "@/components/ui/input.jsx";

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/components/ui/tooltip.jsx";
import {useCookies} from "react-cookie";
import api from "@/api/client.js";
import {useMutation} from "@tanstack/react-query";


const addMemberSchema = z.object({
    email: z.email("Enter a valid email"),
});

const createChannelSchema = z.object({
    name: z.string().min(1, "Channel name is required"),
});


export default function OrganisationLayout() {
    const {isConnected} = useOutletContext();
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const {organisationId} = useParams();

    /*
     * This is the gatekeeper query.
     *
     * Before we fetch channels, members or direct conversations,
     * we first make sure the logged-in user can actually access
     * this organisation.
     */
    const {
        data: organisation,
        isLoading: organisationLoading,
        isFetching: organisationFetching,
        error: organisationError,
    } = useOrganisation(organisationId);

    /*
     * Only allow the other organisation queries to run after:
     *
     * 1. We have received organisation data
     * 2. The organisation request isn't currently being re-fetched
     * 3. The organisation request has not produced an error
     *
     * isFetching is important because React Query may have cached
     * organisation data from earlier.
     */
    const canAccessOrganisation =
        !!organisation &&
        !organisationFetching &&
        !organisationError;

    const {
        data: channels = [],
    } = useChannels(
        organisationId,
        canAccessOrganisation
    );

    const {
        data: directConversations = [],
    } = useDirectConversations(
        organisationId,
        canAccessOrganisation
    );

    const {
        data: organisationMembers = [],
    } = useGetOrganisationMembers(
        organisationId,
        canAccessOrganisation
    );

    const [, setCookie] = useCookies(["currentChannel"]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [createChannelOpen, setCreateChannelOpen] = useState(false);

    const isAdmin =
        organisation?.current_user_membership?.admin === true;


    const addMemberForm = useForm({
        resolver: zodResolver(addMemberSchema),
    });

    const createChannelForm = useForm({
        resolver: zodResolver(createChannelSchema),
    });


    const addMemberMutation = useAddOrganisationMember(
        addMemberForm.setError,
        setAddMemberOpen
    );

    const createChannelMutation =
        useCreateChannel(organisationId);


    function sendMessage() {
        if (!input.trim()) return;

        socket.emit("client_message", {
            text: input,
            organisationId,
        });

        setMessages((prev) => [...prev, input]);
        setInput("");
    }


    function joinGeneral() {
        socket.emit("join_room", {
            room: `organisation:${organisationId}:general`,
        });
    }


    const onAddMemberSubmit = (data) => {
        addMemberMutation.mutate({
            organisation_id: organisation.id,
            data,
        });
    };


    const startConversationMutation = useMutation({
        mutationFn: (recipientUserId) => {
            console.log(
                "Starting conversation with:",
                recipientUserId
            );

            return api.post(
                `/organisations/${organisationId}/direct-conversations/${recipientUserId}`
            );
        },

        onSuccess: ({data}) => {
            console.log(
                "Conversation response:",
                data
            );

            navigate(
                `/app/organisations/${organisationId}/direct-messages/${data.id}`
            );
        },

        onError: (error) => {
            console.error(
                "Failed to start conversation:",
                error.response?.status,
                error.response?.data || error.message
            );
        },
    });


    const onCreateChannelSubmit = (channelData) => {
        createChannelMutation.mutate(channelData, {
            onSuccess: () => {
                createChannelForm.reset();
                setCreateChannelOpen(false);
            },

            onError: (error) => {
                createChannelForm.setError("name", {
                    type: "server",
                    message:
                        error.response?.data?.message ||
                        "Failed to create channel",
                });
            },
        });
    };


    /*
     * While the backend is deciding whether the logged-in user
     * has access to this organisation, don't render the workspace.
     *
     * This also prevents cached organisation data belonging to a
     * previous session from briefly appearing.
     */
    if (organisationLoading || organisationFetching) {
        return (
            <div className="ml-16 p-5">
                Loading workspace...
            </div>
        );
    }


    /*
     * If the backend says this organisation doesn't exist or the
     * logged-in user isn't allowed to access it, send them back
     * to /app.
     *
     * AppIndexRedirect can then send them to their valid saved
     * organisation if they have one.
     */
    if (
        organisationError?.response?.status === 403 ||
        organisationError?.response?.status === 404
    ) {
        return <Navigate to="/app" replace/>;
    }


    return (
        <SidebarProvider>

            <Sidebar className="!left-16">

                <SidebarHeader>
                    <div className="p-2 font-semibold">

                        {organisation ? (
                            <span className="flex items-center gap-2">

                                {organisation.name}

                                <SquareArrowRightExit
                                    className="ml-auto h-4 w-4"
                                />

                            </span>
                        ) : (
                            "Current Workspace"
                        )}

                    </div>
                </SidebarHeader>


                <hr/>


                <SidebarContent>

                    <SidebarGroup>

                        <SidebarGroupLabel
                            className="flex items-center gap-2 text-lg"
                        >
                            <Hash className="h-4 w-4"/>

                            <span>
                                Channels
                            </span>

                        </SidebarGroupLabel>


                        <SidebarGroupContent>

                            {channels.length === 0 ? (

                                <div className="p-2 text-sm text-zinc-500">
                                    <span>
                                        # No channels
                                    </span>
                                </div>

                            ) : (

                                channels.map((channel) => (

                                    <NavLink
                                        key={channel.id}
                                        to={`channels/${channel.id}`}
                                        className={({isActive}) =>
                                            isActive
                                                ? "bg-zinc-800 block w-full p-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                                : "block w-full p-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        }
                                        onClick={() => {
                                            setCookie(
                                                "currentChannel",
                                                channel.id,
                                                {path: "/"}
                                            );
                                        }}
                                    >
                                        #{" "}
                                        {channel?.name.toLowerCase()}
                                    </NavLink>

                                ))

                            )}


                            {isAdmin && (

                                <button
                                    className="w-full p-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    onClick={() =>
                                        setCreateChannelOpen(true)
                                    }
                                >
                                    + Add channel
                                </button>

                            )}


                            <Modal
                                open={createChannelOpen}
                                onOpenChange={setCreateChannelOpen}
                                title="Create a Channel"
                                description="Create a new channel for this organisation."
                                submitText="Create Channel"
                                onSubmit={createChannelForm.handleSubmit(
                                    onCreateChannelSubmit
                                )}
                                isSubmitting={
                                    createChannelMutation.isPending
                                }
                            >

                                <Field>

                                    <Label htmlFor="channel-name">
                                        Channel name
                                    </Label>

                                    <Input
                                        {...createChannelForm.register(
                                            "name"
                                        )}
                                        id="channel-name"
                                        placeholder="general"
                                    />

                                    {createChannelForm.formState.errors.name && (

                                        <span className="text-sm text-red-500">

                                            {
                                                createChannelForm
                                                    .formState
                                                    .errors
                                                    .name
                                                    .message
                                            }

                                        </span>

                                    )}

                                </Field>

                            </Modal>

                        </SidebarGroupContent>

                    </SidebarGroup>


                    <hr/>


                    <SidebarGroup>

                        <SidebarGroupLabel
                            className="flex items-center gap-2 text-lg"
                        >

                            <MessageCircle className="h-4 w-4"/>

                            <div className="flex flex-1 items-center justify-between group/dm">

                                <span>
                                    Direct Messages
                                </span>


                                <TooltipProvider>

                                    <Tooltip>

                                        <DropdownMenu>

                                            <TooltipTrigger
                                                asChild
                                                className="pointer-events-auto"
                                            >

                                                <DropdownMenuTrigger asChild>

                                                    <button
                                                        type="button"
                                                        onMouseEnter={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        onMouseLeave={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="relative p-1 rounded hover:bg-zinc-800 cursor-pointer"
                                                    >

                                                        <MessageSquareText
                                                            className="h-4 w-4"
                                                        />

                                                    </button>

                                                </DropdownMenuTrigger>

                                            </TooltipTrigger>


                                            <DropdownMenuContent className="w-32">

                                                <DropdownMenuGroup>

                                                    <DropdownMenuLabel>
                                                        Start Conversation
                                                    </DropdownMenuLabel>

                                                    {organisationMembers
                                                        .filter(
                                                            (member) =>
                                                                member.user.id !==
                                                                user.id
                                                        )
                                                        .map((member) => (

                                                            <DropdownMenuItem
                                                                key={
                                                                    member.id
                                                                }
                                                                onClick={() =>
                                                                    startConversationMutation.mutate(
                                                                        member.user.id
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    member.user
                                                                        .username
                                                                }

                                                            </DropdownMenuItem>

                                                        ))}

                                                </DropdownMenuGroup>

                                            </DropdownMenuContent>

                                        </DropdownMenu>


                                        <TooltipContent>
                                            Start a Conversation
                                        </TooltipContent>

                                    </Tooltip>

                                </TooltipProvider>

                            </div>

                        </SidebarGroupLabel>


                        <SidebarGroupContent>

                            {directConversations.length === 0 && (

                                <div className="p-2 text-sm text-zinc-500">
                                    # No messages
                                </div>

                            )}


                            {directConversations.length > 0 &&
                                directConversations.map(
                                    (conversation) => (

                                        <NavLink
                                            key={conversation.id}
                                            to={`/direct-conversations/${conversation.id}`}
                                            className="w-full p-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white block"
                                        >

                                            {conversation.members
                                                ?.map(
                                                    (member) =>
                                                        member.username
                                                )
                                                .join(", ") ||
                                                "Empty Chat"}

                                        </NavLink>

                                    )
                                )}

                        </SidebarGroupContent>


                        <hr/>


                        <SidebarGroupContent>

                            {organisationMembers.map(
                                (member) => (

                                    <div
                                        className="w-full p-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        key={member.id}
                                    >
                                        {
                                            member.user
                                                .username
                                        }
                                    </div>

                                )
                            )}


                            {isAdmin && (

                                <button
                                    className="w-full p-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    onClick={() =>
                                        setAddMemberOpen(true)
                                    }
                                >
                                    + Add Members
                                </button>

                            )}


                            <Modal
                                open={addMemberOpen}
                                onOpenChange={setAddMemberOpen}
                                title={`Add Member to ${
                                    organisation?.name ||
                                    "Organisation"
                                }`}
                                description="Invite a user to join this organisation by entering their email address."
                                submitText="Add Member"
                                onSubmit={addMemberForm.handleSubmit(
                                    onAddMemberSubmit
                                )}
                                isSubmitting={
                                    addMemberMutation.isPending
                                }
                            >

                                <Field>

                                    <Label htmlFor="email">
                                        Email
                                    </Label>

                                    <Input
                                        {...addMemberForm.register(
                                            "email"
                                        )}
                                        id="email"
                                        placeholder="Your@email.com"
                                    />


                                    {addMemberForm.formState.errors.email && (

                                        <span className="text-sm text-red-500">

                                            {
                                                addMemberForm
                                                    .formState
                                                    .errors
                                                    .email
                                                    .message
                                            }

                                        </span>

                                    )}

                                </Field>

                            </Modal>

                        </SidebarGroupContent>

                    </SidebarGroup>

                </SidebarContent>


                <SidebarFooter>

                    <DropdownMenu>

                        <DropdownMenuTrigger asChild>

                            <button
                                className="m-2 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg border border-zinc-700 p-2 transition-colors hover:bg-zinc-800"
                            >

                                <div className="flex items-center gap-2">

                                    <div className="relative h-10 w-10">

                                        <Avatar
                                            name={user.username}
                                            colors={[
                                                "#0a0310",
                                                "#49007e",
                                                "#ff005b",
                                                "#ff7d10",
                                                "#ffb238",
                                            ]}
                                            variant="beam"
                                        />

                                        {isConnected && (

                                            <span
                                                className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"
                                            />

                                        )}

                                    </div>


                                    <div className="text-left">

                                        <p className="text-sm font-semibold">
                                            {user.username}
                                        </p>

                                        <p className="text-xs text-zinc-400">
                                            Online
                                        </p>

                                    </div>

                                </div>


                                <ChevronsUpDown
                                    className="h-4 w-4 text-zinc-400"
                                />

                            </button>

                        </DropdownMenuTrigger>


                        <DropdownMenuContent
                            side="top"
                            align="end"
                            className="w-56"
                        >

                            <DropdownMenuLabel>
                                My Account
                            </DropdownMenuLabel>


                            <DropdownMenuSeparator/>


                            <DropdownMenuItem>

                                <User className="mr-2 h-4 w-4"/>

                                Profile

                            </DropdownMenuItem>


                            <DropdownMenuItem>

                                <Settings className="mr-2 h-4 w-4"/>

                                Settings

                            </DropdownMenuItem>


                            <DropdownMenuSeparator/>


                            <DropdownMenuItem
                                onClick={() => {
                                    logout();

                                    navigate(
                                        "/login",
                                        {replace: true}
                                    );
                                }}
                                className="text-red-500 focus:text-red-500"
                            >

                                <LogOut className="mr-2 h-4 w-4"/>

                                Logout

                            </DropdownMenuItem>

                        </DropdownMenuContent>

                    </DropdownMenu>

                </SidebarFooter>

            </Sidebar>


            <SidebarInset className="h-screen !ml-16">

                <Outlet
                    context={{
                        organisation,
                        organisationId,
                        isConnected,
                        messages,
                        input,
                        setInput,
                        sendMessage,
                    }}
                />

            </SidebarInset>

        </SidebarProvider>
    );
}