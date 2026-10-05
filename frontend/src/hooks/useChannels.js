import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {queryKeys} from "@/react-query/constants.js";
import api from "@/api/client.js"

async function getOrganisationChannels(organisationId) {
    const { data } = await api.get(`/organisations/${organisationId}/channels`);
    return data.channels;
}

async function createOrganisationChannel({organisationId, channelData }) {
    const { data } = await api.post(`/organisations/${organisationId}/channels`, channelData);
    return data.channel;
}

async function getChannelById(channelId){
    const { data } = await api.get(`/channels/${channelId}`)
    return data.channel
}

async function createChannelMessage({ channelId, body }) {
    console.log(channelId, body)
  const { data } = await api.post(`/channels/${channelId}/messages`, {
    body,
  });
    console.log(data)
  return data.message_data;
}

async function getChannelMessages(channelId){
    const {data} = await api.get(`/channels/${channelId}/messages`)
    return data.messages
}

export function useChannels(organisationId) {
  return useQuery({
    queryKey: [queryKeys.channels, organisationId],
    queryFn: () => getOrganisationChannels(organisationId),
    enabled: !!organisationId,
  });
}

export function useGetChannel(channelId){
    return useQuery({
        queryFn: () => getChannelById(channelId),
        queryKey: [queryKeys.channels, channelId]
    })
}

export function useCreateChannel(organisationId){
     const queryClient = useQueryClient();

     return useMutation({
         mutationFn: (channelData) => createOrganisationChannel({ organisationId, channelData }),
         onSuccess: () => queryClient.invalidateQueries({
             queryKey: [queryKeys.channels, organisationId]
         })
     })
}

export function useCreateChannelMessage(channelId) {
  const queryClient = useQueryClient();
    console.log(typeof channelId)
  return useMutation({
    mutationFn: (body) =>
      createChannelMessage({ channelId, body }),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [queryKeys.channel_messages, channelId],
      }),
  });
}

export function useGetChannelMessages(channelId){
    return useQuery({
        queryFn: () => getChannelMessages(channelId),
        queryKey: [queryKeys.channel_messages, channelId]
    })
}