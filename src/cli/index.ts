import { hideBin } from 'yargs/helpers';
import { LanguageCode } from '../config';
import yargs from 'yargs';

// const yargs = require('yargs');
interface CliArgv {
  targetLanguage: LanguageCode | LanguageCode[];
}
export function initCli() {
  yargs(hideBin(process.argv))
    .scriptName('rdi18n')
    .usage('This is readme translater 🎉\n\nUsage: $0 <commond> [options]')
    .command(
      'translate <path>',
      '"Translate readme according to configuration"',
      (yargs) => {
        yargs.positional('path', {
          describe: 'Path to the file',
          type: 'string',
        });
        yargs.option('t', {
          alias: 'targetLanguage',
          describe: 'Target language(s) for translation',
          demandOption: true,
          type: 'array',
        });
      },
      (argv) => {}
    )
    .alias('t', 'translate')
    .example(
      '$0 translate ./README.md -t en_US ja_JP',
      'Translate ./README.md to English and Japanese'
    )
    .demandCommand(1, 'Please specify a command.')
    .help('help')
    .alias('help', 'h')
    .version('version', '1.0.1')
    .alias('version', 'V')
    .parse();
}
