import { hideBin } from "yargs/helpers";
import yargs, { Argv } from "yargs";
import createTranslateCmd from "./translate";
import _ from "lodash";

function createBase(yargs: Argv) {
  return yargs(hideBin(process.argv))
    .scriptName("rdi18n")
    .usage("This is readme translater 🎉\n\nUsage: $0 <commond> [options]")
    .strictCommands(true)
    .example("$0 translate ./README.md -t en_US ja_JP -k xxxxxxx", "")
    .demandCommand(1, "Please specify a command.")
    .help("help")
    .alias("help", "h")
    .version("version", "1.0.0")
    .alias("version", "v");
}

export function initCli() {
  _.flow(createBase, createTranslateCmd, (yargs: Argv) => yargs.parse())(yargs);
}
