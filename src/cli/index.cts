import yargs from "yargs";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import tunnel from "tunnel";
const agent = tunnel.httpsOverHttp({
  proxy: {
    host: "127.0.0.1",
    port: 10809,
  },
});
const openai = new OpenAI({
  apiKey: "",
  httpAgent: agent,
});
const directory = path.join(__dirname, "../../"); // 当前脚本所在的目录
const readmePath = path.join(directory, "README.md");
function findReadmeFile(directory: string): string | null {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && file.toLowerCase() === "readme.md") {
      return filePath;
    }
  }
  return null;
}

function readReadmeFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}
async function translate(content: string) {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: `将下面的markdown文档翻译成英文:${content}` },
    ],
    stream: true,
  });
  let translated = "";
  for await (const chunk of stream) {
    translated += chunk.choices[0]?.delta?.content;
  }
  fs.writeFile(path.join(directory, "/README_en.md"), translated, (err) => {
    if (err) {
      console.error("写入文件时发生错误:", err);
      return;
    }
    console.log("文件写入成功。");
  });
}

async function initCli() {
  const argv = yargs(process.argv.slice(2)).parse();

  console.log(readmePath);
  if (fs.existsSync(readmePath)) {
    const readmeContent = readReadmeFile(readmePath);
    console.log(readmeContent);
    await translate(readmeContent);
    return;
  }
  console.log("README.md file not found in the directory.");
  return;
}

initCli();
