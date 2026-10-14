import { getPortfolioContentAsync } from "@/lib/storage";
import { PortfolioView } from "@/components/PortfolioView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const initialData = await getPortfolioContentAsync();
  return <PortfolioView initialData={initialData} />;
}
