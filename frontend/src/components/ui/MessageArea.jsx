import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";

export default function MessageArea({
    value,
    onChange,
    onClick,
    placeholder,
    disabled
}) {

    return (
        <div className="relative pt-3 mb-3">
            <Textarea
                className="mb-3 h-32 resize-none p-2 leading-normal"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />

            <Button
                onClick={onClick}
                disabled={disabled}
                className="absolute bottom-5 right-2 cursor-pointer"
            >
                Send
            </Button>
        </div>
    );
}