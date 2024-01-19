import yargs from 'yargs/yargs';
import fs from 'fs';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import { initCli } from './cli/index';
import { Config, LanguageCode, standardizingConfig } from './config';
import { translate } from './cli/translate';

const defaultConfig: Config = {
  root: process.cwd(),
  template: '',
  output: process.cwd(),
  targetLanguage: ['en_US'],
};
async function main() {
  initCli();
  const rootPath = process.cwd();
  const configName = 'rdi18n.config.js';
  const configPath = path.join(rootPath, configName);
  let userConfig = {};

  if (fs.existsSync(configPath)) {
    userConfig = require(configPath);
  }

  // const config = { ...defaultConfig, ...userConfig };
  // const standardConfig = standardizingConfig(config);
  // await translate(standardConfig);
}

main();
