import path from 'path';
import fs from 'fs';
import { Config, LanguageCode, StandardConfig } from './config';
import tunnel from 'tunnel';
import OpenAI from 'openai';

export async function translate(config: StandardConfig) {
  const templateContent = fs.readFileSync(
    path.join(config.root, config.template),
    'utf8'
  );
  const openai = new OpenAI({
    apiKey: '',
    httpAgent: config.proxy && createAgent(config.proxy),
  });
  config.targetLanguage.forEach(async (lang) => {
    const result = await translateToLang(templateContent, {
      language: lang,
      translator: openai,
    });
    if (result) {
      writeReadme(
        path.join(
          path.isAbsolute(config.output)
            ? config.output
            : path.join(config.root, config.output),
          `/README.${lang}.md`
        ),
        result
      );
    }
  });
}

function writeReadme(path: string, content: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        console.error('写入文件时发生错误:', err);
        reject(err);
      }
      resolve(true);
      console.log('文件写入成功。');
    });
  });
}

function createAgent(proxy: Config['proxy']) {
  const agent = tunnel.httpsOverHttp({
    proxy,
  });
  return agent;
}

async function translateToLang(
  content: string,
  options: { language: LanguageCode; translator: OpenAI }
) {
  const response = await options.translator.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `将下面的markdown文档翻译成${options.language}语言代码对应的语言:${content}`,
      },
    ],
  });
  return response?.choices?.[0]?.message?.content;
}
