import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../api/axios";
import { useAuth } from "../store/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});
type Form = z.infer<typeof schema>;

export default function Register() {
  const { setAuth } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      const res = await api.post("/auth/register", data);
      alert("Registration successful. Please check dev server console for the email confirmation link.");
      setAuth(res.data.user, res.data.accessToken, res.data.expiresAt);
      window.location.href = "/login";
    })}>
      <h2>Register</h2>
      <input placeholder="Email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <input placeholder="First name" {...register("firstName")} />
      {errors.firstName && <p>{errors.firstName.message}</p>}
      <input placeholder="Last name" {...register("lastName")} />
      {errors.lastName && <p>{errors.lastName.message}</p>}
      <input placeholder="Password" type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}
      <button disabled={isSubmitting}>Create account</button>
    </form>
  );
}
