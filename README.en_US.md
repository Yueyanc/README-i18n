# RDI18N

🎉 Translate README into various languages using chatgpt

## Installation
```shell
npm install -g rdi18n
yarn global add rdi18n
pnpm install -g rdi18n
```
## Usage Examples

#### Command Line
```shell
rdi18n translate ./README.md -t en_US ja_JP -k sd-xxxxxxxxxxxxxxxxxx
```
#### Configuration File
Or use a configuration file `rdi18n.config.js`
```javascript
import { defineConfig } from "rdi18n";

export default defineConfig({
  template: "./README.md",
  targetLanguage: ["en_US"],
});
```

## Configuration
```javascript
interface StandardConfig {
  root: string; // root directory default: './'
  source: string; // path of the document to be translated default: './README.md'
  output: string; // output path default: './'
  targetLanguage: LanguageCode[]; // target languages default: ['en_US']
  key: string;  // openAI KEY
  proxy?: { host: string; port: number }; // local proxy
  model: Model; // GPT model to use default: 'gpt-3.5-turbo'
  prompt?: ( // custom prompt
    content: string, // content of the source file
    options: {
      language: LanguageCode;
      translator: OpenAI;
      config: StandardConfig;
    }
  ) => string;
}
```