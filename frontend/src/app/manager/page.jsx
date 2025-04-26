import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ManagerView from "./ManagerView"; // New client-side component

export default async function ManagerPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }
  
  if (!session.user?.email?.endsWith("@tamu.edu")) {
    redirect("/");
  }

  return <ManagerView />;
}
