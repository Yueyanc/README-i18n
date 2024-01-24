import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import path, { join } from 'path';
import fs3 from 'fs';
import _ from 'lodash';
import { pathToFileURL } from 'url';
import tunnel from 'tunnel';
import OpenAI from 'openai';
import Listr from 'listr';

// src/cli/index.ts
function resolveURL(filePath) {
  let fileURL;
  if (path.isAbsolute(filePath)) {
    fileURL = pathToFileURL(path.resolve(filePath)).href;
  } else {
    const scriptURL = pathToFileURL(__filename).href;
    const scriptPath = new URL(scriptURL).pathname;
    const resolvedPath = path.resolve(path.dirname(scriptPath), filePath);
    fileURL = pathToFileURL(resolvedPath).href;
  }
  return fileURL;
}
function searchFileWithExtensions(filePath, extensions) {
  const resolvedPath = path.resolve(filePath);
  for (const extension of extensions) {
    const fileWithExtension = resolvedPath + extension;
    if (fs3.existsSync(fileWithExtension)) {
      return fileWithExtension;
    }
  }
}

// src/config.ts
var defaultConfig = {
  root: process.cwd(),
  source: "./README.md",
  key: "",
  model: "gpt-3.5-turbo",
  output: process.cwd(),
  targetLanguage: ["en_US"]
};
function mergeConfig(...configs) {
  return _.merge({}, ...configs);
}
function getConfigFromArgv(argv) {
  const { path: path3, targetLanguage, root: argvRoot, port, host, key, model } = argv;
  const root = argvRoot;
  const argvConfig = {
    root,
    key,
    source: path3,
    targetLanguage,
    model
  };
  if (port && host) {
    argvConfig.proxy = { host, port };
  }
  return argvConfig;
}
async function getConfigFromConfigFile(path3) {
  const configPath = searchFileWithExtensions(path3, [".js", ".mjs", "cjs"]);
  if (configPath && fs3.existsSync(configPath)) {
    const { default: config } = await import(resolveURL(configPath));
    return config;
  }
  return {};
}
function checkConfig(config) {
  if (!config.key)
    throw new Error("Please provide the openAI key");
}
async function translate(config) {
  const templateContent = fs3.readFileSync(
    path.join(config.root, config.source),
    "utf8"
  );
  const openai = new OpenAI({
    apiKey: config.key,
    httpAgent: config.proxy && createAgent(config.proxy)
  });
  const tasks = new Listr(
    config.targetLanguage.map((lang) => ({
      title: `Translating ${lang}`,
      task: async () => {
        const result = await translateToLang(templateContent, {
          language: lang,
          translator: openai,
          config
        });
        if (result) {
          return writeReadme(
            path.join(
              path.isAbsolute(config.output) ? config.output : path.join(config.root, config.output),
              `/README.${lang}.md`
            ),
            result
          );
        }
        return Promise.reject(false);
      }
    })),
    { concurrent: true }
  );
  tasks.run();
}
function writeReadme(path3, content) {
  return new Promise((resolve, reject) => {
    fs3.writeFile(path3, content, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}
function createAgent(proxy) {
  const agent = tunnel.httpsOverHttp({
    proxy
  });
  return agent;
}
async function translateToLang(content, options) {
  const response = await options.translator.chat.completions.create({
    model: options.config.model,
    messages: [
      {
        role: "user",
        content: options.config.prompt ? options.config.prompt(content, options) : `\u5C06\u4E0B\u9762\u7684markdown\u6587\u6863\u7FFB\u8BD1\u6210${options.language}\u5BF9\u5E94\u7684\u8BED\u8A00:${content}`
      }
    ]
  });
  const result = _.get(response, ["choices", 0, "message", "content"]);
  if (result)
    return Promise.resolve(result);
  return Promise.reject(result);
}
function createTranslateCmd(yargs2) {
  return yargs2.command(
    "translate",
    "",
    (yargs3) => {
      yargs3.option("source", {
        describe: "The path to the translated file",
        type: "string"
      });
      yargs3.option("targetLanguage", {
        alias: "t",
        describe: "Target language(s) for translation",
        type: "array"
      });
      yargs3.option("key", {
        alias: "k",
        describe: "openAI key",
        type: "string"
      });
      yargs3.option("host", {
        describe: "The proxy host address",
        type: "string"
      });
      yargs3.option("port", {
        alias: "p",
        describe: "The proxy port address",
        type: "string"
      });
      yargs3.option("model", {
        alias: "m",
        describe: "The model name like 'gpt-3.5-turbo-16k' or  'gpt-4'",
        type: "string"
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
  ).alias("t", "translate");
}
function createBase(yargs2) {
  return yargs2(hideBin(process.argv)).scriptName("rdi18n").usage("This is readme translater \u{1F389}\n\nUsage: $0 <commond> [options]").strictCommands(true).example("$0 translate ./README.md -t en_US ja_JP -k xxxxxxx", "").demandCommand(1, "Please specify a command.").help("help").alias("help", "h").version("version", "1.0.0").alias("version", "v");
}
function initCli() {
  _.flow(createBase, createTranslateCmd, (yargs2) => yargs2.parse())(yargs);
}

// src/index.ts
function main() {
  initCli();
}
function defineConfig(params) {
  return params;
}

export { defineConfig, main };
