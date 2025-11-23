import World from "@/components/ui/worldmap";

export default async function Page() {
  return (
    <div className="worldmap-container">
      <World locale="en" />
    </div>
  );
}
