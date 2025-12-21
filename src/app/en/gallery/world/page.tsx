import WorldMap from "@/components/ui/worldMap";
import { getCountries } from "@/lib/galleryFilter";

export default async function Page() {
  const countries = await getCountries({ locale: "en" });
  return (
    <div className="world-map-container">
      <WorldMap locale="en" countries={countries} />
    </div>
  );
}
