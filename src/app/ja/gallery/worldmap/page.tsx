import WorldMap from "@/components/ui/map";

export default async function Page() {
  return (
    <div className="world-map-container">
      <WorldMap locale="ja" />
    </div>
  );
}
