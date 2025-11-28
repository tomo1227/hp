import WorldMap from "@/components/ui/worldMap";
import { getCountries } from "@/lib/galleryFilter";

export default async function Page() {
  const countries = await getCountries({ locale: "ja" });
  return (
    <div className="world-map-container">
      <WorldMap locale="ja" countries={countries} />
    </div>
  );
}
