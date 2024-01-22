import path from "path";
import fs from "fs";
import {
  Config,
  LanguageCode,
  StandardConfig,
  mergeConfigFromArgv,
  standardizingConfig,
} from "../config";
import tunnel from "tunnel";
import OpenAI from "openai";
import { Argv } from "yargs";

export async function translate(config: StandardConfig) {
  const templateContent = fs.readFileSync(
    path.join(config.root, config.templatePath),
    "utf8"
  );
  const openai = new OpenAI({
    apiKey: config.key,
    httpAgent: config.proxy && createAgent(config.proxy),
  });
  config.targetLanguage.forEach(async (lang) => {
    const result = await translateToLang(templateContent, {
      language: lang,
      translator: openai,
    });
    if (result) {
      writeReadme(
        path.join(
          path.isAbsolute(config.output)
            ? config.output
            : path.join(config.root, config.output),
          `/README.${lang}.md`
        ),
        result
      );
    }
  });
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

function createAgent(proxy: Config["proxy"]) {
  const agent = tunnel.httpsOverHttp({
    proxy,
  });
  return agent;
}

async function translateToLang(
  content: string,
  options: { language: LanguageCode; translator: OpenAI }
) {
  const response = await options.translator.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `将下面的markdown文档翻译成${options.language}对应的语言:${content}`,
      },
    ],
  });
  return response?.choices?.[0]?.message?.content;
}
export default function createTranslateCmd(yargs: Argv) {
  return yargs
    .command(
      "translate <path> [options]",
      '"Translate readme according to configuration"',
      (yargs) => {
        yargs.positional("path", {
          describe: "Path to the file",
          type: "string",
        });
        yargs.option("targetLanguage", {
          alias: "t",
          describe: "Target language(s) for translation",
          demandOption: true,
          type: "array",
        });
        yargs.option("key", {
          alias: "k",
          describe: "openAI key",
          demandOption: true,
          type: "string",
        });
        yargs.option("host", {
          describe: "",
          type: "string",
        });
        yargs.option("port", {
          alias: "p",
          describe: "",
          type: "string",
        });
      },
      (argv) => {
        const config = mergeConfigFromArgv(argv);
        const standardConfig = standardizingConfig(config);

        translate(standardConfig);
      }
    )
    .alias("t", "translate");
}
