import { getPortfolioContent } from "@/lib/storage";
import { PortfolioView } from "@/components/PortfolioView";

export default function Home() {
  const initialData = getPortfolioContent();
  return <PortfolioView initialData={initialData} />;
}
