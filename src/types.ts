export interface ArticleSection {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  proTips: string;
  imagePrompt?: string;
}

export interface WeChatArticle {
  title: string;
  subtitle: string;
  intro: string;
  sections: ArticleSection[];
  safetyTips: string;
  outro: string;
}

export type ThemePreset = 'green' | 'blue' | 'orange' | 'minimalist' | 'red' | 'purple' | 'gold' | 'forest';
export type LayoutPreset = 'classic' | 'split' | 'hybrid' | 'clean_accent' | 'fresh_borderless' | 'bubble_fresh';

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
  layout: LayoutPreset;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  tone: 'Professional' | 'Enthusiastic' | 'Humorous' | 'Friendly';
  customPrompt: string;
}

export interface AIConfig {
  provider: 'gemini' | 'custom';
  apiKey: string;
  baseUrl: string;
  textModel: string;
  imageModel: string;
}

