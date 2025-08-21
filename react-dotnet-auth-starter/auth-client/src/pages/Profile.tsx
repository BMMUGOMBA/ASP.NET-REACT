import { useAuth } from "../store/auth";

export default function Profile() {
  const { user } = useAuth();
  return (
    <div>
      <h2>Profile</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
