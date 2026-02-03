import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MarketingClient } from "@/components/marketing/MarketingClient";

export default function MarketingPage() {
  const { userId } = auth();

  if (userId) {
    redirect("/app");
  }

  return <MarketingClient />;
}