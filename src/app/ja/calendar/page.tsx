import type { Metadata } from "next";
import Calendar from "@/components/ui/calendar";
import { formattedDateWithHyphen } from "@/lib/date";
import { getFilteredPosts } from "@/lib/galleryFilter";
import { getFilteredItineraries } from "@/lib/itineraryFilter";
import type { CalendarEvent } from "@/types/calendarEvent";

const metadata: Metadata = {
  title: "Calendar in tomokiota.com",
  description: "Tomoki Otaが撮影した過去のスケジュールカレンダー。",
  alternates: {
    canonical: "https://tomokiota.com/ja/blogs",
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
    locale: "ja",
  });
  const itineraries = await getFilteredItineraries({
    dateOrder: "desc",
    locale: "ja",
  });
  const postEvents: CalendarEvent[] = posts.map((post) => ({
    title: post.frontmatter.title,
    start: formattedDateWithHyphen(post.frontmatter.date),
    url: `/ja/gallery/${post.slug}`,
  }));

  const itineraryEvents: CalendarEvent[] = itineraries.map(
    (itinerary: {
      title: string;
      date: string;
      period: number;
      url?: URL;
    }) => ({
      title: itinerary.title,
      start: formattedDateWithHyphen(itinerary.date),
      end: formattedDateWithHyphen(
        addDays(itinerary.date, itinerary.period ? itinerary.period : 0),
      ),
      className: "itinerary-event",
      url: itinerary.url,
    }),
  );

  const events = [...postEvents, ...itineraryEvents];

  return <Calendar locale="ja" events={events} />;
}
