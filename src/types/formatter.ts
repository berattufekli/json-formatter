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
