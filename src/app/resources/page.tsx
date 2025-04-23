// src/app/resources/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import PhotoGallery from "@/components/PhotoGallery";

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return <PhotoGallery />;
}
