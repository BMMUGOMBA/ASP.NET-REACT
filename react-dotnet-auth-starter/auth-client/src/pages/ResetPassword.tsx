import { useForm } from "react-hook-form";
import { api } from "../api/axios";

export default function ResetPassword() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token") || "";
  const email = url.searchParams.get("email") || "";
  const { register, handleSubmit } = useForm<{ password: string }>();

  return (
    <form onSubmit={handleSubmit(async ({ password }) => {
      await api.post("/auth/reset-password", { email, token, newPassword: password });
      alert("Password reset. Please login.");
      window.location.href = "/login";
    })}>
      <h2>Reset Password</h2>
      <input defaultValue={email} disabled />
      <input placeholder="New password" type="password" {...register("password", { required: true, minLength: 8 })} />
      <button>Reset</button>
    </form>
  );
}
