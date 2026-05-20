import { writeFileSync } from "node:fs";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("S3のディレクトリパスを入力してください(末尾/あり): ", (s3Path) => {
  rl.question("画像の数を入力してください: ", (imageCount) => {
    let output = "";

    for (let i = 1; i <= Number.parseInt(imageCount, 10); i++) {
      // 縦長画像判定（例: img2-vertical.jpg のような命名を想定）
      const isVertical = false; // 必要に応じて変更

      const width = isVertical ? 500 : 1000;

      // 最初の5枚だけ priority を付与
      const priority = i <= 5 ? " priority={true}" : "";

      const tag = `<BlogImage src="https://d9h1q21gc2t6n.cloudfront.net/${s3Path}img${i}.jpg" width={${width}}${priority} />\n`;

      output += tag;
    }

    writeFileSync("./output.txt", output, "utf8");
    console.log("./output.txt が生成されました！");
    rl.close();
  });
});
