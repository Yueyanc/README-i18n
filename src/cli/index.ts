import { hideBin } from "yargs/helpers";
import { LanguageCode } from "../config";
import yargs, { Argv } from "yargs";
import createTranslateCmd from "./translate";
import _ from "lodash";

type CliArgv = {
  translate?: LanguageCode | LanguageCode[];
  path?: string;
};

function createBase(yargs: Argv) {
  return yargs(hideBin(process.argv))
    .scriptName("rdi18n")
    .usage("This is readme translater 🎉\n\nUsage: $0 <commond> [options]")
    .strictCommands(true)
    .example(
      "$0 translate ./README.md -t en_US ja_JP",
      "Translate ./README.md to English and Japanese"
    )
    .demandCommand(1, "Please specify a command.")
    .help("help")
    .alias("help", "h")
    .version("version", "1.0.1")
    .alias("version", "v");
}

export function initCli() {
  _.flow(createBase, createTranslateCmd, (yargs: Argv) => yargs.parse())(yargs);
}
