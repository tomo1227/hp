import { writeFileSync } from "node:fs";

const baseURL =
  "https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/2024/yellowknife/";
const imageCount = 94;

let output = "";
for (let i = 1; i <= imageCount; i++) {
  const tag = `<BlogImage src="${baseURL}img${i}.jpg" width={1000} />\n`;
  output += tag;
}

writeFileSync("./output.jsx", output, "utf8");

console.log("ブログ画像タグが生成されました！");
