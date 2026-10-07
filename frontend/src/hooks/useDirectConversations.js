import api from "@/api/client.js"
import {useMutation, useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/react-query/constants.js";
import {queryClient} from "@/react-query/queryClient.js";

export async function getDirectConversations(organisation_id) {
    const {data} = await api.get(`/organisations/${organisation_id}/direct-conversations`)
    console.log("getDirectConversations: ", data)
    return data?.conversations
}

export async function createDirectConversation({
                                                   organisation_id,
                                                   recipient_user,
                                               }) {
    console.log("organisation_id: ", typeof(organisation_id), "+", "recipient_id: ", recipient_user)
    const {data} = await api.post(
        `/organisations/${organisation_id}/direct-conversations/${recipient_user}`
    );
    console.log("fired, creating convo")
    console.log(data)
    return data;
}

export function useCreateDirectConversation(organisation_id) {
    return useMutation({
        mutationFn: createDirectConversation,
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [queryKeys.direct_conversations, organisation_id]
        })
    });
}

export function useGetDirectConversations(organisation_id) {
    console.log("useGetDirectConversations: ", organisation_id)
    return useQuery({
        queryKey: [queryKeys.direct_conversations, organisation_id],
        queryFn: () => getDirectConversations(organisation_id),
        enabled: !!organisation_id
    })
}