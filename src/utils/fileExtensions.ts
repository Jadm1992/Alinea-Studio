export function getExtension(lang: string): string {
  const table: Record<string, string> = {
    'typescript': 'ts',
    'javascript': 'js',
    'typescriptreact': 'tsx',
    'javascriptreact': 'jsx',
    'python': 'py',
    'bash': 'sh',
    'rust': 'rs',
    'go': 'go',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'yaml': 'yml',
  };
  return table[lang.toLowerCase()] || 'txt';
}
