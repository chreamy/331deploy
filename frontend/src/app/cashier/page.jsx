import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CashierView from "./CashierView"; // Import the client-side component

export default async function CashierPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }
  
  if (!session.user?.email?.endsWith("@tamu.edu")) {
    redirect("/");
  }

  return <CashierView />;
}
