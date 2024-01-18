import _ from 'lodash';
export type LanguageCode = 'zh_CN' | 'ja_JP' | 'en_US' | 'fr_FR' | 'ko_KR';
export interface Config {
  root: string;
  template: string;
  output: string;
  targetLanguage: LanguageCode[] | LanguageCode;
  proxy?: { host: string; port: number };
}
export interface StandardConfig {
  root: string;
  template: string;
  output: string;
  targetLanguage: LanguageCode[];
  proxy?: { host: string; port: number };
}
export function standardizingConfig(config: Config): StandardConfig {
  return _.chain(config)
    .set(
      'targetLanguage',
      Array.isArray(config.targetLanguage)
        ? config.targetLanguage
        : [config.targetLanguage]
    )
    .value() as StandardConfig;
}
