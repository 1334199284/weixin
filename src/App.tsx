import { useState, useEffect } from "react";
import { Fish, BookOpen, AlertCircle, Compass } from "lucide-react";
import { motion } from "motion/react";
import EditorSettings from "./components/EditorSettings";
import WeChatPreview from "./components/WeChatPreview";
import { GenerationSettings, WeChatArticle, AIConfig } from "./types";
import { ALL_LESSONS, DEFAULT_CONTENT_SYSTEM_PROMPT } from "./data/courses";

export default function App() {
  const [currentLessonId, setCurrentLessonId] = useState<string>("lesson3");
  const defaultLesson = ALL_LESSONS.find(l => l.id === "lesson3") || ALL_LESSONS[1];

  const [settings, setSettings] = useState<GenerationSettings>({
    outline: defaultLesson.outline,
    theme: "green",
    layout: "classic",
    level: "Beginner",
    tone: "Friendly",
    customPrompt: "重点练习过头抛（适合开阔水域），并加入抽停结合、跳底慢拖等手法。",
    contentSystemPrompt: DEFAULT_CONTENT_SYSTEM_PROMPT
  });

  // Client-side local storage persistence for users custom model configurations (e.g. Qwen / SiliconFlow)
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem("wechat_ai_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            provider: parsed.provider || "gemini",
            apiKey: parsed.apiKey || "",
            baseUrl: parsed.baseUrl || "https://api.siliconflow.cn/v1",
            textModel: parsed.textModel || "Qwen/Qwen2.5-72B-Instruct",
            imageModel: parsed.imageModel || "black-forest-labs/FLUX.1-schnell"
          };
        }
      } catch (e) {
        console.warn("Failed to load local saved AI Configuration, resetting to default.", e);
      }
    }
    return {
      provider: "gemini",
      apiKey: "",
      baseUrl: "https://api.siliconflow.cn/v1",
      textModel: "Qwen/Qwen2.5-72B-Instruct",
      imageModel: "black-forest-labs/FLUX.1-schnell"
    };
  });

  // Save changes to localStorage automatically
  useEffect(() => {
    localStorage.setItem("wechat_ai_config", JSON.stringify(aiConfig));
  }, [aiConfig]);

  const [article, setArticle] = useState<WeChatArticle>(defaultLesson.article);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<number | undefined>(undefined);

  const handleSelectLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    const target = ALL_LESSONS.find(l => l.id === lessonId);
    if (target) {
      setSettings(prev => ({ 
          ...prev, 
          outline: target.outline,
          customPrompt: lessonId === "lesson3" 
            ? "重点练习过头抛（适合开阔水域），并加入抽停结合、跳底慢拖等手法。"
            : "加入更多避坑防炸线小窍门，提醒保护大自然。"
        }));
      setArticle(target.article);
    }
  };

  const handleUpdateArticle = (updated: WeChatArticle) => {
    setArticle(updated);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorText(null);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          aiConfig: aiConfig // Pass user's configured provider and models explicitly
        }),
      });

      if (!res.ok) {
        let errMsg = `请求服务器失败：HTTP ${res.status} ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData) {
            if (errData.details) {
              errMsg = `${errData.error || ""}\n\n${errData.details}`;
            } else if (errData.error) {
              errMsg = errData.error;
            } else if (errData.message) {
              errMsg = errData.message;
            }
          }
        } catch (_) {
          // Fallback to text reading if response is not JSON
          try {
            const raw = await res.text();
            if (raw && raw.length < 200) errMsg += `: ${raw}`;
          } catch (_) {}
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.title && data.sections) {
        setArticle(data);
        setGeneratedAt(Date.now());
      } else {
        throw new Error("AI 返回的数据包含未知的结构，请稍后重试");
      }
    } catch (e: any) {
      console.warn(e);
      setErrorText(e.message || "请求 AI 服务失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Editorial Header */}
      <header className="bg-white border-b border-gray-100 py-6 px-8 shrink-0 relative overflow-hidden">
        {/* Subtle decorative background water patterns */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-5 pointer-events-none">
          <Fish className="h-48 w-48 text-emerald-800" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Fish className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">微信公众号文章排版与生成器</h1>
              <p className="text-xs text-gray-500">
                专为路亚新手打造的《{currentLessonId === "lesson2" ? "黄金装备选购精选" : "实战抛投控饵秘籍"}》公众号文章极速生成排版工具
              </p>
            </div>
          </div>

          <div className="flex gap-2 text-xs text-gray-500 bg-gray-100 p-2 rounded-lg items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>智能排版引擎 & 微信剪贴盘已就绪</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Config Settings Form: 5 slots */}
        <div className="lg:col-span-5 h-full space-y-4">
          
          {/* Course Preset Quick Select */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span>1. 快速载入核心教学大纲</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_LESSONS.map((les) => {
                const isActive = currentLessonId === les.id;
                return (
                  <button
                    key={les.id}
                    onClick={() => handleSelectLesson(les.id)}
                    className={`p-3 rounded-xl border text-left transition relative overflow-hidden ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50/40 font-bold text-emerald-950"
                        : "border-gray-150 hover:border-gray-200 text-gray-700 bg-white"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl font-semibold">
                        当前
                      </div>
                    )}
                    <span className="block text-xs font-bold leading-tight truncate">
                      {les.name}
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-1 leading-tight line-clamp-1">
                      {les.shortDesc}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <EditorSettings
              settings={settings}
              onChange={(updates) => setSettings(p => ({ ...p, ...updates }))}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              aiConfig={aiConfig}
              onAiConfigChange={(updates) => setAiConfig(p => ({ ...p, ...updates }))}
            />
          </motion.div>

          {/* Prompt tips card for lure creators */}
          <div className="bg-emerald-500/5 text-emerald-900 border border-emerald-500/10 p-5 rounded-2xl text-xs space-y-2.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Compass className="h-4 w-4" />
              <span>为什么用它排版更懂读者？</span>
            </div>
            <p>
              传统的公众号推文，大段的纯 Markdown 很容易让新手眼花甚至炸裂。
              本排版器不仅支持 <b>AI 全自动内容扩写</b>，而且会按照公众号排版规则：
              <b>彩色醒目标签、斜体导言、亮色背景框（Pro tips）</b> 进行分层优化。
            </p>
            <p className="text-11px text-emerald-700 font-medium">
              💡 小提示：你可以试着在左侧修改大纲信息，添加特定型号，然后点击一键 AI 重写文章。
            </p>
          </div>

          {errorText && (
            <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 flex gap-2.5 items-start text-xs leading-normal">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold mb-1">生成文章时遇到了一个问题</strong>
                <span className="whitespace-pre-wrap block leading-relaxed break-all">{errorText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column Preview Panel Container */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1"
          >
            <WeChatPreview
              article={article}
              themeId={settings.theme}
              layoutId={settings.layout || "classic"}
              onLayoutChange={(newLayout) => setSettings(p => ({ ...p, layout: newLayout }))}
              onUpdateArticle={handleUpdateArticle}
              aiConfig={aiConfig}
              generatedAt={generatedAt}
            />
          </motion.div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 shrink-0">
        <p>© 2026 微信公众号助手. 基于首套容错极高直柄 ML 双节竿设计，选对工具事半功倍</p>
      </footer>
    </div>
  );
}
