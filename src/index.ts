import { initCli } from "./cli/index";
import { StandardConfig } from "./config";

export { StandardConfig } from "./config";
export function main() {
  initCli();
}
export function defineConfig(params: StandardConfig) {
  return params;
}
