import path, { join } from "path";
import fs from "fs";
import chalk from "chalk";
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
      task: async (ctx, task) => {
        let token = 0;
        const result = await translateToLang(templateContent, {
          language: lang,
          translator: openai,
          config,
          onProcess: (value: string) => {
            token += value.length;
            task.output = `Translating ${lang}: Consumption ${token} token`;
          },
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

  tasks
    .run()
    .then(() => {
      console.log(chalk.green("√ Finished"));
      process.exit(1);
    })
    .catch((err) => {
      console.log(err);
    });
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
    onProcess?: (value: string) => any;
  }
) {
  let result = "";
  const stream = await options.translator.chat.completions.create({
    model: options.config.model,
    stream: true,
    messages: [
      {
        role: "user",
        content: options.config.prompt
          ? options.config.prompt(content, options)
          : `将下面的markdown文档翻译成${options.language}对应的语言,以下是原文内容:${content}`,
      },
    ],
  });
  for await (const chunk of stream) {
    const response = _.get(chunk, ["choices", 0, "delta", "content"]) || "";
    options.onProcess?.(response);
    result += response;
  }
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
