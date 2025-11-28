import WorldMap from "@/components/ui/worldMap";

export default async function Page() {
  return (
    <div className="world-map-container">
      <WorldMap locale="ja" />
    </div>
  );
}
