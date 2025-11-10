"use client";

import jaLocale from "@fullcalendar/core/locales/ja";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import type { JSX } from "react";
import type { CalendarEvent } from "@/types/calendarEvent";

type CalendarProps = {
  locale: "ja" | "en";
  events: CalendarEvent[];
};

export default function Calendar({
  locale,
  events,
}: CalendarProps): JSX.Element {
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      locales={locale === "ja" ? [jaLocale] : []}
      locale={locale}
      headerToolbar={{
        start: "prevYear,nextYear",
        center: "title",
        end: "today prev,next",
      }}
      initialView="dayGridMonth"
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={true}
      events={events}
      eventClick={(info) => {
        if (info.event.url) {
          window.open(info.event.url, "_blank");
          info.jsEvent.preventDefault();
        }
      }}
    />
  );
}
