import fs from "fs";
import _ from "lodash";
import { join } from "path";
import { Model } from "./cli/translate";
import OpenAI from "openai";
import { resolveURL, searchFileWithExtensions } from "./utils";
export type LanguageCode = "zh_CN" | "ja_JP" | "en_US" | "fr_FR" | "ko_KR";

export interface StandardConfig {
  root: string;
  source: string;
  output: string;
  targetLanguage: LanguageCode[];
  key: string;
  proxy?: { host: string; port: number };
  model: Model;
  prompt?: (
    content: string,
    options: {
      language: LanguageCode;
      translator: OpenAI;
      config: StandardConfig;
    }
  ) => string;
}

export const defaultConfig: Partial<StandardConfig> = {
  root: process.cwd(),
  source: "./README.md",
  key: "",
  model: "gpt-3.5-turbo",
  output: process.cwd(),
  targetLanguage: ["en_US"],
};

export function mergeConfig(...configs: Partial<StandardConfig>[]) {
  return _.merge({}, ...configs);
}

export function getConfigFromArgv(argv: any): Partial<StandardConfig> {
  const { path, targetLanguage, root: argvRoot, port, host, key, model } = argv;
  const root = argvRoot;
  const argvConfig: Partial<StandardConfig> = {
    root,
    key,
    source: path,
    targetLanguage,
    model,
  };
  if (port && host) {
    argvConfig.proxy = { host, port };
  }
  return argvConfig;
}

export async function getConfigFromConfigFile(
  path: string
): Promise<Partial<StandardConfig>> {
  const configPath = searchFileWithExtensions(path, [".js", ".mjs", "cjs"]);
  if (configPath && fs.existsSync(configPath)) {
    const { default: config } = await import(resolveURL(configPath));
    return config;
  }
  return {};
}
export function checkConfig(config: Partial<StandardConfig>) {
  if (!config.key) throw new Error("Please provide the openAI key");
}
