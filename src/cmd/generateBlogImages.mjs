import { writeFileSync } from "node:fs";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Base URLを入力してください(末尾/あり): ", (baseURL) => {
  rl.question("画像の数を入力してください: ", (imageCount) => {
    let output = "";
    for (let i = 1; i <= Number.parseInt(imageCount, 10); i++) {
      const tag = `<BlogImage src="${baseURL}img${i}.jpg" width={1000} />\n`;
      output += tag;
    }

    writeFileSync("./output.txt", output, "utf8");
    console.log("./output.txt が生成されました！");
    rl.close();
  });
});
