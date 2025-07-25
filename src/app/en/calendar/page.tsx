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
    locale: "en",
  });
  const postEvents: CalendarEvent[] = posts.map((post) => ({
    title: post.frontmatter.title,
    start: formattedDateWithHyphen(post.frontmatter.date),
    url: `/en/gallery/${post.slug}`,
  }));

  const itineraryEvents: CalendarEvent[] = itineraries.map((itinerary) => ({
    title: itinerary.frontmatter.title,
    start: formattedDateWithHyphen(itinerary.frontmatter.date),
    end: formattedDateWithHyphen(
      addDays(
        itinerary.frontmatter.date,
        itinerary.frontmatter.period ? itinerary.frontmatter.period : 0,
      ),
    ),
    className: "itinerary-event",
  }));

  const events = [...postEvents, ...itineraryEvents];

  return <Calendar locale="en" events={events} />;
}
