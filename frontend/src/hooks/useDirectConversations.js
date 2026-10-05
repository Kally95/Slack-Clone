import api from "@/api/client.js"
import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/react-query/constants.js";

export async function getDirectConversations(organisation_id) {
    const {data} = await api.get(`/organisations/${organisation_id}/direct-conversations`)
    return data.conversations
}

export function useDirectConversations(organisation_id){
    return useQuery({
        queryKey: [queryKeys.direct_conversations, organisation_id],
        queryFn: () => getDirectConversations(organisation_id),
        enabled: !!organisation_id
    })
}
