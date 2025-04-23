// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // server-side redirect
    return redirect("/signin");
  }
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {session.user?.email}</h1>
      {/* ...dashboard contents... */}
    </div>
  );
}

