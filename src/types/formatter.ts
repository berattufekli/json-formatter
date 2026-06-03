export interface JsonFormatterSettings {
  indentSize: number;
  sortKeys: boolean;
  validateJson: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'system';
  fontFamily: 'inter' | 'plus-jakarta-sans' | 'fira-code' | 'jetbrains-mono';
  fontSize: number;
}

export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

export type JsonAction = 'format' | 'minify' | 'validate' | 'copy' | 'clear';

export interface CssFormatterSettings {
  indentSize: number;
  sortProperties: boolean;
  validateCss: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'system';
  fontFamily: 'inter' | 'plus-jakarta-sans' | 'fira-code' | 'jetbrains-mono';
  fontSize: number;
}

export interface HtmlFormatterSettings {
  indentSize: number;
  validateHtml: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'system';
  fontFamily: 'inter' | 'plus-jakarta-sans' | 'fira-code' | 'jetbrains-mono';
  fontSize: number;
}

export interface SqlFormatterSettings {
  indentSize: number;
  uppercaseKeywords: boolean;
  validateSql: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'system';
  fontFamily: 'inter' | 'plus-jakarta-sans' | 'fira-code' | 'jetbrains-mono';
  fontSize: number;
}

export interface YamlFormatterSettings {
  indentSize: number;
  validateYaml: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'system';
  fontFamily: 'inter' | 'plus-jakarta-sans' | 'fira-code' | 'jetbrains-mono';
  fontSize: number;
}
