// client/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthApi } from "../api/auth";

export default function Dashboard() {
  const { getProfile } = useAuthApi();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Logged in as: {user?.email}</p>
      {profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
