import { promises as fs } from "node:fs";
import prompts from "prompts";

const result = await prompts(
  [
    {
      type: "text",
      name: "title",
      message: "記事のタイトルを入力してください:",
      validate: (value) =>
        value.trim() ? true : "タイトルを入力してください。",
    },
    {
      type: "text",
      name: "filename",
      message: "記事のuriを入力してください:",
      validate: (value) => (value.trim() ? true : "uriを入力してください。"),
    },
    {
      type: "text",
      name: "description",
      message: "descriptionを入力してください:",
      validate: (value) =>
        value.trim() ? true : "descriptionを入力してください。",
    },
    {
      type: "text",
      name: "category",
      message: "記事のカテゴリを入力してください:",
    },
    {
      type: "text",
      name: "country",
      message: "国名を入力してください:",
    },
    {
      type: "text",
      name: "region",
      message: "都道府県/州を入力してください:",
    },
    {
      type: "text",
      name: "city",
      message: "都市名を入力してください(任意):",
    },
    {
      type: "text",
      name: "timezone",
      message: "timezoneを入力してください (例: Asia/Tokyo):",
      validate: (value) =>
        value.trim() ? true : "timezoneを入力してください。",
    },
    {
      type: "text",
      name: "tags",
      message: "タグをカンマ区切りで入力してください:",
      validate: (value) =>
        value.trim() ? true : "少なくとも1つのタグを入力してください。",
    },
    {
      type: "text",
      name: "ogpImage",
      message: "ogp imageのurlを入力してください:",
    },
    {
      type: "text",
      name: "galleryImage",
      message: "gallery imageのurlを入力してください:",
    },
    {
      type: "text",
      name: "year",
      message: "年を入力してください:",
      validate: (value) =>
        /^\d{4}$/.test(value.trim()) ? true : "4桁の年を入力してください。",
    },
  ],
  {
    onCancel: () => {
      process.exit(0);
    },
  },
);

const title = result.title;
const filename = result.filename;
const description = result.description;
const country = result.country;
const region = result.region;
const city = result.city;
const timezone = result.timezone;
const category = result.category || "photography";
const date = new Date();
const tags = result.tags.split(",").map((tag) => tag.trim());
const ogpImage = result.ogpImage;
const galleryImage = result.galleryImage || "";
const year = result.year.trim();

const dirPath = `./src/_galleries/ja/(${year})`;
const filePath = `${dirPath}/${filename}.mdx`;

try {
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, "", "utf8");

  const frontMatter = `---
title: ${title}
${country ? `country: ${country}` : ""}
${region ? `region: ${region}` : ""}
${city ? `city: ${city}` : ""}
timezone: ${timezone}
category: ${category}
date: ${date.toISOString()}
description: ${description}
tags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
${ogpImage ? `ogpImage: ${ogpImage}` : ""}
galleryImage: ${galleryImage}
---
`;

  await fs.writeFile(filePath, frontMatter, "utf8");

  console.log(`_galleries/ja/(${year})/${filename}.mdx is created.`);
} catch (err) {
  console.error("Error:", err);
}
