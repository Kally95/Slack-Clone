import {z} from "zod";
import {useAuth} from "@/contexts/AuthContext.jsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useNavigate, Link} from "react-router-dom";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.jsx";
import {Label} from "@/components/ui/label.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Button} from "@/components/ui/button.jsx";
import api from "../api/client.js";
import {toast} from "sonner";

const schema = z.object({
    username: z.string().max(50),
    email: z.email("Invalid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password can be at most 255 characters"),
});


export default function RegisterPage() {
    const navigate = useNavigate();
    const {setUser, user} = useAuth();

    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isSubmitting},
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            const response = await api.post("/auth/register", {
                username: data["username"],
                email: data["email"],
                password: data["password"]
            })
            const user = response.data.user;

            if (!user) {
                setError("root", {
                    message: "No user returned from backend",
                });
                return;
            }
            setUser(user);
            toast.success(response.data.message);
            navigate("/app", {replace: true});
        } catch (error) {
            const message = error.response?.data?.error || "Something went wrong";

            setError("root", {
                message,
            });
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Register</CardTitle>
                    <CardDescription>
                        Create an account to get started. It only takes a minute.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Username</Label>
                            <Input
                                id="username"
                                type="username"
                                placeholder="John123"
                                {...register("username")}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {errors.root?.message && (
                            <p className="text-sm text-red-500">{errors.root.message}</p>
                        )}

                        <Button className="w-full" disabled={isSubmitting} type="submit">
                            {isSubmitting ? "Registering..." : "Login"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
                                Login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}