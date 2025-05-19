import Calendar from "@/components/ui/calendar";
import { formattedDateWithHyphen } from "@/lib/date";
import { getFilteredPosts } from "@/lib/galleryFilter";
import type { CalendarEvent } from "@/types/calendarEvent";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Calendar in tomokiota.com",
  description: "This is a schedule calendar of photos Tomoki Ota took.",
  alternates: {
    canonical: "https://tomokiota.com/en/calendar",
  },
};
export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
  });
  const events: CalendarEvent[] = posts.map((post) => ({
    title: post.frontmatter.title,
    date: formattedDateWithHyphen(post.frontmatter.date),
    url: `/en/gallery/${post.slug}`,
  }));

  return (
    <div>
      <Calendar locale="en" events={events} />
    </div>
  );
}
