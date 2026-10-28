import fs from "node:fs";
import path, { join } from "node:path";
import type Locale from "@/types/locale";
import { getJstTimestamp } from "./date";

const itineraryDir = () => {
  return join(process.cwd(), "src/_itineraries/");
};

type dateOrder = "desc" | "asc";

type ItineraryFilterOption = {
  dateOrder?: dateOrder;
  locale?: Locale;
  period?: number;
  url?: URL;
};

export const getFilteredItineraries = async ({
  dateOrder = "desc",
}: ItineraryFilterOption = {}) => {
  const directory = itineraryDir();
  const jsonData = fs
    .readdirSync(directory)
    .filter((file) => /^\d{4}\.json$/.test(file))
    .sort()
    .flatMap((file) =>
      JSON.parse(fs.readFileSync(path.join(directory, file), "utf-8")),
    );

  const sortedContents = jsonData.sort(
    (a: { date: string }, b: { date: string }) => {
      const dateA = getJstTimestamp(a.date);
      const dateB = getJstTimestamp(b.date);

      return dateOrder === "asc" ? dateA - dateB : dateB - dateA;
    },
  );

  return sortedContents;
};
