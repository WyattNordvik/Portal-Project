// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // Not signed in? Send them to sign-in page
    redirect("/signin");
  }
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Welcome back, {session.user?.name || session.user?.email}!
      </h1>
      {/* put the upload UI here */}
	  <section>
		<h2 className="text-2xl font-semibold mb-4">Upload Resources</h2>
		<FileUpload />
	  </section>
	  <section>
		<h2 className="text-2xl font-semibold mb-4">Uploaded Files</h2>
		<FileList />
	  </section>
	  {/* TODO: Add dashboard widgets here */}
    </div>
  );
}

