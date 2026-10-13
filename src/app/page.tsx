import { Suspense } from "react";
import { getPortfolioContentAsync } from "@/lib/storage";
import { PortfolioView } from "@/components/PortfolioView";

export const dynamic = "force-dynamic";

async function PortfolioContentWrapper() {
  const initialData = await getPortfolioContentAsync();
  return <PortfolioView initialData={initialData} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060911]" />}>
      <PortfolioContentWrapper />
    </Suspense>
  );
}
