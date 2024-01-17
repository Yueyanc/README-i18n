import yargs from "yargs";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import tunnel from "tunnel";

type LanguageCode = "zh_CN" | "ja_JP" | "en_US" | "fr_FR" | "ko_KR";
const targetLanguage: LanguageCode[] = ["en_US", "ja_JP", "ko_KR"];

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

const configFilePath = path.join(__dirname, "../../"); // 当前脚本所在的目录
const readmePath = path.join(configFilePath, "README.md");

async function translate(content: string, options: { language: LanguageCode }) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `将下面的markdown文档翻译成${options.language}语言代码对应的语言:${content}`,
      },
    ],
  });
  return response?.choices?.[0]?.message?.content;
}

function writeReadme(path: string, content: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        console.error("写入文件时发生错误:", err);
        reject(err);
      }
      resolve(true);
      console.log("文件写入成功。");
    });
  });
}

interface Config {
  root: string;
  output: string;
  targetLanguage: LanguageCode[] | LanguageCode;
  proxy?: { host: string; port: number };
}
const defaultConfig: Config = {
  root: configFilePath,
  output: configFilePath,
  targetLanguage: ["en_US"],
};

async function processFn(config: Config) {
  const readmePath = config.root;
  const targetLanguage = Array.isArray(config.targetLanguage)
    ? config.targetLanguage
    : [config.targetLanguage];
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, "utf8");
    targetLanguage.forEach(async (lang) => {
      const response = await translate(readmeContent, { language: lang });
      if (!response) return;
      await writeReadme(
        path.join(readmePath, config.output, `/README.${lang}.md`),
        response
      );
    });
    return;
  }
  return;
}

async function initCli() {
  const argv = yargs(process.argv.slice(2)).parse();
  let userConfig = {};
  const finalConfig = { ...defaultConfig, ...userConfig };
  processFn(finalConfig);
}

initCli();
