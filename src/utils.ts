import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";
export function resolveURL(filePath: string) {
  let fileURL;
  if (path.isAbsolute(filePath)) {
    fileURL = pathToFileURL(path.resolve(filePath)).href;
  } else {
    const scriptURL = pathToFileURL(__filename).href;
    const scriptPath = new URL(scriptURL).pathname;
    const resolvedPath = path.resolve(path.dirname(scriptPath), filePath);
    fileURL = pathToFileURL(resolvedPath).href;
  }
  return fileURL;
}
export function searchFileWithExtensions(
  filePath: string,
  extensions: string[]
) {
  const resolvedPath = path.resolve(filePath);
  for (const extension of extensions) {
    const fileWithExtension = resolvedPath + extension;
    if (fs.existsSync(fileWithExtension)) {
      return fileWithExtension;
    }
  }
}
