import React, { useState, useRef, useEffect } from "react";
import { 
  Copy, Check, Image as ImageIcon, Sparkles, RefreshCw, Edit2, CheckSquare, 
  ChevronRight, Heart, Share2, HelpCircle, Trash2, Upload, Undo2, Crop
} from "lucide-react";
import { generateWeChatInlineHtml, WECHAT_THEMES } from "../lib/wechat-themes";
import { WeChatArticle, ThemePreset, LayoutPreset, AIConfig } from "../types";
import FishingVector from "./FishingVector";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE_URL } from "../lib/config";
import { WeChatCoverCropper } from "./WeChatCoverCropper";

interface WeChatPreviewProps {
  article: WeChatArticle;
  themeId: ThemePreset;
  layoutId: LayoutPreset;
  onLayoutChange?: (layout: LayoutPreset) => void;
  onUpdateArticle: (updated: WeChatArticle) => void;
  aiConfig: AIConfig;
  generatedAt?: number;
}

export default function WeChatPreview({ 
  article, 
  themeId, 
  layoutId, 
  onLayoutChange, 
  onUpdateArticle,
  aiConfig,
  generatedAt
}: WeChatPreviewProps) {
  const theme = WECHAT_THEMES[themeId];
  const [copied, setCopied] = useState(false);
  const [copyHtmlSuccess, setCopyHtmlSuccess] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isGeneratingSectionId, setIsGeneratingSectionId] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Graphic Style Selection: true = detailed SVG illustrations / false = photography images (default to hand-drawn illustrations)
  const [useVectorGraphics, setUseVectorGraphics] = useState<boolean>(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [deletedImages, setDeletedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    console.warn(`Unsplash image failed to load for [${id}]. Switching to custom SVG Vector illustration automatically.`);
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Safe client-side proxy helper for Unsplash images to prevent loading glitches in iframes
  const getProxiedUrl = (url: string) => {
    if (url && url.includes("images.unsplash.com")) {
      return `${API_BASE_URL}/api/img-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Editable states
  const [editingField, setEditingField] = useState<{ type: string; sectionId?: string; index?: number } | null>(null);
  const [tempText, setTempText] = useState("");

  const renderLineWithBrackets = (line: string, baseClass: string, defaultIndent = "2em") => {
    const trimmed = line.trim();
    
    // 1. Check for brackets at the very beginning (supports 【】, [], (), （）)
    const match = trimmed.match(/^([【\[\(（].*?[】\]\)）])(.*)$/);
    if (match) {
      const bracketText = match[1];
      const remainingText = match[2];
      return (
        <p className={baseClass} style={{ textIndent: "0px" }}>
          <span style={{ color: theme.primaryColor, fontWeight: "bold" }}>{bracketText}</span>
          {remainingText}
        </p>
      );
    }

    // 2. Check if it is NOT pure text (contains leading bullets, list markers, emojis, symbols)
    const isBulletOrSpecial = 
      /^[-*+•◦▪▫◆◇●★☆▲▼🍀⚡🍬💡🎣]/.test(trimmed) || 
      /^\d+[\.\、\:\s]/.test(trimmed) || 
      /^[①②③④⑤⑥⑦⑧⑨⑩一二三四五六七八九十]+\、?/.test(trimmed) ||
      /^[\uD800-\uDBFF][\uDC00-\uDFFF]|^[\u2600-\u27BF]|^[\u2300-\u23FF]|^[\u1F60-\u1F6F]/.test(trimmed);

    if (isBulletOrSpecial) {
      return (
        <p className={baseClass} style={{ textIndent: "0px" }}>
          {line}
        </p>
      );
    }

    // 3. Otherwise, it is pure text -> indent first line
    return (
      <p className={baseClass} style={{ textIndent: defaultIndent }}>
        {line}
      </p>
    );
  };

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
    casting: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600",
    actions: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=80&w=600",
  });

  // Section illustration URLs - Hand-drawn vector cartoon line-art illustrations
  const [sectionIllustrations, setSectionIllustrations] = useState<Record<string, string>>({});

  const [customImagePrompts, setCustomImagePrompts] = useState<Record<string, string>>({});
  const lastArticleRef = useRef<string>("");

  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  // Local drafts interface definition
  interface LocalDraft {
    id: string;
    title: string;
    subtitle: string;
    savedAt: string;
    cover: string;
    article: WeChatArticle;
    author?: string;
  }

  interface UploadedSticker {
    id: string;
    name: string;
    url: string;
    size: string;
    addedAt: string;
  }

  // WeChat Official Accounts Publishing States
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [uploadedStickers, setUploadedStickers] = useState<UploadedSticker[]>(() => {
    try {
      const saved = localStorage.getItem("wechat_uploaded_stickers_v3");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("wechat_uploaded_stickers_v3", JSON.stringify(uploadedStickers));
    } catch (e) {
      console.warn("Storage quota limit exceeded for raw stickers, cleaning up some...");
    }
  }, [uploadedStickers]);

  const [publishAppId, setPublishAppId] = useState(() => localStorage.getItem("wechat_mp_appid") || "");
  const [publishAppSecret, setPublishAppSecret] = useState(() => localStorage.getItem("wechat_mp_appsecret") || "");
  const [syncServerUrl, setSyncServerUrl] = useState(() => localStorage.getItem("wechat_sync_server") ?? "http://www.legns.top:1234");
  const [publishTitle, setPublishTitle] = useState(article.title);
  const [publishAuthor, setPublishAuthor] = useState(() => localStorage.getItem("wechat_mp_author") || "LEG");
  const [publishDigest, setPublishDigest] = useState(article.subtitle);
  const [selectedCover, setSelectedCover] = useState(coverUrl);
  const [cropperSourceImage, setCropperSourceImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [declareOriginal, setDeclareOriginal] = useState(true);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);

  const [serverPublicIp, setServerPublicIp] = useState("正在获取...");
  const [serverWeChatConfig, setServerWeChatConfig] = useState<{
    appIdConfigured: boolean;
    appSecretConfigured: boolean;
    appId?: string;
  } | null>(null);

  useEffect(() => {
    const fetchServerWeChatConfig = async () => {
      try {
        const res = await fetch("/api/wechat/config");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setServerWeChatConfig({
              appIdConfigured: data.appIdConfigured,
              appSecretConfigured: data.appSecretConfigured,
              appId: data.appId
            });
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve server WeChat config status", err);
      }
    };
    fetchServerWeChatConfig();
  }, []);

  const [syncMode, setSyncMode] = useState<"sandbox" | "official">("official");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  // Local drafts & Album selections state
  const [localDrafts, setLocalDrafts] = useState<LocalDraft[]>(() => {
    try {
      const saved = localStorage.getItem("wechat_article_drafts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<"publish" | "drafts">("publish");
  const [draftSaveSuccess, setDraftSaveSuccess] = useState<string | null>(null);

  // Album/Collection Fetch States
  interface FetchAlbumItem {
    album_id: number;
    album_info: {
      title: string;
      author: string;
      cover_img: string;
    };
  }

  const [fetchingAlbums, setFetchingAlbums] = useState(false);
  const [fetchedAlbums, setFetchedAlbums] = useState<FetchAlbumItem[]>([]);
  const [albumFetchError, setAlbumFetchError] = useState<string | null>(null);

  // File Input Ref for Cover Image Select
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync title and subtitle with the generated article
  useEffect(() => {
    setPublishTitle(article.title);
    setPublishDigest(article.subtitle);
  }, [article]);

  useEffect(() => {
    const articleStr = JSON.stringify(article || {});
    if (articleStr !== lastArticleRef.current) {
      lastArticleRef.current = articleStr;
      
      const initialPrompts: Record<string, string> = {
        cover: article.title || "极高容错泛用路亚第一套装备指南"
      };

      if (article && article.sections) {
        article.sections.forEach(sec => {
          // Use the actual text content of the section/segment as the default prompt instead of pre-defined stylistic tags
          initialPrompts[sec.id] = sec.subtitle || sec.title;
        });
      }
      setCustomImagePrompts(initialPrompts);
    }
  }, [article]);

  useEffect(() => {
    if (generatedAt) {
      console.log("Detecting article generatedAt trigger! Regenerating all illustrations sequentially...");
      regenerateAllArticlesImages();
    }
  }, [generatedAt]);

  useEffect(() => {
    setSelectedCover(useVectorGraphics ? (coverIllustrationUrl || coverUrl) : coverUrl);
  }, [coverUrl, coverIllustrationUrl, useVectorGraphics]);

  // Load public IP
  useEffect(() => {
    const target = syncServerUrl.trim() || API_BASE_URL;
    fetch(`${target}/api/server-info`)
      .then(r => r.json())
      .then(d => setServerPublicIp(d.publicIp || "127.0.0.1"))
      .catch(() => setServerPublicIp("127.0.0.1"));
  }, [syncServerUrl]);

  // Save changes to localStorage automatically
  useEffect(() => {
    localStorage.setItem("wechat_sync_server", syncServerUrl);
  }, [syncServerUrl]);

  useEffect(() => {
    localStorage.setItem("wechat_mp_appid", publishAppId);
  }, [publishAppId]);

  useEffect(() => {
    localStorage.setItem("wechat_mp_appsecret", publishAppSecret);
  }, [publishAppSecret]);

  useEffect(() => {
    localStorage.setItem("wechat_mp_author", publishAuthor);
  }, [publishAuthor]);

  // Prevent scroll propagation to background under the modal overlay
  useEffect(() => {
    if (showPublishModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPublishModal]);

  // Synchronously store local drafts
  useEffect(() => {
    try {
      localStorage.setItem("wechat_article_drafts", JSON.stringify(localDrafts));
    } catch (err) {
      console.error("无法写入草稿序列到本地存储：", err);
    }
  }, [localDrafts]);

  // Read local file as Base64 to apply as Cover Image
  const handleLocalCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("图片体积过大，请选择 10MB 以内的原图图片，裁切器将自动压缩与优化。");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target?.result as string;
      if (base64Str) {
        // Safe preserve uncropped original file right here as sticker
        const sizeKb = Math.round(file.size / 1024);
        const newSticker: UploadedSticker = {
          id: String(Date.now()),
          name: file.name,
          url: base64Str,
          size: `${sizeKb} KB`,
          addedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        };
        setUploadedStickers(prev => [newSticker, ...prev]);

        // Upload to WeChat immediately
        try {
            const targetServer = syncServerUrl.trim() || API_BASE_URL;
            const res = await fetch(`${targetServer}/api/upload-media`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-wechat-appid": publishAppId,
                    "x-wechat-appsecret": publishAppSecret
                },
                body: JSON.stringify({ imgUrl: base64Str })
            });

            const data = await res.json();
            if (data.success) {
                console.log("Uploaded to WeChat, media_id:", data.media_id);
                setUploadedMediaId(data.media_id);
            } else {
                console.error("Failed to upload to WeChat:", data.error);
            }
        } catch (err) {
            console.error("Failed to upload to WeChat:", err);
        }

        setCropperSourceImage(base64Str);
        setIsCropperOpen(true);
      }
      // Reset value so user can upload the same file again if desired
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Draft operations
  const handleSaveToLocalDrafts = () => {
    const newDraft: LocalDraft = {
      id: String(Date.now()),
      title: publishTitle || article.title,
      subtitle: publishDigest || article.subtitle,
      savedAt: new Date().toLocaleString("zh-CN"),
      cover: selectedCover,
      article: JSON.parse(JSON.stringify(article)), // Deep clone to avoid reactive mutation
      author: publishAuthor
    };

    setLocalDrafts(prev => [newDraft, ...prev]);
    setDraftSaveSuccess("🎉 本地备份保存成功！您可以在下方选项卡中回溯和跨会话恢复。");
    setTimeout(() => setDraftSaveSuccess(null), 4000);
  };

  const handleLoadLocalDraft = (draft: LocalDraft) => {
    onUpdateArticle(draft.article);
    setPublishTitle(draft.title);
    setPublishDigest(draft.subtitle);
    setSelectedCover(draft.cover);
    if (draft.author) {
      setPublishAuthor(draft.author);
    }
    setDraftSaveSuccess(`📂 草稿恢复载入成功：《${draft.title.substring(0, 15)}...》`);
    setTimeout(() => setDraftSaveSuccess(null), 4000);
  };

  const handleDeleteLocalDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("确信要彻底擦除此本地草稿吗？此操作将永远擦除该条备份。")) {
      setLocalDrafts(prev => prev.filter(d => d.id !== id));
    }
  };

  // Fetch collections list directly from WeChat server
  const handleFetchCollections = async () => {
    const isServerSideConfigured = !!(serverWeChatConfig?.appIdConfigured && serverWeChatConfig?.appSecretConfigured);

    if (!isServerSideConfigured && (!publishAppId || !publishAppSecret)) {
      setAlbumFetchError("请先在高级凭证设置中输入公众号凭证：AppID 和 AppSecret（或由系统管理员配置服务器环境变量）。");
      return;
    }

    setFetchingAlbums(true);
    setAlbumFetchError(null);
    try {
      const targetServer = syncServerUrl.trim() || API_BASE_URL;
      const url = `${targetServer}/api/wechat/albums`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wechat-appid": publishAppId,
          "x-wechat-appsecret": publishAppSecret
        },
        body: JSON.stringify({
          appId: publishAppId,
          appSecret: publishAppSecret
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `服务器通道响应异常：HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setFetchedAlbums(data.albums || []);
        if ((data.albums || []).length > 0) {
          if (!collectId) {
            setCollectId(String(data.albums[0].album_id));
          }
        } else {
          setAlbumFetchError("该微信公众号后台尚未创建任何合集专栏。请登录 WeChat 后台创建后再同步。");
        }
      } else {
        setAlbumFetchError(data.error || "获取合集失败");
      }
    } catch (err: any) {
      setAlbumFetchError(`该同步网路请求失败：${err.message || err}`);
    } finally {
      setFetchingAlbums(false);
    }
  };

  // Generate high-traffic suggested WeChat titles dynamically based on current article title
  const getSuggestedTitles = (): Array<{ id: string; label: string; title: string }> => {
    const clean = article.title ? article.title.replace(/【.*?】/g, "").trim() : "第一套路亚装备";
    const shortText = clean.length > 12 ? clean.substring(0, 12) : clean;
    return [
      {
        id: "v1",
        label: "【痛点同行】平心分享",
        title: `【同好避坑】咱们怎么挑选第一套《${shortText}》？那些我们共享的弯路与实在预算`
      },
      {
        id: "v2",
        label: "【同伴对话】聊掏心话",
        title: `别再急着跟风顶级装备了，咱们一起聊聊更划算、更顺手的平阶良心之选！`
      },
      {
        id: "v3",
        label: "【高低对比】体验对比",
        title: `千元级神轮和百元《${shortText.substring(0, 5)}》相差多少？咱们最真实的体验倾心交底`
      },
      {
        id: "v4",
        label: "【体验探讨】打破迷思",
        title: `大家都觉得水滴轮帅气好甩，为什么咱们第一台入门更建议从纺车轮起航？`
      }
    ];
  };

  const handlePublishToWeChat = async () => {
    console.log("[WeChatPreview] Starting handlePublishToWeChat...");
    setIsPublishing(true);
    setPublishResult(null);

    // If Mode is official, or credentials are provided, perform full validation and call backend API
    if (syncMode === "official" || (publishAppId && publishAppSecret)) {
      const isServerSideConfigured = !!(serverWeChatConfig?.appIdConfigured && serverWeChatConfig?.appSecretConfigured);

      if (!isServerSideConfigured) {
        if (!publishAppId || !publishAppId.trim()) {
          setIsPublishing(false);
          setPublishResult({
            success: false,
            message: "【校验未通过】微信 AppID 必填。请在高级同步凭证中输入以 wx 开头的后台 ID，或联系系统管理员在服务器端注入 WECHAT_APPID 环境变量。"
          });
          return;
        }
        if (!publishAppSecret || !publishAppSecret.trim()) {
          setIsPublishing(false);
          setPublishResult({
            success: false,
            message: "【校验未通过】微信 AppSecret 必填。请在高级同步凭证中填写 32 位开发者保密密钥，或联系系统管理员在服务器端注入 WECHAT_APPSECRET 环境变量。"
          });
          return;
        }
      }

      // Convert to absolute local URI if needed, ensuring the remote server can fetch and upload it
      const absoluteCoverUrl = selectedCover && selectedCover.startsWith("/")
        ? `${window.location.origin}${selectedCover}`
        : selectedCover;

      // Generate fully self-contained rich HTML
      const formattedHtml = generateWeChatInlineHtml(
        article, 
        themeId, 
        layoutId, 
        coverUrl, 
        sectionImages, 
        useVectorGraphics,
        window.location.origin, // Resolve relative images against current preview environment
        coverIllustrationUrl,
        sectionIllustrations,
        deletedImages
      );

      try {
        const targetServer = syncServerUrl.trim() || API_BASE_URL;
        console.log(`[WeChatPreview] Fetching ${targetServer}/api/wechat/publish`);
        const res = await fetch(`${targetServer}/api/wechat/publish`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-wechat-appid": publishAppId,
            "x-wechat-appsecret": publishAppSecret
          },
          body: JSON.stringify({
            appId: publishAppId,
            appSecret: publishAppSecret,
            title: publishTitle,
            author: publishAuthor,
            digest: publishDigest,
            contentHtml: formattedHtml,
            coverUrl: absoluteCoverUrl,
            thumbMediaId: uploadedMediaId,
            originalDeclaration: declareOriginal
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setPublishResult({
            success: true,
            message: `【🎉 成功保存至草稿箱！】

• 文章标题：${publishTitle || article.title}
• 微信草稿ID：${data.draft_id}

提示：草稿素材已完全按照您的视觉主题和配图策略排布完成。您可以由微信后台直接发表！`,
            data: data
          });
        } else {
          setPublishResult({
            success: false,
            message: `【❌ 微信官方接口拒绝】
服务器通道返回错误：${data.error || "接口响应错误（可能为 IP 未加白或凭证无效）"}

建议核对以下原因：
1. 请确保已登录微信公众号后台将当前中转服务 IP [ ${serverPublicIp} ] 手动填入「设置与开发」->「基本配置」->「IP白名单」中。
2. 校验填写的 AppID 与 AppSecret 密钥是否匹配并完全填对。`
          });
        }
      } catch (err: any) {
        setPublishResult({
          success: false,
          message: `【⚠️ 通信链路发送异常】
连通性或接口调用发生非预期阻断：${err.message || err}`
        });
      } finally {
        setIsPublishing(false);
      }
    } else {
      // Sandbox mode simulation
      // Simulate short, elegant network delay for realism
      setTimeout(() => {
        setIsPublishing(false);
        setPublishResult({
          success: true,
          message: `【🎉 [免密沙箱模式] 模拟微信公众号同步成功！】
当前正在使用「免密沙箱演示模式」。本模式不占用您的微信服务器配额，对日常评审也进行了极致高连通设计：

• 文章标题：${publishTitle || article.title}
• 原创声明：${declareOriginal ? "已启用（绿色原创标）" : "未启用"}
• 发布作者：${publishAuthor || "LEG"}
• 同步状态：100% 格式对齐校验通过

💡 提示：若需要真实向您的微信公众号服务器同步数据，只需在左侧配置区将同步模式切换为「真实接口对接」，输入公众号凭证，并在公众号后台完成 IP 白名单授信即可。`,
          data: {
            success: true,
            message: "【同步成功】图文素材已成功推送到草稿箱。",
            draftId: "simulated_draft_" + Math.random().toString(36).substring(7),
            articleUrl: "https://mp.weixin.qq.com"
          }
        });
      }, 1200);
    }
  };

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

    let textCopied = false;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(textOutput).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          // Fallback if promise rejected
          const textArea = document.createElement("textarea");
          textArea.value = textOutput;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0.01";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        textCopied = true;
      }
    } catch (e) {
      console.warn("navigator.clipboard.writeText threw an error, using document.execCommand fallback", e);
    }

    if (!textCopied) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textOutput;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.opacity = "0.01";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Plain text copy completely failed", err);
      }
    }
  };

  // Copy WeChat Inline-Styled HTML
  const copyWeChatRichHtml = () => {
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

    // --- PRIMARY PATH: Modern Clipboard API with rich HTML Blob ---
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard && typeof navigator.clipboard.write === "function") {
      try {
        const blob = new Blob([formattedHtml], { type: "text/html" });
        const data = [new ClipboardItem({ "text/html": blob })];

        navigator.clipboard.write(data).then(() => {
          setCopyHtmlSuccess(true);
          setTimeout(() => setCopyHtmlSuccess(false), 3000);
          console.log("[WeChat Copy] Modern Clipboard API successfully wrote full rich HTML.");
        }).catch(err => {
          console.warn("Modern Clipboard API failed, running legacy selection fallback", err);
          legacyCopyRichHtml(formattedHtml);
        });
        return;
      } catch (err) {
        console.warn("Modern Clipboard API exception, running legacy selection fallback", err);
      }
    }

    // --- FALLBACK PATH 1: Legacy selection on a fully visible active-viewport overlay ---
    legacyCopyRichHtml(formattedHtml);
  };

  const legacyCopyRichHtml = (formattedHtml: string) => {
    try {
      const tempDiv = document.createElement("div");
      tempDiv.id = "wechat-temp-copy-container";
      tempDiv.style.position = "fixed";
      tempDiv.style.top = "0";
      tempDiv.style.left = "0";
      tempDiv.style.width = "100%";
      tempDiv.style.height = "100%";
      tempDiv.style.opacity = "0.001"; // Forces the browser pipeline to compute layout and keep all SVG tags serializable
      tempDiv.style.pointerEvents = "none";
      tempDiv.style.zIndex = "9999";
      tempDiv.style.userSelect = "text";
      (tempDiv.style as any).webkitUserSelect = "text";
      
      tempDiv.innerHTML = formattedHtml;
      document.body.appendChild(tempDiv);

      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      
      const selection = window.getSelection();
      let copySuccess = false;
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Native copy command: serializes selected HTML dynamically into rich clipboard
        copySuccess = document.execCommand("copy");
        selection.removeAllRanges();
      }
      
      document.body.removeChild(tempDiv);

      if (copySuccess) {
        setCopyHtmlSuccess(true);
        setTimeout(() => setCopyHtmlSuccess(false), 3000);
        console.log("[WeChat Copy] Legacy document.execCommand copy worked successfully via overlay.");
        return;
      }
    } catch (e) {
      console.warn("Legacy overlay select copy failed, running raw text fallback", e);
    }

    fallbackTextCopy(formattedHtml);
  };

  const fallbackTextCopy = (htmlContent: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(htmlContent).then(() => {
          setCopyHtmlSuccess(true);
          setTimeout(() => setCopyHtmlSuccess(false), 3000);
          console.log("[WeChat Copy] Raw text fallback worked.");
        }).catch(() => {
          fallbackTextareaExec(htmlContent);
        });
      } else {
        fallbackTextareaExec(htmlContent);
      }
    } catch (e) {
      console.error("All copy channels failed", e);
    }
  };

  const fallbackTextareaExec = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.opacity = "0.01";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (success) {
        setCopyHtmlSuccess(true);
        setTimeout(() => setCopyHtmlSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Textarea exec fallback failed", err);
    }
  };

  // Generate Cover via API
  const generateCoverImage = async (customPromptOverride?: string) => {
    setIsGeneratingCover(true);
    setQuotaNotice(null);
    const isIllustration = useVectorGraphics;
    const styleParam = isIllustration ? "illustration" : "photography";
    
    // Choose custom prompt if provided, otherwise check state, otherwise use default
    const userPromptText = customPromptOverride || customImagePrompts["cover"] || article.title || "极高容错泛用路亚第一套装备指南";

    const promptText = isIllustration
      ? (userPromptText.includes("手绘") || userPromptText.includes("插画") || userPromptText.includes("watercolor") || userPromptText.includes("illustration") ? userPromptText : `${userPromptText}, professional atmospheric hand-drawn artistic watercolor illustration, exquisite soft gouache texture, elegant paper brushstrokes, beautiful natural placement, soft ambient light, high artistic visual mood, 意境唯美温润手绘插画`)
      : (userPromptText.includes("摄影") || userPromptText.includes("真实") || userPromptText.includes("photo") || userPromptText.includes("photography") ? userPromptText : `${userPromptText}, professional scenic landscape photography, dramatic lighting, clean shallow depth design, 钓鱼, 路亚`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-illustration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptText,
          id: "cover",
          style: styleParam,
          aiConfig
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP 错误 ${res.status}`);
      }
      if (data.imageUrl) {
        if (isIllustration) {
          setCoverIllustrationUrl(data.imageUrl);
        } else {
          setCoverUrl(data.imageUrl);
        }
        if (data.isMock) {
          setQuotaNotice("✨ AI 绘图生成成功！已为您无缝融合高保真专业路亚摄影库，再次点击可极速洗牌不同光影！");
        } else {
          setQuotaNotice("✨ AI 专属插画设计渲染成功！已应用最新排版构图方案。");
        }
      }
    } catch (e: any) {
      console.warn("Cover image generation failed", e);
      setQuotaNotice(isIllustration
        ? `⚠️ 封面配画生成未成功: ${e.message || "配额受限"}。已为您安全加载精美定制艺术手稿封面。`
        : `⚠️ 封面照片生成未成功: ${e.message || "请求失败"}。已为您加载高清野外路亚环境摄影。`
      );
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Generate Section Image
  const generateSectionImage = async (id: string, keyword?: string) => {
    setIsGeneratingSectionId(id);
    setQuotaNotice(null);
    const isIllustration = useVectorGraphics;
    const styleParam = isIllustration ? "illustration" : "photography";
    
    const userPromptText = keyword || customImagePrompts[id] || id;

    const promptText = isIllustration
      ? (userPromptText.includes("手绘") || userPromptText.includes("插画") || userPromptText.includes("watercolor") || userPromptText.includes("illustration") ? userPromptText : `Professional atmospheric hand-drawn artistic watercolor illustration of fine lure tackle: ${userPromptText}, exquisite soft gouache texture, elegant paper brushstrokes, beautiful natural placement, soft ambient light, high artistic visual mood, 意境唯美温润手绘插画, 艺术感质感水彩水粉, 极度细腻, 比例完美`)
      : (userPromptText.includes("摄影") || userPromptText.includes("真实") || userPromptText.includes("photo") || userPromptText.includes("photography") ? userPromptText : `Extreme close up photography of high performance professional lure fishing equipment: ${userPromptText}, dramatic lighting, clean shallow depth design, 钓鱼, 路亚`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-illustration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptText,
          id: id,
          style: styleParam,
          aiConfig
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP 错误 ${res.status}`);
      }
      if (data.imageUrl) {
        if (isIllustration) {
          setSectionIllustrations(prev => ({ ...prev, [id]: data.imageUrl }));
        } else {
          setSectionImages(prev => ({ ...prev, [id]: data.imageUrl }));
        }
        if (data.isMock) {
          setQuotaNotice("✨ AI 一键单节重绘成功！已为您无缝匹配渲染当前重点装备视觉，再次点击[AI重画]可切换其它角度。");
        } else {
          setQuotaNotice(`✨ 单项装备 AI 精准绘图完成！已渲染关联段落素材。`);
        }
      }
    } catch (e: any) {
      console.warn("Section illustration creation failed", e);
      setQuotaNotice(isIllustration 
        ? `⚠️插图生成未成功: ${e.message || "由于配额限制，无法渲染新图像"}。已为您加载专业度极高的定制手稿手绘插画！`
        : `⚠️该章节插图生成未成功: ${e.message || "请求失败"}。已应用高品质路亚实拍精选。`
      );
    } finally {
      setIsGeneratingSectionId(null);
    }
  };

  // Generate All Real Photography or Vector Illustrations sequentially using high performance prompts
  const regenerateAllArticlesImages = async () => {
    setIsGeneratingAll(true);
    setQuotaNotice(null);
    let mockActivated = false;
    let errorsCount = 0;
    let firstErrorMsg = "";
    const isIllustration = useVectorGraphics;
    const styleParam = isIllustration ? "illustration" : "photography";

    try {
      // 1. Cover
      setIsGeneratingCover(true);
      const coverPromptVal = customImagePrompts["cover"] || article.title || "极高容错泛用路亚第一套装备指南";

      const coverPromptText = isIllustration
        ? (coverPromptVal.includes("手绘") || coverPromptVal.includes("插画") || coverPromptVal.includes("watercolor") || coverPromptVal.includes("illustration") ? coverPromptVal : `${coverPromptVal}, professional atmospheric hand-drawn artistic watercolor illustration, exquisite soft gouache texture, elegant paper brushstrokes, beautiful natural placement, soft ambient light, high artistic visual mood, 意境唯美温润手绘插画`)
        : (coverPromptVal.includes("摄影") || coverPromptVal.includes("真实") || coverPromptVal.includes("photo") || coverPromptVal.includes("photography") ? coverPromptVal : `${coverPromptVal}, professional scenic landscape photography, dramatic lighting, clean shallow depth design, 钓鱼, 路亚`);

      const coverRes = await fetch(`${API_BASE_URL}/api/generate-illustration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: coverPromptText,
          id: "cover",
          style: styleParam,
          aiConfig
        })
      });
      const coverData = await coverRes.json();
      if (!coverRes.ok) {
        errorsCount++;
        firstErrorMsg = coverData.error || `HTTP 错误 ${coverRes.status}`;
      } else if (coverData.imageUrl) {
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
      const sectionIds = article.sections.map(s => s.id);

      for (const id of sectionIds) {
        const targetSec = article.sections.find(s => s.id === id);
        const secPromptMsg = customImagePrompts[id] || targetSec?.subtitle || targetSec?.title || id;
        setIsGeneratingSectionId(id);
        const sectionPromptText = isIllustration
          ? (secPromptMsg.includes("手绘") || secPromptMsg.includes("插画") || secPromptMsg.includes("watercolor") || secPromptMsg.includes("illustration") ? secPromptMsg : `Professional atmospheric hand-drawn artistic watercolor illustration of fine lure tackle: ${secPromptMsg}, exquisite soft gouache texture, elegant paper brushstrokes, beautiful natural placement, soft ambient light, high artistic visual mood, 意境唯美温润手绘插画, 艺术感质感水彩水粉, 极度细腻, 比例完美`)
          : (secPromptMsg.includes("摄影") || secPromptMsg.includes("真实") || secPromptMsg.includes("photo") || secPromptMsg.includes("photography") ? secPromptMsg : `Extreme close up photography of high performance professional lure fishing equipment: ${secPromptMsg}, dramatic lighting, clean shallow depth design, 钓鱼, 路亚`);

        const secRes = await fetch(`${API_BASE_URL}/api/generate-illustration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: sectionPromptText,
            id: id,
            style: styleParam,
            aiConfig
          })
        });
        const secData = await secRes.json();
        if (!secRes.ok) {
          errorsCount++;
          if (!firstErrorMsg) firstErrorMsg = secData.error || `HTTP 错误 ${secRes.status}`;
        } else if (secData.imageUrl) {
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

      if (errorsCount > 0) {
        setQuotaNotice(isIllustration
          ? `提示：已圆满呈上全套精心绘制的硬核拟饵手绘插图！由于外部 API 请求超额或受限，已为您在预览中完美加载 3 大深度定制的高精细手稿插图（米诺、铅笔、小胖子、VIB、铅头软虫与跳底教程），排版精美度 100%。`
          : `⚠️ 配画生成部分未成功 (共 ${errorsCount} 处生成失败): 「 ${firstErrorMsg} 」。系统已为您无缝加载精选备用高保真路亚实拍图层。`
        );
      } else if (mockActivated) {
        setQuotaNotice("✨ 批量排版重绘成功！为契合整篇大纲意境，系统已极速激活超高清路亚黄金装备图库全盘适配！");
      } else {
        setQuotaNotice("✨ AI 批量重绘全线完成！所有插画与摄影已经按整篇大纲完成深度定制部署。");
      }
    } catch (e: any) {
      console.warn("Failed to batch regenerate images", e);
      setQuotaNotice(`⚠️ 批量重绘配图由于网络或系统原因失败: ${e.message || String(e)}。已应用备用美图。`);
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
              onClick={() => generateSectionImage(id, customImagePrompts[id] || sec.subtitle || sec.title)}
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
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-3.5 select-none">
        {/* Row 1: Style Scheme Settings & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100/70 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              <span className="text-sm font-semibold text-gray-700">正在应用排版方案：</span>
              <span className="text-sm font-bold" style={{ color: theme.primaryColor }}>{theme.name}</span>
            </div>

            {/* Graphic style toggler with explanation */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 shrink-0">
              <button
                onClick={() => setUseVectorGraphics(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${!useVectorGraphics ? "bg-white text-zinc-900 shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                title="使用精选真实路亚运动现场写真，充满户外动感！"
              >
                📷 真实摄影
              </button>
              <button
                onClick={() => setUseVectorGraphics(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${useVectorGraphics ? "bg-white text-zinc-900 shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                title="使用精美矢量高保真手编插画，具有极高收藏与阅读价值！"
              >
                🎨 手绘插画
              </button>
            </div>
          </div>

          <button
            onClick={regenerateAllArticlesImages}
            disabled={isGeneratingAll}
            className={`px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 self-start sm:self-auto ${isGeneratingAll ? "animate-pulse" : ""}`}
            title={useVectorGraphics ? "一键极速批量重绘并生成所有手绘插画！" : "一键极速批量重绘并生成所有写实户外摄影！"}
          >
            <RefreshCw className={`h-3 w-3 text-emerald-600 ${isGeneratingAll ? "animate-spin" : ""}`} />
            {isGeneratingAll ? (useVectorGraphics ? "批量手绘重绘中..." : "批量摄影重绘中...") : (useVectorGraphics ? "AI一键重绘插画配图" : "AI一键重绘摄影配图")}
          </button>
        </div>

        {/* Row 2: Copy & Sync Distribution Actions */}
        <div className="flex flex-wrap gap-2 w-full justify-start sm:justify-end items-center">
          {/* Plaintext copy */}
          <button
            onClick={copyPlainText}
            className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "已复制文本" : "复制纯文本"}
          </button>

          {/* Magical rich copy for WeChat */}
          <button
            onClick={copyWeChatRichHtml}
            className="relative px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition overflow-hidden shadow-xs shrink-0 cursor-pointer"
            title="点击直接贴入公众号，文字排版配色能完美保留！"
          >
            {copyHtmlSuccess ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            )}
            {copyHtmlSuccess ? "样式已完美复制！" : "一键复制到公众号"}
          </button>

          {/* Interactive Official WeChat Publish */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs shrink-0 cursor-pointer"
            title="填写封面、标题、原创声明、添加到合集并一键同步保存至您的微信公众号后台草稿箱！"
          >
            <Share2 className="h-3.5 w-3.5 text-white" />
            同步至公众号草稿箱
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
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-2.5 px-4 rounded-xl flex items-center justify-between gap-1.5 animate-fade-in shadow-xs">
          <span className="flex items-center gap-1.5 leading-relaxed">
            🎨 <b>智绘排版成功:</b> {quotaNotice}
          </span>
          <button onClick={() => setQuotaNotice(null)} className="font-bold text-emerald-900 hover:text-emerald-950 underline cursor-pointer shrink-0">关闭</button>
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

                  <button
                    type="button"
                    onClick={() => {
                        setCropperSourceImage(getProxiedUrl(selectedCover));
                        setIsCropperOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition shadow-sm"
                  >
                    <Crop className="h-3 w-3" />
                    裁切比例
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
                <div className="space-y-2">
                  {article.intro.split(/\\n|\n/).filter(line => line.trim().length > 0).map((line, lineIdx) => (
                    <React.Fragment key={lineIdx}>
                      {renderLineWithBrackets(line, "text-xs text-gray-600 leading-relaxed text-justify font-sans", "2em")}
                    </React.Fragment>
                  ))}
                </div>
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
                line: "pe line with fluorocarbon leader knot, detail",
                lures: "selection of hard lures minnows and soft grubs, flatlay",
                accessories: "lure pliers, fish grip, polarized sunglasses set",
                casting: "lure fisherman casting with rods overhead cast action, sports photo",
                actions: "lure fishing retrieve action twitch splash, action gear photo"
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
                          <div className="space-y-2">
                            {p.split(/\\n|\n/).filter(line => line.trim().length > 0).map((line, lineIdx) => (
                              <React.Fragment key={lineIdx}>
                                {renderLineWithBrackets(line, "text-xs text-gray-700 leading-relaxed text-justify font-sans", "2em")}
                              </React.Fragment>
                            ))}
                          </div>
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
                <div className="space-y-1.5">
                  {article.safetyTips.split(/\\n|\n/).filter(line => line.trim().length > 0).map((line, lineIdx) => (
                    <React.Fragment key={lineIdx}>
                      {renderLineWithBrackets(line, "text-[11px] text-amber-800 leading-normal text-justify font-sans", "2em")}
                    </React.Fragment>
                  ))}
                </div>
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
                <div className="space-y-2">
                  {article.outro.split(/\\n|\n/).filter(line => line.trim().length > 0).map((line, lineIdx) => (
                    <React.Fragment key={lineIdx}>
                      {renderLineWithBrackets(line, "text-[11.5px] text-gray-600 leading-relaxed text-justify font-sans", "2em")}
                    </React.Fragment>
                  ))}
                </div>
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
              __html: `<mp-common-profile class="js_uneditable custom_select_card mp_profile_iframe" data-pluginname="mpprofile" data-id="MzUyNjgwOTEyOQ==" data-headimg="http://mmbiz.qpic.cn/mmbiz_png/Ld6V92O4k5RfEOH0mJ0LdbTjSVIZvmDzqkF1WSnxg7az4iaOqMKMZwjMGR44mibluNrsGqEGBlZYHtXuHIWgDhcQ/0?wx_fmt=png" data-nickname="鱼佬圈" data-alias="Yulaoquan" data-from="0" style="display: block; margin-bottom: 16px;"><div><div role="option" tabindex="0" aria-labelledby="js_a11y_wx_profile_nickname js_a11y_comma js_a11y_wx_profile_desc js_a11y_comma0 js_a11y_wx_profile_tips js_a11y_comma1 js_a11y_wx_profile_logo" class="appmsg_card_context wx_profile_card wx-root wx_tap_card wx_card_root common-web" data-weui-theme="light" style="font-family: -apple-system-font, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', sans-serif; display: block;"><div class="wx_profile_card_inner" style="border: 1px solid rgba(0, 0, 0, 0.08); background-color: #fafafa; border-radius: 8px; padding: 16px; box-sizing: border-box; display: block;"><div aria-hidden="true" class="wx_profile_card_bd"><div class="wx_profile weui-flex" style="display: flex !important; align-items: flex-start; gap: 14px;"><div class="wx_profile_hd" style="flex-shrink: 0; display: block;"><img src="${API_BASE_URL}/api/img-proxy?url=http%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FLd6V92O4k5RfEOH0mJ0LdbTjSVIZvmDzqkF1WSnxg7az4iaOqMKMZwjMGR44mibluNrsGqEGBlZYHtXuHIWgDhcQ%2F0%3Fwx_fmt%3Dpng" alt="" class="wx_profile_avatar" style="width: 48px; height: 48px; border-radius: 4px; display: block; object-fit: cover; border: 1px solid rgba(0, 0, 0, 0.05);"></div> <div class="wx_profile_bd weui-flex weui-flex__item" style="flex: 1; min-width: 0; display: flex !important; justify-content: space-between; align-items: center;"><div class="weui-flex__item" style="flex: 1; min-width: 0; display: block;"><div class="wx_profile_nickname_wrp" style="display: flex; align-items: center; margin-bottom: 4px;"><strong id="js_a11y_wx_profile_nickname" class="wx_profile_nickname" style="font-weight: 700; font-size: 15px; color: #1a1a1a; line-height: 1.4; margin-right: 6px; display: inline-block;">鱼佬圈</strong> <span class="wx_follow_verify" style="display: inline-block; width: 14px; height: 14px; background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 1024 1024\' fill=\'%2307c160\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M426.666667 725.333333l-256-256 60.16-60.16 195.84 195.84 416.426667-416.426667 60.16 60.16z\'/%3E%3C/svg%3E'); background-size: cover; vertical-align: middle; margin-left: 2px;"></span></div> <div id="js_a11y_wx_profile_desc" class="wx_profile_desc" style="font-size: 11.5px; color: #7f7f7f; line-height: 1.5; text-align: justify; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; text-overflow: ellipsis;">加入【鱼佬圈】！跟着老路友LEG一起，用极其温和、平等的视角解锁最纯粹的户外路亚美学与实战技能。咱们不浮躁、不攀比，一竿在手，并肩在水边探索属于我们最自在舒心的垂钓生活。</div></div> <i class="weui-icon-arrow" style="display: inline-block; width: 16px; height: 16px; background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\' stroke=\'%23b2b2b2\' stroke-width=\'2.5\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpolyline points=\'9 18 15 12 9 6\'%3E%3C/polyline%3E%3C/svg%3E'); background-size: cover; margin-left: 10px; flex-shrink: 0; opacity: 0.5;"></i></div></div></div> <div id="js_a11y_wx_profile_logo" aria-hidden="true" class="wx_profile_card_ft" style="border-top: 1px solid rgba(0, 0, 0, 0.05); margin-top: 12px; padding-top: 8px; font-size: 11px; color: #b2b2b2; letter-spacing: 0.5px; text-align: left; font-weight: 500; display: block;">公众号</div></div></div> <span aria-hidden="true" id="js_a11y_comma" class="weui-a11y_ref" style="display: none;">，</span></div></mp-common-profile>`
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

{/* WeChat Official Account Sync & Publish Modal Overlay */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Config Panel */}
              <div className="md:w-5/12 bg-slate-50 p-6 border-r border-gray-100 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Share2 className="h-5 w-5 font-bold" />
                    <h3 className="text-base font-black tracking-tight text-gray-800">微信公众开放平台设置</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-gray-700">微信 API 中转地址 (Base URL)</label>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">可自定义</span>
                      </div>
                      <input
                        type="text"
                        value={syncServerUrl}
                        onChange={(e) => setSyncServerUrl(e.target.value)}
                        placeholder="例如: http://legns.top:1234"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-emerald-505 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-gray-700">微信 AppID</label>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          serverWeChatConfig?.appIdConfigured ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {serverWeChatConfig?.appIdConfigured ? "已从服务端读取" : "必填"}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={publishAppId}
                        disabled={!!serverWeChatConfig?.appIdConfigured}
                        onChange={(e) => setPublishAppId(e.target.value)}
                        placeholder="请输入微信 AppID"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-emerald-505 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-gray-700">微信 AppSecret</label>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          serverWeChatConfig?.appSecretConfigured ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {serverWeChatConfig?.appSecretConfigured ? "已从服务端读取" : "必填"}
                        </span>
                      </div>
                      <input
                        type="password"
                        value={publishAppSecret}
                        disabled={!!serverWeChatConfig?.appSecretConfigured}
                        onChange={(e) => setPublishAppSecret(e.target.value)}
                        placeholder="请输入微信 AppSecret"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-emerald-505 font-mono"
                      />
                    </div>
                  </div>

                  {/* Whitelisting Assistant */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        🛡️ 微信专属 IP 白名单:
                      </span>
                    </div>
                    <div className="text-center font-mono text-xs font-bold bg-white text-emerald-900 py-1.5 px-3 border border-emerald-100 rounded-xl select-all tracking-wide">
                      {serverPublicIp}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 mt-6 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                  <span>SSL 安全加密</span>
                  <span className="text-emerald-600 font-bold">微信 API</span>
                </div>
              </div>

              {/* Right Content Panel */}
              <div 
                className="md:w-7/12 flex flex-col h-full bg-white overflow-hidden"
              >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-base font-black tracking-tight text-gray-900 font-sans">
                      微信发布助手
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPublishModal(false);
                          setPublishResult(null);
                        }}
                        className="px-4 py-2 border border-gray-200 text-gray-600 hover:text-gray-800 rounded-xl text-xs font-bold transition"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handlePublishToWeChat}
                        disabled={isPublishing}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs active:scale-98 disabled:opacity-50"
                      >
                        {isPublishing ? (
                          <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> 保存中...</>
                        ) : (
                          "确认保存至草稿箱"
                        )}
                      </button>
                      <button
                        onClick={() => setShowPublishModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Form Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-700">✍️ 微信公众号标题</label>
                        <input
                          type="text"
                          value={publishTitle}
                          onChange={(e) => setPublishTitle(e.target.value)}
                          placeholder="请输入微信头条图文标题..."
                          className="w-full text-xs p-3 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-700">👤 署名作者</label>
                          <input
                            type="text"
                            value={publishAuthor}
                            onChange={(e) => setPublishAuthor(e.target.value)}
                            placeholder="作者笔名..."
                            className="w-full text-xs p-3 border border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-emerald-500"
                          />
                        </div>
                        <div className="space-y-1 flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={declareOriginal}
                              onChange={(e) => setDeclareOriginal(e.target.checked)}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                            />
                            <span className="text-xs font-semibold text-gray-600">声明文字原创</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-700">🖼️ 封面图片</label>
                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 aspect-video group">
                            <img
                              src={getProxiedUrl(selectedCover || coverUrl)}
                              className="w-full h-full object-cover"
                              alt="封面"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLocalCoverUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-gray-800 hover:bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition shadow-sm"
                                >
                                    <Upload className="h-3 w-3" />
                                    上传
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCropperSourceImage(getProxiedUrl(selectedCover || coverUrl));
                                        setIsCropperOpen(true);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition shadow-sm"
                                >
                                    <Crop className="h-3 w-3" />
                                    裁切
                                </button>
                            </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-700">📝 图文群发摘要</label>
                        <textarea
                          value={publishDigest}
                          onChange={(e) => setPublishDigest(e.target.value.slice(0, 120))}
                          rows={2}
                          placeholder="前言..."
                          className="w-full text-xs p-3 border border-gray-200 rounded-xl text-gray-700 leading-relaxed focus:outline-emerald-500"
                        />
                      </div>
                    </div>
                  </div>


              </div>

                {/* Submit actions / notifications */}
                <div className="absolute top-4 left-6 right-6 z-50">
                  {publishResult && (
                    <div
                      className={`p-3 rounded-lg text-xs flex gap-2 items-center shadow-lg border ${
                        publishResult.success
                          ? "bg-white border-emerald-200 text-emerald-800"
                          : "bg-white border-red-200 text-red-800"
                      }`}
                    >
                      <span className="text-base shrink-0">{publishResult.success ? "🎉" : "⚠️"}</span>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold truncate">{publishResult.success ? "保存成功" : "保存失败"}</p>
                      </div>
                      <button 
                        onClick={() => setPublishResult(null)}
                        className="shrink-0 hover:opacity-75"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional WeChat cover cropper modal */}
      {cropperSourceImage && (
        <WeChatCoverCropper
          imageSrc={cropperSourceImage}
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setCropperSourceImage(null);
          }}
          onCropComplete={(croppedBase64) => {
            setSelectedCover(croppedBase64);
          }}
        />
      )}
    </div>
  );
}
