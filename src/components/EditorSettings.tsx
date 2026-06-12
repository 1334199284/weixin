import { useState } from "react";
import { Fish, Compass, Sparkles, BookOpen, Layers, Check, Settings, Eye, EyeOff, Info } from "lucide-react";
import { WECHAT_THEMES } from "../lib/wechat-themes";
import { GenerationSettings, ThemePreset, LayoutPreset, AIConfig } from "../types";
import { DEFAULT_CONTENT_SYSTEM_PROMPT } from "../data/courses";

interface EditorSettingsProps {
  settings: GenerationSettings;
  onChange: (updates: Partial<GenerationSettings>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  aiConfig: AIConfig;
  onAiConfigChange: (updates: Partial<AIConfig>) => void;
}

export default function EditorSettings({ 
  settings, 
  onChange, 
  onGenerate, 
  isGenerating,
  aiConfig,
  onAiConfigChange
}: EditorSettingsProps) {
  const [showAiSetup, setShowAiSetup] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showPromptSetup, setShowPromptSetup] = useState(false);

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

  const applyPreset = (presetName: string) => {
    if (presetName === "siliconflow") {
      onAiConfigChange({
        provider: "custom",
        baseUrl: "https://api.siliconflow.cn/v1",
        textModel: "Qwen/Qwen2.5-72B-Instruct",
        imageModel: "black-forest-labs/FLUX.1-schnell"
      });
    } else if (presetName === "deepseek") {
      onAiConfigChange({
        provider: "custom",
        baseUrl: "https://api.deepseek.com/v1",
        textModel: "deepseek-chat",
        imageModel: "black-forest-labs/FLUX.1-schnell" // Recommend flux-schnell hosted on siliconflow or stability
      });
    } else if (presetName === "openrouter") {
      onAiConfigChange({
        provider: "custom",
        baseUrl: "https://openrouter.ai/api/v1",
        textModel: "qwen/qwen-2.5-72b-instruct",
        imageModel: "black-forest-labs/flux-schnell"
      });
    }
  };

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
          输入你所需的话题、装备清单、或灵感大纲。AI 将以此展开，融合生动的实战玩家技巧与温情分享。
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
        <label className="block text-sm font-semibold text-gray-700">4. 公众号排版视觉配色 (Color Theme)</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(WECHAT_THEMES).map((theme) => {
            const isSelected = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onChange({ theme: theme.id })}
                className={`relative p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  isSelected ? "border-zinc-800 bg-zinc-50 font-bold" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className="h-5 w-5 rounded-full border border-gray-150 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {isSelected && <div className="h-2 w-2 bg-white rounded-full" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-900 truncate">
                    {theme.name.split(" ")[0]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Choose Layout Selector */}
      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-gray-700">5. 排版排版版式布局 (Layout Style)</label>
        <p className="text-xs text-gray-400 leading-normal">
          定制图文卡片的展示风格：极简、大牌半跨杂志、或立体分栏！<b>非单纯配色调整。</b>
        </p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: "classic", name: "极简经典 (Classic)", desc: "标准微信标题与悬浮彩色计数，超流畅的沉浸式传统排版" },
            { id: "split", name: "立体卡片 (Split Card)", desc: "精美圆角白色卡片，配右侧圆形胶囊勋章，模块结构鲜明立体" },
            { id: "hybrid", name: "标题融合 (Hybrid)", desc: "创新合并排版，将段落标题融入硬朗色条内，简洁大气无冗余" },
            { id: "clean_accent", name: "极客少数派 (SSPAI)", desc: "行业大牌热推，主色调粗体左侧边栏，搭配清透微灰色衬底与清爽白背景" },
            { id: "fresh_borderless", name: "空气呼吸感 / 极简留白 (Fresh Airy)", desc: "清新透气，采用高级极简下划线作标题区分，无网格无框拘束，专注文字纯净阅读" },
            { id: "bubble_fresh", name: "清新马卡龙微动 (Fresh Mint)", desc: "萌动可爱，精致圆形主色小露珠点缀，卡片阴影朦胧，适合亲切治愈的阅读风气" }
          ].map((lay) => {
            const isSelected = settings.layout === lay.id;
            return (
              <button
                key={lay.id}
                onClick={() => onChange({ layout: lay.id as LayoutPreset })}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/40"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="mt-1 flex items-center justify-center shrink-0">
                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300"
                  }`}>
                    {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    {lay.name}
                    {isSelected && <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">已选版式</span>}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-normal">{lay.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced AI Setup Section (New, requested by user) */}
      <div className="space-y-2.5 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => setShowAiSetup(!showAiSetup)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-dashed border-emerald-300/60 bg-emerald-50/10 text-emerald-950 text-xs font-bold hover:bg-emerald-50/30 transition text-left cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-600 animate-spin-slow" />
            <span>6. AI 智绘与写字大模型配置 (支持自定义 Qwen / 硅基 / DeepSeek)</span>
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] py-0.5 px-2 rounded-full">
            {showAiSetup ? "折叠配置" : aiConfig.provider === "custom" ? "已激活自定义 Qwen/其他" : "默认 Gemini"}
          </span>
        </button>

        {showAiSetup && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4 animate-slide-down">
            {/* Provider Tabs */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-600">模型提供商 (AI Provider)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAiConfigChange({ provider: "gemini" })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    aiConfig.provider === "gemini"
                      ? "bg-white border-zinc-800 text-zinc-900 shadow-xs"
                      : "bg-slate-100 border-gray-200 text-gray-500 hover:bg-slate-150"
                  }`}
                >
                  Google Gemini (内置)
                </button>
                <button
                  type="button"
                  onClick={() => onAiConfigChange({ provider: "custom" })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    aiConfig.provider === "custom"
                      ? "bg-white border-emerald-600 text-emerald-950 shadow-xs"
                      : "bg-slate-100 border-gray-200 text-gray-500 hover:bg-slate-150"
                  }`}
                >
                  自定义第三方 API (汇入 Qwen/其它)
                </button>
              </div>
            </div>

            {/* If Custom selected */}
            {aiConfig.provider === "custom" && (
              <div className="space-y-3 pt-1 border-t border-slate-200/50">
                {/* Micro Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400">一键填充预设:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset("siliconflow")}
                    className="text-[10px] bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-100 py-0.5 px-2 rounded font-medium transition cursor-pointer"
                  >
                    硅基流动 (SiliconFlow)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("deepseek")}
                    className="text-[10px] bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-100 py-0.5 px-2 rounded font-medium transition cursor-pointer"
                  >
                    DeepSeek 官方
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("openrouter")}
                    className="text-[10px] bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100 py-0.5 px-2 rounded font-medium transition cursor-pointer"
                  >
                    OpenRouter
                  </button>
                </div>

                {/* Base URL */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500">API 接口地址 (Base URL)</span>
                  <input
                    type="text"
                    value={aiConfig.baseUrl}
                    onChange={(e) => onAiConfigChange({ baseUrl: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:border-emerald-500 outline-hidden rounded-lg font-mono"
                    placeholder="https://api.siliconflow.cn/v1"
                  />
                </div>

                {/* API Key */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500">API 秘钥 (API Key)</span>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={aiConfig.apiKey}
                      onChange={(e) => onAiConfigChange({ apiKey: e.target.value })}
                      className="w-full text-xs p-2.5 pr-9 bg-white border border-slate-200 focus:border-emerald-500 outline-hidden rounded-lg font-mono"
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Models Config */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-500">文章写字模型</span>
                    <input
                      type="text"
                      value={aiConfig.textModel}
                      onChange={(e) => onAiConfigChange({ textModel: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 outline-hidden rounded-lg font-mono font-medium"
                      placeholder="e.g. Qwen/Qwen2.5-72B-Instruct"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-500">配图生成模型</span>
                    <input
                      type="text"
                      value={aiConfig.imageModel}
                      onChange={(e) => onAiConfigChange({ imageModel: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 outline-hidden rounded-lg font-mono font-medium"
                      placeholder="e.g. black-forest-labs/FLUX.1-schnell"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If Gemini selected */}
            {aiConfig.provider === "gemini" && (
              <div className="space-y-3 pt-1 border-t border-slate-200/50">
                <div className="flex items-start gap-1.5 p-2 bg-zinc-100 text-zinc-700 rounded-lg text-[10px] leading-relaxed">
                  <Info className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>
                    系统已内置默认 Gemini key。但由于该 key 属于共享并发池，偶尔会产生 429 配额限频报错。如果您有独占 key，可在下方填入（本地私密保存）。
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500">您的 Gemini 独占 API Key (可选自填)</span>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={aiConfig.apiKey}
                      onChange={(e) => onAiConfigChange({ apiKey: e.target.value })}
                      className="w-full text-xs p-2.5 pr-9 bg-white border border-slate-200 focus:border-zinc-800 outline-hidden rounded-lg font-mono"
                      placeholder="AI Studio 申请的 AIzaSy... 秘钥"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Custom prompt override */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <label className="block text-sm font-semibold text-gray-700">7. 个性化补充要求 / 用户提示词 (选填)</label>
        <p className="text-xs text-gray-400 leading-normal">
          所有生成均会自动在后台应用专业的公众号高流量排版规范与平等探讨论述语境。您只需在此输入个性化的补充指令（例如：<i>“多提及一点环保放流、推荐使用微物竿，不要出现重装备”</i>）。
        </p>
        <textarea
          value={settings.customPrompt}
          onChange={(e) => onChange({ customPrompt: e.target.value })}
          rows={4}
          className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition resize-none font-sans leading-relaxed"
          placeholder="留空不填也不影响使用。默认已为您应用内置的公众号黄金排版与友好平等交流法则..."
        />
      </div>

      {/* Main Action Trigger */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:bg-emerald-300 disabled:shadow-none cursor-pointer"
      >
        <Sparkles className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} />
        {isGenerating ? "正在通过 AI 精雕细琢文章..." : "一键 AI 生成 & 全新排版"}
      </button>
    </div>
  );
}

