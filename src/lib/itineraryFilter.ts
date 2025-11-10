import fs from "node:fs";
import path, { join } from "node:path";
import type Locale from "@/types/locale";

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
  const fullPath = path.join(itineraryDir(), "plan.json");
  const jsonData = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  const sortedContents = jsonData.sort(
    (a: { date: string }, b: { date: string }) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    },
  );

  return sortedContents;
};
