import type { Metadata } from "next";
import Calendar from "@/components/ui/calendar";
import { formattedDateWithHyphenInTimezone } from "@/lib/date";
import { getFilteredPosts } from "@/lib/galleryFilter";
import { getFilteredItineraries } from "@/lib/itineraryFilter";
import type { CalendarEvent } from "@/types/calendarEvent";

const DEFAULT_TIMEZONE = "Asia/Tokyo";

export const metadata: Metadata = {
  title: "Calendar in tomokiota.com",
  description: "This is a schedule calendar of photos Tomoki Ota took.",
  alternates: {
    canonical: "https://tomokiota.com/en/calendar",
    languages: {
      en: "https://tomokiota.com/en/calendar",
      ja: "https://tomokiota.com/ja/calendar",
    },
  },
};

function addDays(dateString: string, days: number, timeZone: string): string {
  const localDate = formattedDateWithHyphenInTimezone(dateString, timeZone);

  if (!localDate) {
    return "";
  }

  const [year, month, day] = localDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().split("T")[0];
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
    start: formattedDateWithHyphenInTimezone(
      post.frontmatter.date,
      post.frontmatter.timezone || DEFAULT_TIMEZONE,
    ),
    url: `/en/gallery/${post.slug}`,
  }));

  const itineraryEvents: CalendarEvent[] = itineraries.map(
    (itinerary: {
      en_title: string;
      date: string;
      period: number;
      url?: URL;
    }) => ({
      title: itinerary.en_title,
      start: formattedDateWithHyphenInTimezone(
        itinerary.date,
        DEFAULT_TIMEZONE,
      ),
      end: addDays(
        itinerary.date,
        itinerary.period ? itinerary.period : 0,
        DEFAULT_TIMEZONE,
      ),
      className: "itinerary-event",
      ...(itinerary.url && { url: itinerary.url }),
    }),
  );

  const events = [...postEvents, ...itineraryEvents];

  return <Calendar locale="en" events={events} />;
}
