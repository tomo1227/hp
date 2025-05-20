import Calendar from "@/components/ui/calendar";
import { formattedDateWithHyphen } from "@/lib/date";
import { getFilteredPosts } from "@/lib/galleryFilter";
import type { CalendarEvent } from "@/types/calendarEvent";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Calendar in tomokiota.com",
  description: "Tomoki Otaが撮影した過去のスケジュールカレンダー。",
  alternates: {
    canonical: "https://tomokiota.com/ja/blogs",
  },
};

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  const events: CalendarEvent[] = posts.map((post) => ({
    title: post.frontmatter.title,
    date: formattedDateWithHyphen(post.frontmatter.date),
    url: `/ja/gallery/${post.slug}`,
  }));

  return <Calendar locale="ja" events={events} />;
}
