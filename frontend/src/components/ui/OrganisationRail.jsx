import WorkspaceButton from "@/components/ui/WorkspaceButton.jsx";
import {useCreateOrganisation, useOrganisations} from "@/hooks/useOrganisations.js";
import {useState} from "react";
import {Modal} from "@/components/ui/Modal.jsx";
import {Field} from "@/components/ui/field.jsx";
import {Label} from "@/components/ui/label.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Textarea} from "@/components/ui/textarea.jsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {errorHandler} from "@/react-query/queryClient.js";
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";

const createOrganisationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Organisation name is required")
        .max(100, "Organisation name can be at most 100 characters"),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(255, "Description can be at most 255 characters"),
});


export default function OrganisationRail() {
    const {data: organisations} = useOrganisations()
    const [open, setOpen] = useState(false);
    const createOrganisationMutation = useCreateOrganisation();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: {errors},
    } = useForm({
        resolver: zodResolver(createOrganisationSchema),
    });
    const [, setCookie] = useCookies(['currentOrganisation'])


    const onSubmit = async (data) => {
        try {
            await createOrganisationMutation.mutateAsync(data);
            reset()
            setOpen(false);
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                "Something went wrong";

            if (message.toLowerCase().includes("organisation")) {
                setError("name", {
                    type: "server",
                    message,
                });

                return;
            }

            errorHandler(error);
        }
    };

    return <div
        className="fixed left-0 top-0 z-50 h-screen w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-3 gap-3">
        {organisations?.map(org => (
            <WorkspaceButton
                key={org.id}
                organisation={org}
                onClick={() => {
                    navigate(`/app/organisations/${org.id}`);
                    setCookie('currentOrganisation', org.id, { path: '/' })
                }}
            />
        ))}

        <WorkspaceButton className="outline" onClick={() => setOpen(true)}>
            +
        </WorkspaceButton>

        <Modal
            open={open}
            title="Create an Organisation"
            description="Create a new organisation to collaborate with your team."
            submitText="Create"
            onOpenChange={setOpen}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={createOrganisationMutation.isPending}
        >
            <Field>
                <Label htmlFor="name">Organisation name</Label>
                <Input id="name" {...register("name")} placeholder="ABC. Co"/>
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </Field>

            <Field>
                <Label htmlFor="description">Description</Label>
                <Textarea maxLength={255} id="description" {...register("description")}
                          placeholder="A collaborative workspace for our team and projects."/>
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </Field>
        </Modal>
    </div>

}