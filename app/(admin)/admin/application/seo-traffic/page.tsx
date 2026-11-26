import { SeoTrafficScreen } from "@/components/admin/seo/traffic/seo-traffic-screen";
import { getSeoTraffic } from "@/lib/admin/seo-traffic";

export default async function SeoTrafficPage() {
  return <SeoTrafficScreen initial={await getSeoTraffic(28)} />;
}
