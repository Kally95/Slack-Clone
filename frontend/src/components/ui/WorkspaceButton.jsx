import { useState } from "react";

export default function WorkspaceButton({ organisation, children, ...props}) {
    const [imageFailed, setImageFailed] = useState(false);

    const initials = organisation?.name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const shouldShowImage = organisation?.image_url && !imageFailed;

    return (
        <button
            {...props}
            title={organisation?.name}
            className="w-12 h-12 shrink-0 overflow-hidden rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center hover:rounded-xl transition-all"
        >
            {shouldShowImage ? (
                <img
                    src={organisation.image_url}
                    alt={organisation.name}
                    onError={() => setImageFailed(true)}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-sm leading-none">
                    {organisation ? initials : children}
                </span>
            )}
        </button>
    );
}