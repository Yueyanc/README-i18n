import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

export function initCli() {
  yargs(hideBin(process.argv))
    .scriptName('rdi18n')
    .usage('This is readme translater 🎉\n\nUsage: $0 [options]')
    .command('translate', 'Translate readme according to configuration')
    .alias('translate', 't')
    .example('$0 count -f foo.js', 'count the lines in the given file')
    .help('help')
    .alias('help', 'h')
    .version('version', '1.0.1')
    .alias('version', 'V')
    .parse();
}
