import { useState, useRef, useEffect } from "react";
import { 
  Copy, Check, Image as ImageIcon, Sparkles, RefreshCw, Edit2, CheckSquare, 
  ChevronRight, Heart, Share2, HelpCircle, Trash2, Upload, Undo2
} from "lucide-react";
import { generateWeChatInlineHtml, WECHAT_THEMES } from "../lib/wechat-themes";
import { WeChatArticle, ThemePreset, LayoutPreset } from "../types";
import FishingVector from "./FishingVector";
import { motion, AnimatePresence } from "motion/react";

interface WeChatPreviewProps {
  article: WeChatArticle;
  themeId: ThemePreset;
  layoutId: LayoutPreset;
  onLayoutChange?: (layout: LayoutPreset) => void;
  onUpdateArticle: (updated: WeChatArticle) => void;
}

export default function WeChatPreview({ 
  article, 
  themeId, 
  layoutId, 
  onLayoutChange, 
  onUpdateArticle 
}: WeChatPreviewProps) {
  const theme = WECHAT_THEMES[themeId];
  const [copied, setCopied] = useState(false);
  const [copyHtmlSuccess, setCopyHtmlSuccess] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isGeneratingSectionId, setIsGeneratingSectionId] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Graphic Style Selection: true = detailed SVG illustrations / false = photography images (default to photography)
  const [useVectorGraphics, setUseVectorGraphics] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [deletedImages, setDeletedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    console.warn(`Unsplash image failed to load for [${id}]. Switching to custom SVG Vector illustration automatically.`);
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Safe client-side proxy helper for Unsplash images to prevent loading glitches in iframes
  const getProxiedUrl = (url: string) => {
    if (url && url.includes("images.unsplash.com")) {
      return `/api/img-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Editable states
  const [editingField, setEditingField] = useState<{ type: string; sectionId?: string; index?: number } | null>(null);
  const [tempText, setTempText] = useState("");

  // Cover image URL - High-quality majestic sport fisherman casting in golden mist sunrise
  const [coverUrl, setCoverUrl] = useState<string>(
    "https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?auto=format&fit=crop&q=80&w=800"
  );

  // Cover illustration URL - Hand-drawn line art illustration
  const [coverIllustrationUrl, setCoverIllustrationUrl] = useState<string | undefined>(undefined);

  // Section illustration URLs - Curated, premium real-world lure gear photographs matching categories exactly
  const [sectionImages, setSectionImages] = useState<Record<string, string>>({
    rod: "https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?auto=format&fit=crop&q=80&w=600",
    reel: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&q=80&w=600",
    line: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600",
    lures: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=600",
    accessories: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600",
  });

  // Section illustration URLs - Hand-drawn vector cartoon line-art illustrations
  const [sectionIllustrations, setSectionIllustrations] = useState<Record<string, string>>({});

  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  const hiddenHtmlContainerRef = useRef<HTMLDivElement>(null);

  // Copy Plain Text helper
  const copyPlainText = () => {
    const textOutput = `
${article.title}
${article.subtitle}

${article.intro}

${article.sections.map((s, i) => `0${i+1} ${s.title}\n${s.subtitle}\n\n${s.paragraphs.join("\n")}\n\n[💡 避坑指南/实用秘籍]: ${s.proTips}`).join("\n\n")}

【🎣 安全倡议 & 户外礼仪】
${article.safetyTips}

${article.outro}
    `.trim();

    navigator.clipboard.writeText(textOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Copy WeChat Inline-Styled HTML
  const copyWeChatRichHtml = () => {
    // Generate inline-styled HTML with absolute origin to serve proxied images
    const formattedHtml = generateWeChatInlineHtml(
      article, 
      themeId, 
      layoutId, // pass the currently active layout preset
      coverUrl, 
      sectionImages, 
      useVectorGraphics,
      window.location.origin,
      coverIllustrationUrl,
      sectionIllustrations,
      deletedImages // pass deleted images record
    );

    const blob = new Blob([formattedHtml], { type: "text/html" });
    const data = [new ClipboardItem({ "text/html": blob })];

    navigator.clipboard.write(data).then(() => {
      setCopyHtmlSuccess(true);
      setTimeout(() => setCopyHtmlSuccess(false), 3000);
    }).catch(err => {
      console.warn("Rich copy failed, fallback to plain-text copying", err);
      // Fallback: copy raw HTML string
      navigator.clipboard.writeText(formattedHtml).then(() => {
        setCopyHtmlSuccess(true);
        setTimeout(() => setCopyHtmlSuccess(false), 3000);
      });
    });
  };

  // Generate Cover via API
  const generateCoverImage = async () => {
    setIsGeneratingCover(true);
    setQuotaNotice(null);
    const isIllustration = useVectorGraphics;
    const styleParam = isIllustration ? "illustration" : "photography";
    const promptText = isIllustration
      ? "Minimalist flat vector illustration of a sport fisherman casting hook on wood dock at sunrise, elegant graphic design, soft aesthetic color, 简笔画, 手绘插画, 钓鱼, 比例完美"
      : "Professional scenic landscape photography of deep lake lure fishing at foggy golden sunrise sunrise reflection fly fisherman, award winning banner, ultra detailed, 钓鱼, 路亚";

    try {
      const res = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptText,
          id: "cover",
          style: styleParam
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        if (isIllustration) {
          setCoverIllustrationUrl(data.imageUrl);
        } else {
          setCoverUrl(data.imageUrl);
        }
        if (data.isMock) {
          setQuotaNotice("由于当前云端 AI 绘图配额暂满，已为您无缝切换至高保真户外摄影备用池（效果绝佳，可多次重试）。");
        }
      }
    } catch (e) {
      console.warn("Cover image generation failed", e);
      setQuotaNotice("由于当前云端 AI 绘图配额暂满，已为您无缝切换至高保真户外摄影备用池。");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Generate Section Image
  const generateSectionImage = async (id: string, keyword: string) => {
    setIsGeneratingSectionId(id);
    setQuotaNotice(null);
    const isIllustration = useVectorGraphics;
    const styleParam = isIllustration ? "illustration" : "photography";
    const promptText = isIllustration
      ? `Simple minimalist cartoon line drawing sketch of lure tackle: ${keyword}, clean flat vector, white background, soft pastels, 简笔画, 手绘插画, 钓鱼, 比例完美`
      : `Extreme close up photography of high performance professional lure fishing equipment: ${keyword}, dramatic lighting, clean shallow depth design, 钓鱼, 路亚`;

    try {
      const res = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptText,
          id: id,
          style: styleParam
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        if (isIllustration) {
          setSectionIllustrations(prev => ({ ...prev, [id]: data.imageUrl }));
        } else {
          setSectionImages(prev => ({ ...prev, [id]: data.imageUrl }));
        }
        if (data.isMock) {
          setQuotaNotice("由于当前云端 AI 绘图配额暂满，已为您无缝切换至高保真户外摄影备用池（效果绝佳，可多次重试）。");
        }
      }
    } catch (e) {
      console.warn("Section illustration creation failed", e);
      setQuotaNotice("由于当前云端 AI 绘图配额暂满，已为您无缝切换至高保真户外摄影备用池。");
    } finally {
      setIsGeneratingSectionId(null);
    }
  };

  // Generate All Real Photography or Vector Illustrations sequentially using high performance prompts
  const regenerateAllArticlesImages = async () => {
    setIsGeneratingAll(true);
    setQuotaNotice(null);
    let mockActivated = false;
    const isIllustration = useVectorGraphics;
    const styleParam = isIllustration ? "illustration" : "photography";

    try {
      // 1. Cover
      setIsGeneratingCover(true);
      const coverPromptText = isIllustration
        ? "Minimalist flat vector illustration of a sport fisherman casting hook on wood dock at sunrise, elegant graphic design, soft aesthetic color, 简笔画, 手绘插画, 钓鱼, 比例完美"
        : "Professional scenic landscape photography of deep lake lure fishing at foggy golden sunrise sunrise reflection fly fisherman, award winning banner, ultra detailed, 钓鱼, 路亚";

      const coverRes = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: coverPromptText,
          id: "cover",
          style: styleParam
        })
      });
      const coverData = await coverRes.json();
      if (coverData.imageUrl) {
        if (isIllustration) {
          setCoverIllustrationUrl(coverData.imageUrl);
        } else {
          setCoverUrl(coverData.imageUrl);
        }
        if (coverData.isMock) {
          mockActivated = true;
        }
      }
      setIsGeneratingCover(false);

      // 2. Sections
      const secImagePromptMap: Record<string, string> = {
        rod: "lure fishing spinning rod, tackle photo",
        reel: "lure spinning reel 2000, gear photo",
        line: "peline with fluorocarbon leader knot, detail",
        lures: "selection of hard lures minnows and soft grubs, flatlay",
        accessories: "lure pliers, fish grip, polarized sunglasses set",
      };

      for (const id of ["rod", "reel", "line", "lures", "accessories"]) {
        const kw = secImagePromptMap[id];
        setIsGeneratingSectionId(id);
        const sectionPromptText = isIllustration
          ? `Simple minimalist cartoon line drawing sketch of lure tackle: ${kw}, clean flat vector, white background, soft pastels, 简笔画, 手绘插画, 钓鱼, 比例完美`
          : `Extreme close up photography of high performance professional lure fishing equipment: ${kw}, dramatic lighting, clean shallow depth design, 钓鱼, 路亚`;

        const secRes = await fetch("/api/generate-illustration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: sectionPromptText,
            id: id,
            style: styleParam
          })
        });
        const secData = await secRes.json();
        if (secData.imageUrl) {
          if (isIllustration) {
            setSectionIllustrations(prev => ({ ...prev, [id]: secData.imageUrl }));
          } else {
            setSectionImages(prev => ({ ...prev, [id]: secData.imageUrl }));
          }
          if (secData.isMock) {
            mockActivated = true;
          }
        }
      }

      if (mockActivated) {
        setQuotaNotice("由于云端 AI 绘图配额受限（429 频控），系统已为您无缝切换至高保真路亚户外备选摄影库！");
      }
    } catch (e) {
      console.warn("Failed to batch regenerate images", e);
      setQuotaNotice("AI 一键绘图频率受限，已为您无缝启动备用高质量图片池。");
    } finally {
      setIsGeneratingSectionId(null);
      setIsGeneratingCover(false);
      setIsGeneratingAll(false);
    }
  };

  // Only generate photography when requested by clicking the 'regenerate' button,
  // preventing 429 rate limit exceptions on mount.
  useEffect(() => {
    // Curated initial images are loaded as state defaults. Users can manual update via UI.
  }, []);

  // Handle Editing Inline Save
  const startEdit = (type: string, initialVal: string, sectionId?: string, index?: number) => {
    setEditingField({ type, sectionId, index });
    setTempText(initialVal);
  };

  const saveEdit = () => {
    if (!editingField) return;

    const updated = { ...article };

    if (editingField.type === "title") {
      updated.title = tempText;
    } else if (editingField.type === "subtitle") {
      updated.subtitle = tempText;
    } else if (editingField.type === "intro") {
      updated.intro = tempText;
    } else if (editingField.type === "safety") {
      updated.safetyTips = tempText;
    } else if (editingField.type === "outro") {
      updated.outro = tempText;
    } else if (editingField.type === "section-title" && editingField.sectionId) {
      const sec = updated.sections.find(s => s.id === editingField.sectionId);
      if (sec) sec.title = tempText;
    } else if (editingField.type === "section-subtitle" && editingField.sectionId) {
      const sec = updated.sections.find(s => s.id === editingField.sectionId);
      if (sec) sec.subtitle = tempText;
    } else if (editingField.type === "section-tips" && editingField.sectionId) {
      const sec = updated.sections.find(s => s.id === editingField.sectionId);
      if (sec) sec.proTips = tempText;
    } else if (editingField.type === "section-paragraph" && editingField.sectionId && editingField.index !== undefined) {
      const sec = updated.sections.find(s => s.id === editingField.sectionId);
      if (sec) {
        sec.paragraphs[editingField.index] = tempText;
      }
    }

    onUpdateArticle(updated);
    setEditingField(null);
  };

  const handleLocalImageUpload = (id: string, base64Data: string) => {
    if (id === "cover") {
      if (useVectorGraphics) {
        setCoverIllustrationUrl(base64Data);
      } else {
        setCoverUrl(base64Data);
      }
    } else {
      if (useVectorGraphics) {
        setSectionIllustrations(prev => ({ ...prev, [id]: base64Data }));
      } else {
        setSectionImages(prev => ({ ...prev, [id]: base64Data }));
      }
    }
    setDeletedImages(prev => ({ ...prev, [id]: false }));
  };

  const renderSectionGraphic = (sec: any, secImagePromptMap: Record<string, string>) => {
    const id = sec.id;
    if (deletedImages[id]) {
      return (
        <div className="border border-dashed border-gray-200 bg-gray-50/50 rounded-xl p-3.5 my-2 flex flex-col items-center justify-center text-center space-y-1.5 aspect-[16/9]">
          <span className="text-gray-400 text-[10px] font-semibold">🚫 该项插图已被隐藏 (拷贝时不包含)</span>
          <div className="flex gap-2">
            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1 px-2 rounded-md flex items-center gap-1 transition">
              <Upload className="h-3 w-3" />
              本地选择
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => handleLocalImageUpload(id, ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>
            <button
              onClick={() => setDeletedImages(p => ({ ...p, [id]: false }))}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[9px] font-bold py-1 px-2 rounded-md flex items-center gap-1 transition"
            >
              <Undo2 className="h-3 w-3" />
              恢复默认
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative group rounded-lg overflow-hidden aspect-[16/9] my-2 border border-gray-100 bg-zinc-50 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {useVectorGraphics ? (
            sectionIllustrations[id] ? (
              <motion.img 
                key={`sec-illustration-${id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={getProxiedUrl(sectionIllustrations[id])} 
                alt={sec.title} 
                className="w-full h-full object-cover absolute inset-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <motion.div 
                key={`sec-vector-${id}`}
                className="w-full h-full absolute inset-0 flex items-center justify-center animate-fade-in"
              >
                <FishingVector id={id} themeId={themeId} className="w-full h-full" />
              </motion.div>
            )
          ) : (
            !imageErrors[id] && (
              <motion.img 
                key={`sec-photo-${id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={getProxiedUrl(sectionImages[id] || "https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?auto=format&fit=crop&q=80&w=600")} 
                alt={sec.title} 
                className="w-full h-full object-cover absolute inset-0"
                referrerPolicy="no-referrer"
                onError={() => handleImageError(id)}
              />
            )
          )}
        </AnimatePresence>

        {/* Media Controls Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-2 select-none z-10">
          <div className="flex justify-end gap-1">
            <button
              onClick={() => setDeletedImages(p => ({ ...p, [id]: true }))}
              className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition"
              title="隐藏/删除此图"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          
          <div className="flex justify-center gap-1.5 mb-1">
            <button
              onClick={() => generateSectionImage(id, secImagePromptMap[id] || sec.title)}
              disabled={isGeneratingSectionId !== null}
              className="bg-white/95 hover:bg-white text-zinc-900 text-[9px] font-bold py-1 px-2 rounded-md flex items-center gap-1 transition shadow-sm"
            >
              <RefreshCw className={`h-2.5 w-2.5 ${isGeneratingSectionId === id ? "animate-spin" : ""}`} />
              AI重绘
            </button>
            
            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1 px-2 rounded-md flex items-center gap-1 transition shadow-sm">
              <Upload className="h-2.5 w-2.5" />
              本地上传
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => handleLocalImageUpload(id, ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>
          </div>
        </div>

        {isGeneratingSectionId === id && (
          <div className="absolute inset-0 bg-zinc-950/70 flex flex-col items-center justify-center text-white text-[10px] space-y-1 select-none">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent animate-spin mb-1" />
            <span>生成特写...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top action toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
            <span className="text-sm font-semibold text-gray-700">正在应用排版方案：</span>
            <span className="text-sm font-bold" style={{ color: theme.primaryColor }}>{theme.name}</span>
          </div>

          {/* Graphic style toggler with explanation */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setUseVectorGraphics(false)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${!useVectorGraphics ? "bg-white text-zinc-900 shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
              title="使用精选真实路亚运动现场写真，充满户外动感！"
            >
              📷 真实摄影
            </button>
            <button
              onClick={() => setUseVectorGraphics(true)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${useVectorGraphics ? "bg-white text-zinc-900 shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
              title="使用精美矢量高保真手编插画，具有极高收藏与阅读价值！"
            >
              🎨 手绘插画
            </button>
          </div>

          <button
            onClick={regenerateAllArticlesImages}
            disabled={isGeneratingAll}
            className={`px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${isGeneratingAll ? "animate-pulse" : ""}`}
            title={useVectorGraphics ? "一键极速批量重绘并生成所有手绘插画！" : "一键极速批量重绘并生成所有写实户外摄影！"}
          >
            <RefreshCw className={`h-3 w-3 text-emerald-600 ${isGeneratingAll ? "animate-spin" : ""}`} />
            {isGeneratingAll ? (useVectorGraphics ? "批量手绘重绘中..." : "批量摄影重绘中...") : (useVectorGraphics ? "AI一键重绘插画配图" : "AI一键重绘摄影配图")}
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          {/* Plaintext copy */}
          <button
            onClick={copyPlainText}
            className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "已复制文本" : "复制纯文本"}
          </button>

          {/* Magical rich copy for WeChat */}
          <button
            onClick={copyWeChatRichHtml}
            className="relative px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition overflow-hidden shadow-xs shrink-0"
            title="点击直接贴入公众号，文字排版配色能完美保留！"
          >
            {copyHtmlSuccess ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            )}
            {copyHtmlSuccess ? "样式已完美复制！" : "一键复制到公众号"}
          </button>
        </div>
      </div>

      {/* Quick Layout Selection Tab Bar (As requested, actual layout selection layout changes) */}
      <div className="bg-slate-50 p-1.5 rounded-2xl border border-gray-150 flex flex-wrap gap-1.5 items-center select-none shadow-2xs">
        <span className="text-xs font-bold text-gray-400 px-2 flex items-center gap-1.5 shrink-0">
          💅 快捷切换版式风格:
        </span>
        <div className="flex flex-wrap gap-1">
          {[
            { id: "classic", name: "极简经典 (Classic)", icon: "📋" },
            { id: "split", name: "微风卡片 (Split Card)", icon: "🎴" },
            { id: "hybrid", name: "标题融合 (Hybrid)", icon: "🎨" },
            { id: "clean_accent", name: "极客少数派 (Geek)", icon: "💻" },
            { id: "fresh_borderless", name: "极简留白 (Fresh)", icon: "🍃" },
            { id: "bubble_fresh", name: "清新露珠 (Mint)", icon: "💧" }
          ].map(lay => {
            const active = layoutId === lay.id;
            return (
              <button
                key={lay.id}
                onClick={() => onLayoutChange && onLayoutChange(lay.id as LayoutPreset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  active 
                    ? "bg-white text-emerald-700 shadow-xs border border-gray-200" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                <span>{lay.icon}</span>
                <span>{lay.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WeChat styling tooltip notice */}
      {copyHtmlSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-2 px-4 rounded-xl flex items-center justify-between animate-fade-in">
          <span>🚀 <b>复刻成功！</b>你可直接在微信公众号后台 (mp.weixin.qq.com) 编辑框中直接按 <b>Ctrl+V (Command+V)</b> 黏贴。所有精美的绿/蓝/橙彩色标题、带阴影的避坑卡片都会一模一样保留！</span>
          <button onClick={() => setCopyHtmlSuccess(false)} className="font-bold underline cursor-pointer ml-2">关闭</button>
        </div>
      )}

      {/* Quota limit tooltip notice */}
      {quotaNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs py-2 px-4 rounded-xl flex items-center justify-between gap-1.5 animate-fade-in">
          <span className="flex items-center gap-1.5">
            ⚠️ <b>绘制状态提示:</b> {quotaNotice}
          </span>
          <button onClick={() => setQuotaNotice(null)} className="font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer shrink-0">关闭</button>
        </div>
      )}

      {/* Actual smartphone viewport container */}
      <div className="relative mx-auto w-full max-w-sm rounded-[40px] border-[10px] border-zinc-900 bg-gray-50 flex flex-col shadow-2xl overflow-hidden aspect-[9/19.5]">
        {/* Notch & status bars */}
        <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 flex items-center justify-between px-6 z-30">
          <span className="text-10px text-white font-medium">08:01</span>
          <div className="w-24 h-4 bg-zinc-900 rounded-b-xl flex items-center justify-center shrink-0">
            <div className="w-12 h-1 bg-zinc-800 rounded-full" />
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3.5 h-2.5 bg-white rounded-xs" />
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        {/* WeChat app header within the viewport */}
        <div className="h-12 bg-zinc-50 border-b border-gray-100 flex items-center justify-between px-4 pt-4 shrink-0 z-10 select-none">
          <div className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-zinc-400 rotate-180" />
            <span className="text-xs text-zinc-500">微信(1)</span>
          </div>
          <span className="text-xs font-bold text-zinc-800 tracking-wide truncate max-w-[150px]" title={article.title}>{article.title}</span>
          <div className="flex gap-2 text-zinc-600">
            <Share2 className="h-3.5 w-3.5" />
            <span className="text-xs font-bold font-mono">···</span>
          </div>
        </div>

        {/* Scrollable WeChat article viewport */}
        <div className="flex-1 overflow-y-auto bg-white p-4 space-y-4 relative scrollbar-thin">
          
          {/* Article Title block */}
          <div className="space-y-1 pb-1 border-b border-gray-50">
            <div className="group relative">
              {editingField?.type === "title" ? (
                <div className="flex gap-1.5 mt-1">
                  <input
                    type="text"
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    className="flex-1 text-sm p-1.5 border border-emerald-400 rounded-lg outline-hidden text-sm font-bold text-gray-900"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">保存</button>
                </div>
              ) : (
                <div className="relative pr-5">
                  <h1 className="text-base font-bold tracking-tight text-gray-900 leading-snug">
                    {article.title}
                  </h1>
                  <button 
                    onClick={() => startEdit("title", article.title)}
                    className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Article Header Photo Banner */}
          {deletedImages["cover"] ? (
            <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2.5 aspect-[16/9] select-none">
              <span className="text-gray-400 text-[11px] font-semibold">🚫 封面图已删除 (拷贝时将不包含)</span>
              <div className="flex gap-2">
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition">
                  <Upload className="h-3.5 w-3.5" />
                  外部上传
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleLocalImageUpload("cover", ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
                <button
                  onClick={() => setDeletedImages(p => ({ ...p, cover: false }))}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition animate-fade-in"
                >
                  <Undo2 className="h-3 w-3" />
                  恢复配图
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group rounded-xl overflow-hidden aspect-[16/9] bg-zinc-100 border border-gray-100 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {useVectorGraphics ? (
                  coverIllustrationUrl ? (
                    <motion.img 
                      key="cover-illustration"
                      initial={{ opacity: 0, filter: "blur(4px)", scale: 0.98 }}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                      exit={{ opacity: 0 }}
                      src={getProxiedUrl(coverIllustrationUrl)} 
                      alt="Article Cover Illustration" 
                      className="w-full h-full object-cover absolute inset-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <motion.div 
                      key="cover-vector"
                      className="w-full h-full absolute inset-0 flex items-center justify-center"
                    >
                      <FishingVector id="cover" themeId={themeId} className="w-full h-full" />
                    </motion.div>
                  )
                ) : (
                  !imageErrors["cover"] && (
                    <motion.img 
                      key="cover-photo"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={getProxiedUrl(coverUrl)} 
                      alt="Article Cover" 
                      className="w-full h-full object-cover absolute inset-0"
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError("cover")}
                    />
                  )
                )}
              </AnimatePresence>

              {/* Cover Media Overlays */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3 select-none z-10">
                <div className="flex justify-end">
                  <button
                    onClick={() => setDeletedImages(p => ({ ...p, cover: true }))}
                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition"
                    title="删除隐藏此图片"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <div className="flex justify-center gap-2">
                  <button
                    onClick={generateCoverImage}
                    disabled={isGeneratingCover}
                    className="bg-white/95 hover:bg-white text-zinc-900 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition shadow-sm"
                  >
                    <RefreshCw className={`h-3 w-3 ${isGeneratingCover ? "animate-spin" : ""}`} />
                    AI配图重绘
                  </button>
                  
                  <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition shadow-sm">
                    <Upload className="h-3 w-3" />
                    本地置换
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => handleLocalImageUpload("cover", ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>

              {isGeneratingCover && (
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs z-25 select-none">
                  <Sparkles className="h-6 w-6 animate-bounce text-amber-400 mb-1" />
                  正在生成高清路亚封面...
                </div>
              )}
            </div>
          )}

          {/* Catchy intro paragraph */}
          <div className="group relative bg-zinc-50 border border-dashed border-gray-200 rounded-xl p-3.5 my-2">
            {editingField?.type === "intro" ? (
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2 border border-emerald-400 rounded-lg outline-hidden leading-relaxed text-gray-600"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setEditingField(null)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs">取消</button>
                  <button onClick={saveEdit} className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">保存</button>
                </div>
              </div>
            ) : (
              <div className="relative pr-4">
                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                  {article.intro}
                </p>
                <button 
                  onClick={() => startEdit("intro", article.intro)}
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Section Render loop */}
          <div className="space-y-8 pt-2">
            {article.sections.map((sec, index) => {
              const secImagePromptMap: Record<string, string> = {
                rod: "lure fishing spinning rod, tackle photo",
                reel: "lure spinning reel 2000, gear photo",
                line: "peline with fluorocarbon leader knot, detail",
                lures: "selection of hard lures minnows and soft grubs, flatlay",
                accessories: "lure pliers, fish grip, polarized sunglasses set",
              };

              // Standard editable titles and subtitles
              const renderedTitleText = (
                <div className="group relative">
                  {editingField?.type === "section-title" && editingField.sectionId === sec.id ? (
                    <div className="flex gap-1.5 w-full mt-1">
                      <input
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        className="flex-1 text-xs p-1 border border-emerald-400 rounded-lg outline-hidden"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shrink-0">保存</button>
                    </div>
                  ) : (
                    <div className="relative pr-5 group">
                      <h2 className={`font-bold tracking-tight leading-snug`} style={{ 
                        color: theme.primaryColor,
                        fontSize: "14px"
                      }}>
                        {layoutId === "classic" && (
                          <span className={`float-left text-[10px] font-bold w-7 text-center h-[16px] leading-[16px] rounded-xs mr-2 mb-0 mt-[2px] overflow-hidden ${theme.accentBadge}`}>
                            0{index + 1}
                          </span>
                        )}
                        {layoutId === "fresh_borderless" && (
                          <span className="mr-1.5 text-xs font-mono font-extrabold tracking-wider" style={{ color: theme.primaryColor }}>
                            ◆ 0{index + 1}
                          </span>
                        )}
                        {layoutId === "bubble_fresh" && (
                          <span className="mr-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-block text-white" style={{ backgroundColor: theme.primaryColor }}>
                            {index + 1}
                          </span>
                        )}
                        {sec.title.replace(/^\d+\s+/, "")}
                        <button 
                          onClick={() => startEdit("section-title", sec.title, sec.id)}
                          className="inline-flex items-center opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition ml-1.5 align-middle"
                        >
                          <Edit2 className="h-2.5 w-2.5" />
                        </button>
                      </h2>
                    </div>
                  )}
                </div>
              );

              const renderedSubtitleText = (
                <div className="group relative">
                  {editingField?.type === "section-subtitle" && editingField.sectionId === sec.id ? (
                    <div className="flex gap-1.5 w-full mt-1">
                      <input
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        className="flex-1 text-[11px] p-1 border border-emerald-400 rounded-lg outline-hidden"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shrink-0">保存</button>
                    </div>
                  ) : (
                    <div className="relative pr-4">
                      <p className={`text-[10.5px] text-gray-400 font-medium italic ${layoutId === "split" ? "text-emerald-700/80 font-semibold" : "pl-1"}`}>
                        {sec.subtitle}
                      </p>
                      <button 
                        onClick={() => startEdit("section-subtitle", sec.subtitle, sec.id)}
                        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              );

              const renderedParagraphs = (
                <div className="space-y-1.5">
                  {sec.paragraphs.map((p, pIndex) => (
                    <div key={pIndex} className="group relative">
                      {editingField?.type === "section-paragraph" && editingField.sectionId === sec.id && editingField.index === pIndex ? (
                        <div className="flex flex-col gap-1.5 w-full mt-1">
                          <textarea
                            value={tempText}
                            onChange={(e) => setTempText(e.target.value)}
                            rows={3}
                            className="w-full text-xs p-1.5 border border-emerald-400 rounded-lg outline-hidden leading-relaxed text-gray-700 font-sans"
                            autoFocus
                          />
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => setEditingField(null)} className="px-2 py-0.5 border border-gray-200 rounded-lg text-[10px]">取消</button>
                            <button onClick={saveEdit} className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">确定</button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative pr-5">
                          <p className="text-xs text-gray-700 leading-relaxed text-justify whitespace-pre-wrap font-sans">
                            {p}
                          </p>
                          <button 
                            onClick={() => startEdit("section-paragraph", p, sec.id, pIndex)}
                            className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );

              const renderedProTip = (
                <div className="group relative">
                  {editingField?.type === "section-tips" && editingField.sectionId === sec.id ? (
                    <div className="flex flex-col gap-1.5 w-full mt-1.5">
                      <textarea
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-1.5 border border-emerald-400 rounded-lg outline-hidden leading-normal text-gray-700 font-sans"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setEditingField(null)} className="px-2 py-0.5 border border-gray-200 rounded-lg text-[10px]">取消</button>
                        <button onClick={saveEdit} className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">确定</button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative pr-5 pl-0.5">
                      <strong className="text-[11px] block font-bold mb-1" style={{ color: theme.primaryColor }}>
                        {layoutId === "clean_accent" ? "⚡ GEAR INSIGHT / 实战要领" : layoutId === "fresh_borderless" ? "🍀 FOCUS POINT / 重中之重" : layoutId === "bubble_fresh" ? "🍬 SWEET TIPS / 治愈秘笈" : "💡 避坑指南 / 实用秘籍"}
                      </strong>
                      <p className="text-[10.5px] text-gray-650 leading-relaxed font-sans">
                        {sec.proTips}
                      </p>
                      <button 
                        onClick={() => startEdit("section-tips", sec.proTips, sec.id)}
                        className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              );

              // 1. Classic minimal layout
              if (layoutId === "classic") {
                return (
                  <section key={sec.id} className="space-y-3 animate-fade-in relative">
                    {renderedTitleText}
                    {renderedSubtitleText}
                    {renderSectionGraphic(sec, secImagePromptMap)}
                    {renderedParagraphs}
                    <div className="p-3 border-l-3 rounded-r-lg" style={{ backgroundColor: theme.secondaryColor, borderColor: theme.primaryColor }}>
                      {renderedProTip}
                    </div>
                  </section>
                );
              }

              // 2. Air Breathable / Minimalist Accent layout (Fresh Airy style)
              if (layoutId === "fresh_borderless") {
                return (
                  <section key={sec.id} className="space-y-4 pb-6 animate-fade-in relative">
                    <div className="border-b pb-2" style={{ borderBottomColor: theme.primaryColor + "30" }}>
                      {renderedTitleText}
                    </div>
                    {renderedSubtitleText}
                    {renderSectionGraphic(sec, secImagePromptMap)}
                    {renderedParagraphs}
                    <div className="p-3 bg-zinc-50/50 rounded-xl border border-gray-100">
                      {renderedProTip}
                    </div>
                  </section>
                );
              }

              // 3. Float Split Card layout
              if (layoutId === "split") {
                return (
                  <section key={sec.id} className="p-4 bg-zinc-50 border border-gray-150 rounded-2xl shadow-2xs space-y-3.5 animate-fade-in relative">
                    <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                      <div className="flex-1 min-w-0 pr-4">
                        {renderedTitleText}
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full text-white shrink-0 self-start" style={{ backgroundColor: theme.primaryColor }}>
                        SEC 0{index + 1}
                      </span>
                    </div>
                    {renderedSubtitleText}
                    {renderSectionGraphic(sec, secImagePromptMap)}
                    {renderedParagraphs}
                    <div className="p-3 bg-white border border-gray-100 rounded-xl">
                      {renderedProTip}
                    </div>
                  </section>
                );
              }

              // 4. Geek border-accent layout (SSPAI style)
              if (layoutId === "clean_accent") {
                return (
                  <section key={sec.id} className="space-y-3 pb-4 border-b border-gray-120 animate-fade-in relative">
                    <div className="group relative pl-3 border-l-4" style={{ borderColor: theme.primaryColor }}>
                      {editingField?.type === "section-title" && editingField.sectionId === sec.id ? (
                        <div className="flex gap-1.5 w-full mt-1">
                          <input
                            type="text"
                            value={tempText}
                            onChange={(e) => setTempText(e.target.value)}
                            className="flex-1 text-xs p-1 border border-emerald-400 rounded-lg outline-hidden text-gray-800"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shrink-0">保存</button>
                        </div>
                      ) : (
                        <div className="relative pr-5">
                          <h2 className="font-extrabold tracking-tight text-gray-900 leading-snug flex items-center gap-2" style={{ fontSize: "14.5px" }}>
                            <span className="text-[10.5px] font-mono tracking-wider font-bold select-none shrink-0" style={{ color: theme.primaryColor }}>
                              0{index + 1} //
                            </span>
                            <span className="break-words">{sec.title.replace(/^\d+\s+/, "")}</span>
                            <button 
                              onClick={() => startEdit("section-title", sec.title, sec.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition ml-1 shrink-0"
                            >
                              <Edit2 className="h-2.5 w-2.5" />
                            </button>
                          </h2>
                        </div>
                      )}
                    </div>
                    <div className="pl-3.5 space-y-3.5">
                      {renderedSubtitleText}
                      {renderSectionGraphic(sec, secImagePromptMap)}
                      {renderedParagraphs}
                      <div className="p-3 bg-zinc-50 border-l-3 rounded-r-lg" style={{ borderColor: theme.primaryColor }}>
                        {renderedProTip}
                      </div>
                    </div>
                  </section>
                );
              }

              // 5. Cute Macaron / Fresh Mint style with soft shadows
              if (layoutId === "bubble_fresh") {
                return (
                  <section key={sec.id} className="p-5 bg-white border border-gray-100/80 rounded-2xl shadow-xs hover:shadow-md transition space-y-4 animate-fade-in relative">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: theme.primaryColor }} />
                      <div className="flex-1 min-w-0">
                        {renderedTitleText}
                      </div>
                    </div>
                    {renderedSubtitleText}
                    {renderSectionGraphic(sec, secImagePromptMap)}
                    {renderedParagraphs}
                    <div className="p-3.5 rounded-xl bg-gray-50/30 border border-dashed" style={{ borderColor: theme.primaryColor + "40" }}>
                      {renderedProTip}
                    </div>
                  </section>
                );
              }

              // 5. Hybrid layout (Section title integrated directly into header, preventing inside duplicated title)
              if (layoutId === "hybrid") {
                return (
                  <div key={sec.id} className="border-2 rounded-xl overflow-hidden bg-white animate-fade-in relative" style={{ borderColor: theme.primaryColor }}>
                    {editingField?.type === "section-title" && editingField.sectionId === sec.id ? (
                      <div className="flex gap-1.5 w-full bg-white p-2 border-b" style={{ borderBottomColor: theme.primaryColor }}>
                        <input
                          type="text"
                          value={tempText}
                          onChange={(e) => setTempText(e.target.value)}
                          className="flex-1 text-xs p-1 border border-emerald-400 rounded-lg outline-hidden text-gray-800"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shrink-0">保存</button>
                      </div>
                    ) : (
                      <div 
                        className="text-white px-3.5 py-2.5 flex items-start text-[13px] font-bold select-none group/title relative cursor-pointer" 
                        style={{ backgroundColor: theme.primaryColor }}
                        onClick={() => startEdit("section-title", sec.title, sec.id)}
                        title="点击直接编辑标题"
                      >
                        <span className="flex items-center gap-1.5 flex-1 min-w-0 break-words leading-relaxed">
                          <span>0{index + 1} {sec.title.replace(/^\d+\s+/, "")}</span>
                          <Edit2 className="h-3 w-3 opacity-0 group-hover/title:opacity-100 transition text-white/80 shrink-0 mt-0.5" />
                        </span>
                      </div>
                    )}
                    <div className="p-3.5 space-y-3">
                      {renderedSubtitleText}
                      {renderSectionGraphic(sec, secImagePromptMap)}
                      {renderedParagraphs}
                      <div className="p-3 border border-dashed rounded-lg bg-gray-50/30" style={{ borderColor: theme.primaryColor }}>
                        {renderedProTip}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Safety rules and protection tips */}
          <div className="group relative border border-amber-300 bg-amber-50/50 p-3.5 rounded-lg mt-6">
            {editingField?.type === "safety" ? (
              <div className="flex flex-col gap-1.5 w-full">
                <textarea
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 border border-emerald-400 rounded-lg outline-hidden text-amber-900"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setEditingField(null)} className="px-2 py-0.5 border border-gray-200 rounded-lg text-[10px]">取消</button>
                  <button onClick={saveEdit} className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">保存</button>
                </div>
              </div>
            ) : (
              <div className="relative pr-5 pl-0.5">
                <strong className="text-xs text-amber-700 block mb-1">🎣 安全倡议与户外精神</strong>
                <p className="text-[11px] text-amber-800 leading-normal text-justify">
                  {article.safetyTips}
                </p>
                <button 
                  onClick={() => startEdit("safety", article.safetyTips)}
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Outro Concluding Paragraph */}
          <div className="group relative border-t border-gray-100 pt-5 pb-1 mt-6">
            {editingField?.type === "outro" ? (
              <div className="flex flex-col gap-1.5 w-full">
                <textarea
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2 border border-emerald-400 rounded-lg outline-hidden leading-relaxed text-gray-700 font-sans"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setEditingField(null)} className="px-2 py-0.5 border border-gray-200 rounded-lg text-[10px]">取消</button>
                  <button onClick={saveEdit} className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">保存</button>
                </div>
              </div>
            ) : (
              <div className="relative pr-5">
                <p className="text-[11.5px] text-gray-600 leading-relaxed text-justify whitespace-pre-wrap pl-1 md:pl-0 font-sans">
                  {article.outro}
                </p>
                <button 
                  onClick={() => startEdit("outro", article.outro)}
                  className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 p-0.5 transition"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Outro CTA: Official WeChat Profile Card */}
          <div 
            className="border-t border-gray-100 pt-5 pb-4"
            dangerouslySetInnerHTML={{
              __html: `<mp-common-profile class="js_uneditable custom_select_card mp_profile_iframe" data-pluginname="mpprofile" data-id="MzUyNjgwOTEyOQ==" data-headimg="http://mmbiz.qpic.cn/mmbiz_png/Ld6V92O4k5RfEOH0mJ0LdbTjSVIZvmDzqkF1WSnxg7az4iaOqMKMZwjMGR44mibluNrsGqEGBlZYHtXuHIWgDhcQ/0?wx_fmt=png" data-nickname="鱼佬圈" data-alias="W1334199284" data-from="0" style="display: block; margin-bottom: 16px;"><div><div role="option" tabindex="0" aria-labelledby="js_a11y_wx_profile_nickname js_a11y_comma js_a11y_wx_profile_desc js_a11y_comma0 js_a11y_wx_profile_tips js_a11y_comma1 js_a11y_wx_profile_logo" class="appmsg_card_context wx_profile_card wx-root wx_tap_card wx_card_root common-web" data-weui-theme="light" style="font-family: -apple-system-font, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', sans-serif; display: block;"><div class="wx_profile_card_inner" style="border: 1px solid rgba(0, 0, 0, 0.08); background-color: #fafafa; border-radius: 8px; padding: 16px; box-sizing: border-box; display: block;"><div aria-hidden="true" class="wx_profile_card_bd"><div class="wx_profile weui-flex" style="display: flex !important; align-items: flex-start; gap: 14px;"><div class="wx_profile_hd" style="flex-shrink: 0; display: block;"><img src="/api/img-proxy?url=http%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FLd6V92O4k5RfEOH0mJ0LdbTjSVIZvmDzqkF1WSnxg7az4iaOqMKMZwjMGR44mibluNrsGqEGBlZYHtXuHIWgDhcQ%2F0%3Fwx_fmt%3Dpng" alt="" class="wx_profile_avatar" style="width: 48px; height: 48px; border-radius: 4px; display: block; object-fit: cover; border: 1px solid rgba(0, 0, 0, 0.05);"></div> <div class="wx_profile_bd weui-flex weui-flex__item" style="flex: 1; min-width: 0; display: flex !important; justify-content: space-between; align-items: center;"><div class="weui-flex__item" style="flex: 1; min-width: 0; display: block;"><div class="wx_profile_nickname_wrp" style="display: flex; align-items: center; margin-bottom: 4px;"><strong id="js_a11y_wx_profile_nickname" class="wx_profile_nickname" style="font-weight: 700; font-size: 15px; color: #1a1a1a; line-height: 1.4; margin-right: 6px; display: inline-block;">鱼佬圈</strong> <span class="wx_follow_verify" style="display: inline-block; width: 14px; height: 14px; background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 1024 1024\' fill=\'%2307c160\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M426.666667 725.333333l-256-256 60.16-60.16 195.84 195.84 416.426667-416.426667 60.16 60.16z\'/%3E%3C/svg%3E'); background-size: cover; vertical-align: middle; margin-left: 2px;"></span></div> <div id="js_a11y_wx_profile_desc" class="wx_profile_desc" style="font-size: 11.5px; color: #7f7f7f; line-height: 1.5; text-align: justify; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; text-overflow: ellipsis;">解锁最纯粹的户外钓鱼美学！我这不仅有硬核的台钓、路亚、海钓实战技术，更有让你彻底解压的爆护盛宴。一根鱼竿，不仅是水下的博弈，更是成年人说走就走的精致生活。关注并加入属于我们的圈子，一起享受水边最自由的灵魂。</div></div> <i class="weui-icon-arrow" style="display: inline-block; width: 16px; height: 16px; background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\' stroke=\'%23b2b2b2\' stroke-width=\'2.5\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpolyline points=\'9 18 15 12 9 6\'%3E%3C/polyline%3E%3C/svg%3E'); background-size: cover; margin-left: 10px; flex-shrink: 0; opacity: 0.5;"></i></div></div></div> <div id="js_a11y_wx_profile_logo" aria-hidden="true" class="wx_profile_card_ft" style="border-top: 1px solid rgba(0, 0, 0, 0.05); margin-top: 12px; padding-top: 8px; font-size: 11px; color: #b2b2b2; letter-spacing: 0.5px; text-align: left; font-weight: 500; display: block;">公众号</div></div></div> <span aria-hidden="true" id="js_a11y_comma" class="weui-a11y_ref" style="display: none;">，</span></div></mp-common-profile>`
            }}
          />

          <div className="pb-12 pt-4 border-t border-gray-100/50 select-none">
            {/* Simulated WeChat footer interactions */}
            <div className="flex items-center justify-between text-zinc-400 text-[11px] px-1">
              <div className="flex items-center gap-2">
                <span className="hover:text-zinc-600 transition cursor-default">阅读 1.2万+</span>
                <span className="text-zinc-200">|</span>
                <span className="hover:text-zinc-600 transition cursor-pointer">分享</span>
                <span className="hover:text-zinc-600 transition cursor-pointer">收藏</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-0.5 cursor-pointer hover:text-red-500 transition">
                  <Heart className="h-3.5 w-3.5" /> 2311
                </span>
                <span className="flex items-center gap-0.5 cursor-pointer hover:text-yellow-500 transition">
                  ✨ 在看 958
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
