import _ from "lodash";
import { join } from "path";
import { Model } from "./cli/translate";
export type LanguageCode = "zh_CN" | "ja_JP" | "en_US" | "fr_FR" | "ko_KR";
export interface Config {
  root: string;
  templatePath: string;
  output: string;
  targetLanguage: LanguageCode[] | LanguageCode;
  key: string;
  proxy?: { host: string; port: number };
  model: Model;
}
export interface StandardConfig {
  root: string;
  templatePath: string;
  output: string;
  targetLanguage: LanguageCode[];
  key: string;
  proxy?: { host: string; port: number };
  model: Model;
}
export function standardizingConfig(config: Config): StandardConfig {
  return _.chain(config)
    .set(
      "targetLanguage",
      Array.isArray(config.targetLanguage)
        ? config.targetLanguage
        : [config.targetLanguage]
    )
    .value() as StandardConfig;
}
const defaultConfig: Partial<Config> = {
  root: process.cwd(),
  templatePath: "",
  key: "",
  output: process.cwd(),
  targetLanguage: ["en_US"],
};
export function mergeConfigFromArgv(argv: any): StandardConfig {
  const { path, targetLanguage, root: argvRoot, port, host, key, model } = argv;
  const root = argvRoot || defaultConfig.root;
  const argvConfig: Partial<Config> = {
    root,
    key,
    templatePath: path,
    targetLanguage,
    model,
  };
  if (port && host) {
    argvConfig.proxy = { host, port };
  }
  return {
    ...defaultConfig,
    ...argvConfig,
  } as StandardConfig;
}
