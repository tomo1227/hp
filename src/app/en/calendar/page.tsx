import Calendar from "@/components/ui/calendar";
import { formattedDateWithHyphen } from "@/lib/date";
import { getFilteredPosts } from "@/lib/galleryFilter";
import { getFilteredItineraries } from "@/lib/itineraryFilter";
import type { CalendarEvent } from "@/types/calendarEvent";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Calendar in tomokiota.com",
  description: "This is a schedule calendar of photos Tomoki Ota took.",
  alternates: {
    canonical: "https://tomokiota.com/en/calendar",
  },
};

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // 'YYYY-MM-DD' 形式で返す
}

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
  });
  const itineraries = await getFilteredItineraries({
    dateOrder: "desc",
  });
  const postEvents: CalendarEvent[] = posts.map((post) => ({
    title: post.frontmatter.title,
    start: formattedDateWithHyphen(post.frontmatter.date),
    url: `/en/gallery/${post.slug}`,
  }));

  const itineraryEvents: CalendarEvent[] = itineraries.map(
    (itinerary: { en_title: string; date: string; period: number }) => ({
      title: itinerary.en_title,
      start: formattedDateWithHyphen(itinerary.date),
      end: formattedDateWithHyphen(
        addDays(itinerary.date, itinerary.period ? itinerary.period : 0),
      ),
      className: "itinerary-event",
    }),
  );

  const events = [...postEvents, ...itineraryEvents];

  return <Calendar locale="en" events={events} />;
}
