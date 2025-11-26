import JapanMap from "@/components/ui/japanMap";

export default async function Page() {
  return (
    <div className="japan-map-container">
      <JapanMap locale="ja" />
    </div>
  );
}
