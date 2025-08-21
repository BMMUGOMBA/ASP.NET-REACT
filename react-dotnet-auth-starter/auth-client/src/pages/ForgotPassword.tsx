import { useForm } from "react-hook-form";
import { api } from "../api/axios";

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  return (
    <form onSubmit={handleSubmit(async ({ email }) => {
      await api.post("/auth/forgot-password", { email });
      alert("If the email exists, a reset link was sent (check server console in dev).");
    })}>
      <h2>Forgot Password</h2>
      <input placeholder="Email" {...register("email", { required: true })} />
      <button>Send reset link</button>
    </form>
  );
}
