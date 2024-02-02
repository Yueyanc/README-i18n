# RDI18N

🎉 READMEをchatgptを使って各言語に翻訳します

## インストール
```shell
npm install global rdi18n
yarn global install rdi18n
pnpm install -g rdi18n
```
## 使用例

#### コマンドライン
```shell
rdi18n translate ./README.md -t en_US ja_JP -k sd-xxxxxxxxxxxxxxxxxx
```
#### 設定ファイル
または設定ファイル`rdi18n.config.js`を使用することもできます
```javascript
import { defineConfig } from "rdi18n";

export default defineConfig({
  template: "./README.md",
  targetLanguage: ["en_US"],
});
```

## 設定
```javascript
interface StandardConfig {
  root: string; // ルートディレクトリ default: './'
  source: string; // 翻訳するドキュメントの位置 default: './README.md'
  output: string; // 出力先パス default: './'
  targetLanguage: LanguageCode[]; // 目標言語 default: ['en_US']
  key: string;  // openAI KEY
  proxy?: { host: string; port: number }; // ローカルプロキシ
  model: Model; // 使用するGPTモデル default: 'gpt-3.5-turbo'
  prompt?: ( // カスタムプロンプト
    content: string, // ソースファイルの内容
    options: {
      language: LanguageCode;
      translator: OpenAI;
      config: StandardConfig;
    }
  ) => string;
}
```