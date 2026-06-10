export interface ArticleSection {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  proTips: string;
}

export interface WeChatArticle {
  title: string;
  subtitle: string;
  intro: string;
  sections: ArticleSection[];
  safetyTips: string;
  outro: string;
}

export type ThemePreset = 'green' | 'blue' | 'orange' | 'minimalist';

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  primaryColor: string; // for titles/highlights
  secondaryColor: string; // background of quotes
  borderStyle: string; // css class for borders
  accentBadge: string; // styling for section numbers
  iconColor: string;
}

export interface GenerationSettings {
  outline: string;
  theme: ThemePreset;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  tone: 'Professional' | 'Enthusiastic' | 'Humorous' | 'Friendly';
  customPrompt: string;
}
