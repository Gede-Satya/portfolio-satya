import { getPortfolioContentAsync } from "@/lib/storage";
import { PortfolioView } from "@/components/PortfolioView";

export default async function Home() {
  const initialData = await getPortfolioContentAsync();
  return <PortfolioView initialData={initialData} />;
}
