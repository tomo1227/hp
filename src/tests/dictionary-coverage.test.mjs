import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";

const SRC_DIR = path.join(process.cwd(), "src");
const GALLERIES_DIR = path.join(SRC_DIR, "_galleries");

const TAG_DICTIONARY = readJson(path.join(SRC_DIR, "en.json"));
const COUNTRY_DICTIONARY = readJson(path.join(SRC_DIR, "country.json"));
const REGION_DICTIONARY = readJson(path.join(SRC_DIR, "region.json"));
const CITY_DICTIONARY = readJson(path.join(SRC_DIR, "city.json"));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getAllMdxFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return getAllMdxFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      return [fullPath];
    }
    return [];
  });
}

function collectFrontmatterValues() {
  const mdxFiles = getAllMdxFiles(GALLERIES_DIR);

  const tags = new Set();
  const countries = new Set();
  const regions = new Set();
  const cities = new Set();

  for (const filePath of mdxFiles) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);

    if (Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        const normalized = normalize(tag);
        if (normalized.length > 0) {
          tags.add(normalized);
        }
      }
    }

    const country = normalize(data.country);
    const region = normalize(data.region);
    const city = normalize(data.city);

    if (country.length > 0) {
      countries.add(country);
    }
    if (region.length > 0) {
      regions.add(region);
    }
    if (city.length > 0) {
      cities.add(city);
    }
  }

  return {
    fileCount: mdxFiles.length,
    tags,
    countries,
    regions,
    cities,
  };
}

function findMissingKeys(values, dictionary) {
  return [...values].filter((value) => dictionary[value] === undefined).sort();
}

function formatMissingMessage(label, missing) {
  return `${label} dictionary is missing ${missing.length} key(s): ${missing.join(", ")}`;
}

const collected = collectFrontmatterValues();

test("galleries are discovered", () => {
  assert.ok(
    collected.fileCount > 0,
    "No gallery .mdx files were found in src/_galleries",
  );
});

test("all tags are in en.json", () => {
  const missing = findMissingKeys(collected.tags, TAG_DICTIONARY);
  assert.equal(missing.length, 0, formatMissingMessage("Tag", missing));
});

test("all countries are in country.json", () => {
  const missing = findMissingKeys(collected.countries, COUNTRY_DICTIONARY);
  assert.equal(missing.length, 0, formatMissingMessage("Country", missing));
});

test("all regions are in region.json", () => {
  const missing = findMissingKeys(collected.regions, REGION_DICTIONARY);
  assert.equal(missing.length, 0, formatMissingMessage("Region", missing));
});

test("all cities are in city.json", () => {
  const missing = findMissingKeys(collected.cities, CITY_DICTIONARY);
  assert.equal(missing.length, 0, formatMissingMessage("City", missing));
});
