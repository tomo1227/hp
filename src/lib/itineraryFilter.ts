import fs from "node:fs";
import path, { join } from "node:path";
import type { ItineraryFrontmatter } from "@/types/itinerary";
import type Locale from "@/types/locale";
import matter from "gray-matter";

const itineraryDir = (locale: Locale = "ja") => {
  return join(process.cwd(), "src/_itineraries/", locale);
};

type dateOrder = "desc" | "asc";

type ItineraryFilterOption = {
  dateOrder?: dateOrder;
  locale?: Locale;
  period?: number;
};

export const getFilteredItineraries = async ({
  dateOrder = "desc",
  locale = "ja",
  period,
}: ItineraryFilterOption = {}) => {
  const pathList = fs.readdirSync(itineraryDir(locale));
  const contentsPromise = pathList.map(async (p) => {
    const fullPath = path.join(itineraryDir(locale), p);
    const filePath = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(filePath);
    const slug = p.split(/\.mdx/)[0];

    return {
      frontmatter: data as ItineraryFrontmatter,
      slug,
      content,
    };
  });
  const contents = await Promise.all(contentsPromise);

  const sortedContents = contents.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date);
    const dateB = new Date(b.frontmatter.date);

    return dateOrder === "asc"
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  return sortedContents;
};
