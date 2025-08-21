import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const api = useAxiosPrivate();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api.get("/users/me").then(r => setMe(r.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {me ? <pre>{JSON.stringify(me, null, 2)}</pre> : "Loading..."}
    </div>
  );
}
