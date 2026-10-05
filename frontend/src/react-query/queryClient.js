import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query"
import {toast} from "sonner";
import {toastStyles} from "@/react-query/constants.js";

export function errorHandler(error) {
    const message =
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";

    toast.error(message, { style: toastStyles.error });
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 600000,
            gcTime: 900000,
            refetchOnWindowFocus: false,
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            errorHandler(error);
        },
    }),

    // mutationCache: new MutationCache({
    //     onError: (error) => {
    //         errorHandler(error);
    //     },
    // }),
})