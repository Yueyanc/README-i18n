中文 | [English](./README.en_US.md) | [日語](./README.ja_JP.md)

# RDI18N

🎉 将README通过chatgpt翻译成各国语言

## 安装
```shell
npm install global rdi18n
yarn global install rdi18n
pnpm install -g rdi18n
```
## 使用示例

#### 命令行
```shell
rdi18n translate ./README.md -t en_US ja_JP -k sd-xxxxxxxxxxxxxxxxxx
```
#### 配置文件
或者使用配置文件`rdi18n.config.js`
```javascript
import { defineConfig } from "rdi18n";

export default defineConfig({
  template: "./README.md",
  targetLanguage: ["en_US"],
});
```

## 配置
```javascript
interface StandardConfig {
  root: string; // 根目录 default: './'
  source: string; // 需要翻译的文档位置 default: './README.md'
  output: string; // 输出路径 default: './'
  targetLanguage: LanguageCode[]; //目标语言 default: ['en_US']
  key: string;  // openAI KEY
  proxy?: { host: string; port: number }; // 本地代理
  model: Model; // 使用的GPT模型 default: 'gpt-3.5-turbo'
  prompt?: ( // 自定义提示语
    content: string, // source文件的内容
    options: {
      language: LanguageCode;
      translator: OpenAI;
      config: StandardConfig;
    }
  ) => string;
}
```
