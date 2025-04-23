// src/app/resources/videos/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import VideoLibrary from "@/components/VideoLibrary";

export default async function ResourcesVideosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");
  return <VideoLibrary />;
}
