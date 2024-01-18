import yargs from 'yargs/yargs';
import fs from 'fs';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import { initCli } from './cli';
import { Config, LanguageCode, standardizingConfig } from './config';
import { translate } from './translate';

const defaultConfig: Config = {
  root: process.cwd(),
  template: '',
  output: process.cwd(),
  targetLanguage: ['en_US'],
};
async function main() {
  initCli();
  const argv = yargs(hideBin(process.argv)).parse();
  const rootPath = process.cwd();
  const configName = 'rdi18n.config.js';
  const configPath = path.join(rootPath, configName);
  if (fs.existsSync(configPath)) {
    const userConfig = require(configPath);
    const config = { ...defaultConfig, ...userConfig };
    const standardConfig = standardizingConfig(config);
    await translate(standardConfig);
  }
}

main();
