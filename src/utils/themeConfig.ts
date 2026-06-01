export interface ThemeColor {
  name: string;
  hex: string;
}

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColor[];
  cssVariables: Record<string, string>;
  customCss?: string;
}

export const appThemes: AppTheme[] = [
  {
    id: 'velvet-rose',
    name: 'Velvet Rose',
    description: 'Moody and sophisticated workspace using deep, almost-black berry tones.',
    colors: [
      { name: 'Background', hex: '#0E0A0C' },
      { name: 'Surface', hex: '#171114' },
      { name: 'User Bubble', hex: '#3B222D' },
      { name: 'Accent', hex: '#D98BA4' }
    ],
    cssVariables: {
      '--theme-bg': '#0E0A0C',
      '--theme-accent': '#D98BA4',
      '--theme-secondary': '#D98BA4',
      '--theme-highlight': '#D98BA4',
      '--theme-text-primary': '#F0E6EA',
      '--theme-text-muted': '#85737A',
      '--theme-surface': '#171114',
      '--theme-surface-hover': '#21181D',
      '--theme-border': 'transparent',
      '--theme-bubble-ai': '#171114',
      '--theme-bubble-user': '#3B222D',
      '--theme-code-bg': '#050505',
      '--theme-gradient-start': '#D98BA4',
      '--theme-gradient-end': '#F0E6EA'
    }
  },
  {
    id: 'midnight-lilac',
    name: 'Midnight Lilac',
    description: 'Cool and cyber-feminine leaning into deep purples and glowing lavenders.',
    colors: [
      { name: 'Background', hex: '#0A0910' },
      { name: 'Surface', hex: '#12101C' },
      { name: 'User Bubble', hex: '#2C254A' },
      { name: 'Accent', hex: '#A682FF' }
    ],
    cssVariables: {
      '--theme-bg': '#0A0910',
      '--theme-accent': '#A682FF',
      '--theme-secondary': '#A682FF',
      '--theme-highlight': '#A682FF',
      '--theme-text-primary': '#E8E6F2',
      '--theme-text-muted': '#706B85',
      '--theme-surface': '#12101C',
      '--theme-surface-hover': '#1A1729',
      '--theme-border': 'transparent',
      '--theme-bubble-ai': '#12101C',
      '--theme-bubble-user': '#2C254A',
      '--theme-code-bg': '#050505',
      '--theme-gradient-start': '#A682FF',
      '--theme-gradient-end': '#E8E6F2'
    }
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian & Gold',
    description: 'High-end glamour using an ultra-dark warm brown/black base with champagne.',
    colors: [
      { name: 'Background', hex: '#121111' },
      { name: 'Surface', hex: '#1A1818' },
      { name: 'User Bubble', hex: '#332B29' },
      { name: 'Accent', hex: '#E3B5A4' }
    ],
    cssVariables: {
      '--theme-bg': '#121111',
      '--theme-accent': '#E3B5A4',
      '--theme-secondary': '#E3B5A4',
      '--theme-highlight': '#E3B5A4',
      '--theme-text-primary': '#F2EFE9',
      '--theme-text-muted': '#807A78',
      '--theme-surface': '#1A1818',
      '--theme-surface-hover': '#262222',
      '--theme-border': 'transparent',
      '--theme-bubble-ai': '#1A1818',
      '--theme-bubble-user': '#332B29',
      '--theme-code-bg': '#000000',
      '--theme-gradient-start': '#E3B5A4',
      '--theme-gradient-end': '#F2EFE9'
    }
  },
  {
    id: 'peach-glow',
    name: 'Peach Glow',
    description: 'Warm, sunny, and cozy workspace using rich terracotta bases and luscious peaches.',
    colors: [
      { name: 'Background', hex: '#150E0C' },
      { name: 'Surface', hex: '#1E1512' },
      { name: 'User Bubble', hex: '#45241C' },
      { name: 'Accent', hex: '#FF9E79' }
    ],
    cssVariables: {
      '--theme-bg': '#150E0C',
      '--theme-accent': '#FF9E79',
      '--theme-secondary': '#FF9E79',
      '--theme-highlight': '#FF9E79',
      '--theme-text-primary': '#F5EAE6',
      '--theme-text-muted': '#8A726C',
      '--theme-surface': '#1E1512',
      '--theme-surface-hover': '#291D19',
      '--theme-border': 'transparent',
      '--theme-bubble-ai': '#1E1512',
      '--theme-bubble-user': '#45241C',
      '--theme-code-bg': '#050404',
      '--theme-gradient-start': '#FF9E79',
      '--theme-gradient-end': '#F5EAE6'
    }
  },
  {
    id: 'pixie-glitter',
    name: 'Pixie Glitter',
    description: 'Y2K inspired animated gradient theme in magenta and pinks.',
    colors: [
      { name: 'Background', hex: '#c86fc9' },
      { name: 'Surface', hex: 'rgba(255, 255, 255, 0.45)' },
      { name: 'User Bubble', hex: '#4c114e' },
      { name: 'Accent', hex: '#f79ad3' }
    ],
    cssVariables: {
      '--theme-bg': '#c86fc9',
      '--theme-accent': '#a144a4',
      '--theme-secondary': '#c86fc9',
      '--theme-highlight': '#4c114e',
      '--theme-text-primary': '#3d0a3f',
      '--theme-text-muted': '#75347a',
      '--theme-surface': 'rgba(255, 255, 255, 0.45)',
      '--theme-surface-hover': 'rgba(255, 255, 255, 0.65)',
      '--theme-border': 'rgba(255, 255, 255, 0.45)',
      '--theme-bubble-ai': 'rgba(255, 255, 255, 0.6)',
      '--theme-bubble-user': '#4c114e',
      '--theme-bubble-user-text': '#ffffff',
      '--theme-code-bg': 'rgba(61, 10, 63, 0.08)',
      '--theme-gradient-start': '#c86fc9',
      '--theme-gradient-end': '#f79ad3'
    }
  }
];

export const generateThemeCSS = () => {
  return appThemes.map(theme => {
    const vars = Object.entries(theme.cssVariables)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');
    return `.theme-${theme.id} {\n${vars}\n}`;
  }).join('\n\n');
};
