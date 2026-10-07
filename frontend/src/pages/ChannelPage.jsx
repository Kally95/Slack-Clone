import {useOutletContext, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useCreateChannelMessage, useGetChannel, useGetChannelMessages} from "@/hooks/useChannels.js";
import MessageArea from "@/components/ui/MessageArea.jsx";
import Avatar from "boring-avatars";
import {capitalise, ukTimeFormatter} from "@/lib/utils.js";
import {socket} from "@/socket.js";
import {queryClient} from "@/react-query/queryClient.js";
import {queryKeys} from "@/react-query/constants.js";
import useDebounce from "@/hooks/useDebounce.jsx";


export default function ChannelPage() {
    const latestMessageRef = useRef()
    const {channelId} = useParams();
    const {data: channel} = useGetChannel(channelId)
    const [input, setInput] = useState("");
    const createMessageMutation = useCreateChannelMessage(channelId)
    const [isTyping, setIsTyping] = useState(false)
    const debouncedStopTyping = useDebounce(() => {
        setIsTyping(false)
    }, 3000)
    const [typingUser, setTypingUser] = useState()

    const {
        organisation,
    } = useOutletContext();

    const channelName = channel?.name
    const {data: channelMessages} = useGetChannelMessages(channelId)

    useEffect(() => {

        const handleUserTyping = ({username}) => {
            setTypingUser(username)
            setIsTyping(true)
            debouncedStopTyping()
        }
        socket.on("user_typing", handleUserTyping);

        function joinRoom() {
            socket.emit("join_room", {
                channel_id: channelId,
            });
        }

        if (socket.connected) {
            joinRoom();
        } else {
            socket.on("connect", joinRoom);
        }

        return () => {
            socket.off("connect", joinRoom);
            socket.off("connect", joinRoom);
            socket.off("user_typing", handleUserTyping);
            socket.emit("leave_room", {
                channel_id: channelId,
            });
        };
    }, [channelId]);

    useEffect(() => {
        function handleMessageCreated(payload) {
            queryClient.setQueryData(
                [queryKeys.channel_messages, channelId],
                (old = []) => {
                    return [...old, payload.message];
                }
            );
        }

        socket.on("message_created", handleMessageCreated);

        return () => {
            socket.off("message_created", handleMessageCreated);
        };
    }, [channelId, queryClient]);

    useEffect(() => {
        if (!latestMessageRef.current) return;
        latestMessageRef.current.scrollIntoView({behavior: 'smooth'})
    }, [channelMessages])

    function sendChannelMessage() {
        const message = input.trim();

        if (!message) return;

        createMessageMutation.mutate(message, {
            onSuccess: (returnedData) => {
                setInput("");
            }
        });
    }

    function handleOnChange(e) {
        setInput(e.target.value)
        socket.emit("typing", {
            channel_id: channelId,
        });

    }

    return (
        <div className="flex h-screen flex-col">
            <header className="border-b border-zinc-800 p-5">
                <h1 className="text-xl font-bold"># {channelName ?? (channelName)}</h1>
                <p className="text-sm text-zinc-400">
                    {capitalise(organisation?.name)}
                </p>
            </header>

            <main className="flex min-h-0 flex-1 flex-col px-6">
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                    Messages for this channel will go here.
                    <ul>
                        {channelMessages?.map((message) => (
                            <li key={message.id}>
                                <div className="flex gap-2 my-3">
                                    <div><Avatar
                                        name={message.user.username}
                                        colors={[
                                            "#0a0310",
                                            "#49007e",
                                            "#ff005b",
                                            "#ff7d10",
                                            "#ffb238",
                                        ]}
                                        variant="beam"
                                    /></div>

                                    <div>
                                        <div>
                                            <span className="font-bold capitalize mr-2">{message.user.username}</span>
                                            <span
                                                className="text-zinc-400 text-xs">{ukTimeFormatter(message.created_at)}</span>
                                        </div>
                                        <div>
                                            {message.body}
                                        </div>

                                    </div>
                                    <div ref={latestMessageRef}></div>
                                </div>

                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    {isTyping && <span className="text-zinc-400 text-xs">{typingUser} is typing...</span>}
                </div>
                <MessageArea value={input} onChange={handleOnChange} placeholder="Type a message..."
                             onClick={sendChannelMessage} disabled={createMessageMutation.isPending}/>

            </main>
        </div>
    );
}