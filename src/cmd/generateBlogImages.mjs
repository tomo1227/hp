import { writeFileSync } from "node:fs";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import readline from "node:readline";
import { imageSizeFromFile } from "image-size/fromFile";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function downloadImage(url, filePath) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`画像取得失敗: ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(filePath, buffer);
}

rl.question(
  "S3のディレクトリパスを入力してください(末尾/あり): ",
  async (s3Path) => {
    rl.question("画像の数を入力してください: ", async (imageCount) => {
      let output = "";

      for (let i = 1; i <= Number.parseInt(imageCount, 10); i++) {
        const imageUrl = `https://d9h1q21gc2t6n.cloudfront.net/${s3Path}img${i}.jpg`;

        try {
          // 一時保存
          const tempPath = path.join(tmpdir(), `img${i}.jpg`);

          await downloadImage(imageUrl, tempPath);

          // サイズ取得
          const dimensions = await imageSizeFromFile(tempPath);

          if (!dimensions.width || !dimensions.height) {
            console.warn(`img${i}.jpg のサイズ取得に失敗しました`);
            continue;
          }

          // 縦長判定
          const isVertical = dimensions.height > dimensions.width;

          const width = isVertical ? 500 : 1000;

          // 最初の5枚だけ priority
          const priority = i <= 5 ? " priority={true}" : "";

          const tag = `<BlogImage src="${imageUrl}" width={${width}}${priority} />\n`;

          output += tag;

          // temp削除
          await fs.unlink(tempPath);
        } catch (error) {
          console.error(`img${i}.jpg の処理に失敗`, error);
        }
      }

      writeFileSync("./output.txt", output, "utf8");
      console.log("./output.txt が生成されました！");
      rl.close();
    });
  },
);
