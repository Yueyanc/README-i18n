var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import fs2 from "fs";
import path2 from "path";

// src/cli/index.ts
import { hideBin } from "yargs/helpers";
import yargs from "yargs";

// src/cli/translate.ts
import path from "path";
import fs from "fs";

// src/config.ts
import _ from "lodash";
function standardizingConfig(config) {
  return _.chain(config).set(
    "targetLanguage",
    Array.isArray(config.targetLanguage) ? config.targetLanguage : [config.targetLanguage]
  ).value();
}
var defaultConfig = {
  root: process.cwd(),
  templatePath: "",
  key: "",
  output: process.cwd(),
  targetLanguage: ["en_US"]
};
function mergeConfigFromArgv(argv) {
  const { path: path3, targetLanguage, root: argvRoot, port, host, key, model } = argv;
  const root = argvRoot || defaultConfig.root;
  const argvConfig = {
    root,
    key,
    templatePath: path3,
    targetLanguage,
    model
  };
  if (port && host) {
    argvConfig.proxy = { host, port };
  }
  return {
    ...defaultConfig,
    ...argvConfig
  };
}

// src/cli/translate.ts
import tunnel from "tunnel";
import OpenAI from "openai";
import _2 from "lodash";
import Listr from "listr";
async function translate(config) {
  const templateContent = fs.readFileSync(
    path.join(config.root, config.templatePath),
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
          model: config.model
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
    fs.writeFile(path3, content, (err) => {
      if (err) {
        console.error("\u5199\u5165\u6587\u4EF6\u65F6\u53D1\u751F\u9519\u8BEF:", err);
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
    model: options.model,
    messages: [
      {
        role: "user",
        content: `\u5C06\u4E0B\u9762\u7684markdown\u6587\u6863\u7FFB\u8BD1\u6210${options.language}\u5BF9\u5E94\u7684\u8BED\u8A00:${content}`
      }
    ]
  });
  const result = _2.get(response, ["choices", 0, "message", "content"]);
  if (result)
    return Promise.resolve(result);
  return Promise.reject(result);
}
function createTranslateCmd(yargs2) {
  return yargs2.command(
    "translate <path> [options]",
    '"Translate readme according to configuration"',
    (yargs3) => {
      yargs3.positional("path", {
        describe: "Path to the file",
        type: "string"
      });
      yargs3.option("targetLanguage", {
        alias: "t",
        describe: "Target language(s) for translation",
        demandOption: true,
        type: "array",
        default: ["en_US"]
      });
      yargs3.option("key", {
        alias: "k",
        describe: "openAI key",
        demandOption: true,
        type: "string"
      });
      yargs3.option("host", {
        describe: "",
        type: "string"
      });
      yargs3.option("port", {
        alias: "p",
        describe: "",
        type: "string"
      });
      yargs3.option("port", {
        alias: "p",
        describe: "",
        type: "string"
      });
      yargs3.option("model", {
        alias: "m",
        describe: "",
        type: "string",
        default: "gpt-3.5-turbo"
      });
    },
    (argv) => {
      const config = mergeConfigFromArgv(argv);
      const standardConfig = standardizingConfig(config);
      translate(standardConfig);
    }
  ).alias("t", "translate");
}

// src/cli/index.ts
import _3 from "lodash";
function createBase(yargs2) {
  return yargs2(hideBin(process.argv)).scriptName("rdi18n").usage("This is readme translater \u{1F389}\n\nUsage: $0 <commond> [options]").strictCommands(true).example(
    "$0 translate ./README.md -t en_US ja_JP",
    "Translate ./README.md to English and Japanese"
  ).demandCommand(1, "Please specify a command.").help("help").alias("help", "h").version("version", "1.0.1").alias("version", "v");
}
function initCli() {
  _3.flow(createBase, createTranslateCmd, (yargs2) => yargs2.parse())(yargs);
}

// src/index.ts
async function main() {
  initCli();
  const rootPath = process.cwd();
  const configName = "rdi18n.config.js";
  const configPath = path2.join(rootPath, configName);
  let userConfig = {};
  if (fs2.existsSync(configPath)) {
    userConfig = __require(configPath);
  }
}
main();
//# sourceMappingURL=index.js.map