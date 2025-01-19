import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";
import prompts from "prompts";

const execAsync = promisify(exec);

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
const category = result.category || "blog";
const date = new Date();
const tags = result.tags.split(",").map((tag) => tag.trim());
const ogpImage = result.ogpImage;

const filePath = `./src/_posts/ja/${filename}.mdx`;

try {
  await fs.writeFile(filePath, "", "utf8");

  const frontMatter = `---
title: ${title}
${country ? `country: ${country}` : ""}
category: ${category}
date: ${date.toISOString()}
description: ${description}
tags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
${ogpImage ? `ogpImage: ${ogpImage}` : ""}
---
`;

  await fs.writeFile(filePath, frontMatter, "utf8");

  console.log(`_posts/ja/${filename}.mdx is created.`);
} catch (err) {
  console.error("Error:", err);
}
