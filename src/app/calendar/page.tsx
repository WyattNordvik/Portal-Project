import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Calendar from "@/components/Calendar";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Events Calendar</h1>
      <Calendar />
    </div>
  );
}

