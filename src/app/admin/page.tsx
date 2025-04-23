// File: src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin");
  }
  // Optionally check for "admin" role server-side here
  return <AdminPanel />;
}
