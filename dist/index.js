"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));

// src/cli/index.ts
var import_helpers = require("yargs/helpers");
var import_yargs = __toESM(require("yargs"));

// src/cli/translate.ts
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));

// src/config.ts
var import_lodash = __toESM(require("lodash"));
function standardizingConfig(config) {
  return import_lodash.default.chain(config).set(
    "targetLanguage",
    Array.isArray(config.targetLanguage) ? config.targetLanguage : [config.targetLanguage]
  ).value();
}
var defaultConfig = {
  root: process.cwd(),
  templatePath: "",
  output: process.cwd(),
  targetLanguage: ["en_US"]
};
function mergeConfigFromArgv(argv) {
  const { path: path3, targetLanguage, root: argvRoot, port, host } = argv;
  const root = argvRoot || defaultConfig.root;
  const argvConfig = {
    root,
    templatePath: path3,
    targetLanguage
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
var import_tunnel = __toESM(require("tunnel"));
var import_openai = __toESM(require("openai"));
async function translate(config) {
  const templateContent = import_fs.default.readFileSync(
    import_path.default.join(config.root, config.templatePath),
    "utf8"
  );
  console.log(config.proxy);
  const openai = new import_openai.default({
    apiKey: "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",
    httpAgent: config.proxy && createAgent(config.proxy)
  });
  config.targetLanguage.forEach(async (lang) => {
    const result = await translateToLang(templateContent, {
      language: lang,
      translator: openai
    });
    if (result) {
      writeReadme(
        import_path.default.join(
          import_path.default.isAbsolute(config.output) ? config.output : import_path.default.join(config.root, config.output),
          `/README.${lang}.md`
        ),
        result
      );
    }
  });
}
function writeReadme(path3, content) {
  return new Promise((resolve, reject) => {
    import_fs.default.writeFile(path3, content, (err) => {
      if (err) {
        console.error("\u5199\u5165\u6587\u4EF6\u65F6\u53D1\u751F\u9519\u8BEF:", err);
        reject(err);
      }
      resolve(true);
      console.log("\u6587\u4EF6\u5199\u5165\u6210\u529F\u3002");
    });
  });
}
function createAgent(proxy) {
  const agent = import_tunnel.default.httpsOverHttp({
    proxy
  });
  return agent;
}
async function translateToLang(content, options) {
  var _a, _b, _c;
  const response = await options.translator.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `\u5C06\u4E0B\u9762\u7684markdown\u6587\u6863\u7FFB\u8BD1\u6210${options.language}\u5BF9\u5E94\u7684\u8BED\u8A00:${content}`
      }
    ]
  });
  return (_c = (_b = (_a = response == null ? void 0 : response.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content;
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
        type: "array"
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
    },
    (argv) => {
      console.log(argv);
      const config = mergeConfigFromArgv(argv);
      const standardConfig = standardizingConfig(config);
      console.log(config, standardConfig);
      translate(standardConfig);
    }
  ).alias("t", "translate");
}

// src/cli/index.ts
var import_lodash2 = __toESM(require("lodash"));
function createBase(yargs2) {
  return yargs2((0, import_helpers.hideBin)(process.argv)).scriptName("rdi18n").usage("This is readme translater \u{1F389}\n\nUsage: $0 <commond> [options]").strictCommands(true).example(
    "$0 translate ./README.md -t en_US ja_JP",
    "Translate ./README.md to English and Japanese"
  ).demandCommand(1, "Please specify a command.").help("help").alias("help", "h").version("version", "1.0.1").alias("version", "v");
}
function initCli() {
  import_lodash2.default.flow(createBase, createTranslateCmd, (yargs2) => yargs2.parse())(import_yargs.default);
}

// src/index.ts
async function main() {
  initCli();
  const rootPath = process.cwd();
  const configName = "rdi18n.config.js";
  const configPath = import_path2.default.join(rootPath, configName);
  let userConfig = {};
  if (import_fs2.default.existsSync(configPath)) {
    userConfig = require(configPath);
  }
}
main();
//# sourceMappingURL=index.js.map