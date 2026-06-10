import { Fish, Compass, Sparkles, BookOpen, Layers, Check } from "lucide-react";
import { WECHAT_THEMES } from "../lib/wechat-themes";
import { GenerationSettings, ThemePreset } from "../types";

interface EditorSettingsProps {
  settings: GenerationSettings;
  onChange: (updates: Partial<GenerationSettings>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function EditorSettings({ settings, onChange, onGenerate, isGenerating }: EditorSettingsProps) {
  const tones = [
    { id: "Friendly", name: "亲切幽默 (Warm & Witty)", desc: "适合大众群体，拉近距离" },
    { id: "Professional", name: "严谨专业 (Tech Pro)", desc: "多用术语，深入原理与技巧" },
    { id: "Enthusiastic", name: "饱满激情 (High Energy)", desc: "热血沸腾感，唤醒钓鱼冲动" },
    { id: "Humorous", name: "轻松风趣 (Playful)", desc: "调侃炸线糗事，爆点笑点多" },
  ];

  const levels = [
    { id: "Beginner", name: "新手入门 (Beginner)", desc: "零基础，注重基础概念、避坑与性价比" },
    { id: "Intermediate", name: "进阶提升 (Intermediate)", desc: "有抛投基础，探究微调与具体鱼情" },
    { id: "Expert", name: "骨灰钓手 (Expert)", desc: "发烧友级，专注装备发烧、调子细节与战术" },
  ];

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">内容与排版配置</h2>
          <p className="text-xs text-gray-400">设定文章逻辑，量身打造爆款图文</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Input Outline */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">1. 内容大纲与素材</label>
        <p className="text-xs text-gray-400 leading-normal">
          输入你所需的课程、装备清单、或灵感大纲。AI 将以此展开，融合生动的实战技巧与段落。
        </p>
        <textarea
          value={settings.outline}
          onChange={(e) => onChange({ outline: e.target.value })}
          rows={6}
          className="w-full text-sm p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition p-3 font-sans leading-relaxed"
          placeholder="在此输入您的装备要求大纲..."
        />
      </div>

      {/* Target Level */}
      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-gray-700">2. 目标受众定位</label>
        <div className="grid grid-cols-1 gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onChange({ level: lvl.id as any })}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                settings.level === lvl.id
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                  settings.level === lvl.id
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-300"
                }`}
              >
                {settings.level === lvl.id && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{lvl.name}</p>
                <p className="text-xs text-gray-400">{lvl.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone Select */}
      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-gray-700">3. 写作风格与语气</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tones.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ tone: t.id as any })}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                settings.tone === t.id
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-900">{t.name.split(" ")[0]}</span>
                {settings.tone === t.id && (
                  <Check className="h-4 w-4 text-emerald-600 bg-emerald-50 rounded-full" />
                )}
              </div>
              <p className="text-11px text-gray-400 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Layout Preset */}
      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-gray-700">4. 公众号排版视觉模版</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(WECHAT_THEMES).map((theme) => {
            const isSelected = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onChange({ theme: theme.id })}
                className={`relative p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  isSelected ? "border-zinc-800 bg-zinc-50" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className="h-5 w-5 rounded-full border border-gray-100 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {isSelected && <div className="h-2 w-2 bg-white rounded-full" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {theme.name.split(" ")[0]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom prompt override */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">5. 补充润色要求 (选填)</label>
        <input
          type="text"
          value={settings.customPrompt}
          onChange={(e) => onChange({ customPrompt: e.target.value })}
          className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
          placeholder="例如：提一下保护资源、多提一下微物抛投..."
        />
      </div>

      {/* Main Action Trigger */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:bg-emerald-300 disabled:shadow-none"
      >
        <Sparkles className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} />
        {isGenerating ? "正在通过 AI 精雕细琢文章..." : "一键 AI 生成 & 全新排版"}
      </button>
    </div>
  );
}
