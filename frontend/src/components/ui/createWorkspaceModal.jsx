import { useCreateOrganisation } from "@/hooks/useOrganisations.js";
import { Modal } from "@/components/ui/Modal.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { errorHandler } from "@/react-query/queryClient.js";

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

export default function CreateWorkspaceModal({ open, onOpenChange }) {
    const createOrganisationMutation = useCreateOrganisation();

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createOrganisationSchema),
    });

    const onSubmit = async (data) => {
        try {
            await createOrganisationMutation.mutateAsync(data);

            reset();
            onOpenChange(false);
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

    return (
        <Modal
            open={open}
            title="Create an Organisation"
            description="Create a new organisation to collaborate with your team."
            submitText="Create"
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={createOrganisationMutation.isPending}
        >
            <Field>
                <Label htmlFor="name">Organisation name</Label>

                <Input
                    id="name"
                    {...register("name")}
                    placeholder="ABC. Co"
                />

                {errors.name && (
                    <p className="text-sm text-red-500">
                        {errors.name.message}
                    </p>
                )}
            </Field>

            <Field>
                <Label htmlFor="description">Description</Label>

                <Textarea
                    id="description"
                    maxLength={255}
                    {...register("description")}
                    placeholder="A collaborative workspace for our team and projects."
                />

                {errors.description && (
                    <p className="text-sm text-red-500">
                        {errors.description.message}
                    </p>
                )}
            </Field>
        </Modal>
    );
}