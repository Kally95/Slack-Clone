import {Modal} from "@/components/ui/Modal.jsx";
import {Field} from "@/components/ui/field.jsx";
import {Label} from "@/components/ui/label.jsx";
import {Input} from "@/components/ui/input.jsx";
import {useCreateChannel} from "@/hooks/useChannels.js";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {z} from "zod";

const createChannelSchema = z.object({
    name: z.string().min(1, "Channel name is required"),
});

export default function CreateChannelModal({organisationId, open, onOpenChange}) {

    const createChannelForm = useForm({
        resolver: zodResolver(createChannelSchema),
    });

    const createChannelMutation =
        useCreateChannel(organisationId);

    const onCreateChannelSubmit = (channelData) => {
        createChannelMutation.mutate(channelData, {
            onSuccess: () => {
                createChannelForm.reset();
                onOpenChange(false);
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

    return <Modal
        open={open}
        onOpenChange={onOpenChange}
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
}