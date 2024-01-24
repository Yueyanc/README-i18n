import path, { join } from "path";
import fs from "fs";
import {
  LanguageCode,
  StandardConfig,
  checkConfig,
  defaultConfig,
  getConfigFromArgv,
  getConfigFromConfigFile,
  mergeConfig,
} from "../config";
import tunnel from "tunnel";
import OpenAI from "openai";
import { Argv } from "yargs";
import _ from "lodash";
import Listr from "listr";

export type Model =
  | "gpt-4-1106-preview"
  | "gpt-4-vision-preview"
  | "gpt-4"
  | "gpt-4-0314"
  | "gpt-4-0613"
  | "gpt-4-32k"
  | "gpt-4-32k-0314"
  | "gpt-4-32k-0613"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-16k"
  | "gpt-3.5-turbo-0301"
  | "gpt-3.5-turbo-0613"
  | "gpt-3.5-turbo-1106"
  | "gpt-3.5-turbo-16k-0613";
export async function translate(config: StandardConfig) {
  const templateContent = fs.readFileSync(
    path.join(config.root, config.source),
    "utf8"
  );
  const openai = new OpenAI({
    apiKey: config.key,
    httpAgent: config.proxy && createAgent(config.proxy),
  });
  const tasks = new Listr(
    config.targetLanguage.map((lang) => ({
      title: `Translating ${lang}`,
      task: async () => {
        const result = await translateToLang(templateContent, {
          language: lang,
          translator: openai,
          config,
        });
        if (result) {
          return writeReadme(
            path.join(
              path.isAbsolute(config.output)
                ? config.output
                : path.join(config.root, config.output),
              `/README.${lang}.md`
            ),
            result
          );
        }
        return Promise.reject(false);
      },
    })),
    { concurrent: true }
  );

  tasks.run();
}

function writeReadme(path: string, content: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

function createAgent(proxy: StandardConfig["proxy"]) {
  const agent = tunnel.httpsOverHttp({
    proxy,
  });
  return agent;
}

async function translateToLang(
  content: string,
  options: {
    language: LanguageCode;
    translator: OpenAI;
    config: StandardConfig;
  }
) {
  const response = await options.translator.chat.completions.create({
    model: options.config.model,
    messages: [
      {
        role: "user",
        content: options.config.prompt
          ? options.config.prompt(content, options)
          : `将下面的markdown文档翻译成${options.language}对应的语言:${content}`,
      },
    ],
  });
  const result = _.get(response, ["choices", 0, "message", "content"]);
  if (result) return Promise.resolve(result);
  return Promise.reject(result);
}
export default function createTranslateCmd(yargs: Argv) {
  return yargs
    .command(
      "translate",
      "",
      (yargs) => {
        yargs.option("source", {
          describe: "The path to the translated file",
          type: "string",
        });
        yargs.option("targetLanguage", {
          alias: "t",
          describe: "Target language(s) for translation",
          type: "array",
        });
        yargs.option("key", {
          alias: "k",
          describe: "openAI key",
          type: "string",
        });
        yargs.option("host", {
          describe: "The proxy host address",
          type: "string",
        });
        yargs.option("port", {
          alias: "p",
          describe: "The proxy port address",
          type: "string",
        });
        yargs.option("model", {
          alias: "m",
          describe: "The model name like 'gpt-3.5-turbo-16k' or  'gpt-4'",
          type: "string",
        });
      },
      async (argv) => {
        const argvConfig = getConfigFromArgv(argv);
        const fileConfig = await getConfigFromConfigFile(
          join(process.cwd(), "./rdi18n.config")
        );
        const standardConfig = mergeConfig(
          defaultConfig,
          fileConfig,
          argvConfig
        );
        checkConfig(standardConfig);
        translate(standardConfig);
      }
    )
    .alias("t", "translate");
}
