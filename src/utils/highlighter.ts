import Prism from 'prismjs';

// Import essential language grammars
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';

/**
 * Highlighting utility using PrismJS. Normalizes language aliases and wraps outputs.
 */
export function highlightCode(code: string, language: string): string {
  let lang = language.toLowerCase().trim();

  // Handle common code block name aliases
  if (lang === 'js') lang = 'javascript';
  if (lang === 'ts') lang = 'typescript';
  if (lang === 'py') lang = 'python';
  if (lang === 'sh' || lang === 'shell') lang = 'bash';
  if (lang === 'html') lang = 'markup';
  if (lang === 'yml') lang = 'yaml';

  try {
    const grammar = Prism.languages[lang];
    if (grammar) {
      return Prism.highlight(code, grammar, lang);
    }
  } catch (err) {
    console.warn(`PrismJS failed to load grammar for language: ${lang}`, err);
  }

  // Fallback language grammar
  try {
    const fallbackGrammar = Prism.languages.javascript;
    if (fallbackGrammar) {
      return Prism.highlight(code, fallbackGrammar, 'javascript');
    }
  } catch (err) {
    // Silent catch
  }

  // Plain HTML escape fallback
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
