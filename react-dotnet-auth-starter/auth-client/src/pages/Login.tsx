import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../api/axios";
import { useAuth } from "../store/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional()
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const { setAuth } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { rememberMe: false }
  });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      try {
        const res = await api.post("/auth/login", data);
        setAuth(res.data.user, res.data.accessToken, res.data.expiresAt);
        window.location.href = "/dashboard";
      } catch (e: any) {
        alert(e?.response?.data ?? "Login failed");
      }
    })}>
      <h2>Login</h2>
      <input placeholder="Email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <input placeholder="Password" type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}
      <label><input type="checkbox" {...register("rememberMe")} /> Remember me</label>
      <button disabled={isSubmitting}>Sign in</button>
      <p><a href="/forgot-password">Forgot password?</a></p>
    </form>
  );
}
