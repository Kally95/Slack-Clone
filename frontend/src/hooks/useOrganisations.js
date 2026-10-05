import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {queryKeys, toastStyles} from "@/react-query/constants.js";
import api from "@/api/client.js"
import {toast} from "sonner";

async function getOrganisations() {
    const {data} = await api.get("/organisations");
    return data.organisations;
}

async function getOrganisation(organisationId) {
    const {data} = await api.get(`/organisations/${organisationId}`)
    return {
        ...data.organisation,
        current_user_membership: data.current_user_membership,
    };
}

async function createOrganisation(data) {
    const response = await api.post("/organisations/", data)
    return response.data
}

async function addOrganisationMember(organisation_id, data) {
    const response = await api.post(`organisations/${organisation_id}/members`, data)
    return response.data
}

async function getOrganisationMembers(organisationId) {
  const response = await api.get(`organisations/${organisationId}/members`);
  return response.data.members;
}

export function useOrganisations() {
    return useQuery({
        queryKey: [queryKeys.organisations],
        queryFn: getOrganisations,
    });
}

export function useGetOrganisationMembers(organisationId) {
    return useQuery({
            queryKey: [queryKeys.organisation_members, organisationId],
            queryFn: () => getOrganisationMembers(organisationId),
            enabled: !!organisationId
        }
    )
}

export function useAddOrganisationMember(setError, setOpen) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({organisation_id, data}) => addOrganisationMember(organisation_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.organisations],
            });

            toast.success("Member successfully added!", {style: toastStyles.success});
            setOpen(false)
        },
        onError: (error) => {
            setError("email", {
                type: "server",
                message: error.response?.data?.error || "Could not add member",
            });
        }
    })
}

export function useOrganisation(organisationId) {
    return useQuery({
        queryKey: [queryKeys.organisations, organisationId],
        queryFn: () => getOrganisation(organisationId),
        enabled: !!organisationId
    })
}

export function useCreateOrganisation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrganisation,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.organisations],
            });

            toast.success("Organisation created successfully!", {style: toastStyles.success});
        },
    });
}

