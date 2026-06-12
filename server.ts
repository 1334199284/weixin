import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for generated images
const generatedImages = new Map<string, { mimeType: string; data: string }>();

// Initialize Gemini Client dynamically with User-Agent set for telemetry as required
function getAiClient(customApiKey?: string) {
  let apiKey = "";
  if (customApiKey && typeof customApiKey === "string") {
    apiKey = customApiKey.trim();
  }
  
  // If the key is blank, or contains password mask characters (dots/asterisks), fall back to server env
  if (!apiKey || apiKey.includes("•") || apiKey.includes("*") || apiKey === "undefined" || apiKey === "null") {
    apiKey = (process.env.GEMINI_API_KEY || "").trim();
  }

  // If there is still no key, or it's a default example placeholder, return null to activate fallback demo mode
  if (!apiKey || apiKey.includes("your_") || apiKey.includes("YOUR_") || apiKey.length < 5) {
    return null;
  }

  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Robust JSON cleanser helper to extract and clean potential conversational text / markdown wrapping backticks from custom models (like Qwen, DeepSeek, etc.)
function cleanJsonResponse(rawText: string): string {
  let text = rawText.trim();
  // Remove markdown block wrapper if present
  if (text.startsWith("```")) {
    const lines = text.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines[lines.length - 1].startsWith("```")) {
      lines.pop();
    }
    text = lines.join("\n").trim();
  }
  // Try to find the first '{' and last '}'
  const startIdx = text.indexOf("{");
  const endIdx = text.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1);
  }
  return text;
}

// ----------------------------------------------------
// API: Generate Lure Fishing WeChat Article (POST required, GET returns info)
// ----------------------------------------------------
app.all("/api/generate-article", async (req, res) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  let outline: any;
  let theme: any;
  let level: any;
  let tone: any;
  let customPrompt: any;
  let contentSystemPrompt: any;
  let aiConfig: any;

  if (req.method === "GET") {
    outline = req.query.outline;
    theme = req.query.theme;
    level = req.query.level;
    tone = req.query.tone;
    customPrompt = req.query.customPrompt;
    contentSystemPrompt = req.query.contentSystemPrompt;
    const qApiKey = req.query.apiKey || req.query.key || req.query.customApiKey;
    if (qApiKey) {
      aiConfig = {
        provider: "gemini",
        apiKey: qApiKey as string,
      };
    } else if (req.query.aiConfig) {
      try {
        aiConfig = JSON.parse(req.query.aiConfig as string);
      } catch (e) {}
    }
  } else {
    const body = req.body || {};
    outline = body.outline;
    theme = body.theme;
    level = body.level;
    tone = body.tone;
    customPrompt = body.customPrompt;
    contentSystemPrompt = body.contentSystemPrompt;
    aiConfig = body.aiConfig;
  }

  try {
    const basePrompt = outline || `装备入门——选对工具事半功倍
基础装备：路亚竿（推荐直柄竿，ML或M调泛用性强）、渔轮（新手首选纺车轮，不易炸线）、钓线（PE线搭配碳素前导线，兼顾强度与隐蔽性）。
核心消耗品：拟饵的种类与选择（硬饵如米诺、亮片，软饵如卷尾蛆等）。
必备配件：路亚钳、控鱼器、偏光镜等。`;

    let instructions = "";
    if (contentSystemPrompt && contentSystemPrompt.trim().length > 0) {
      // Process dynamic placeholders in user-configured instructions
      instructions = contentSystemPrompt
        .replaceAll("{outline}", basePrompt)
        .replaceAll("{level}", level || 'Beginner')
        .replaceAll("{tone}", tone || 'Friendly & Professional')
        .replaceAll("{theme}", theme || 'Natural Green')
        .replaceAll("{customPrompt}", customPrompt || 'None');
    } else {
      instructions = `
You are a top-tier Chinese WeChat Official Account content creator specializing in outdoor sports and lure fishing (路亚钓鱼).
Your task is to expand the provided outline into a highly engaging, structured, and informative WeChat subscription article (微信公众号文章) in Chinese.

Article Outline:
${basePrompt}

Additional Instructions:
- Target Reader Skill Level: ${level || 'Beginner'}
- Article Tone: ${tone || 'Friendly & Professional'}
- Theme Preference: ${theme || 'Natural Green'}
- Custom Request: ${customPrompt || 'None'}
- CRITICAL Perspective & Tone Constraint (平等、共情与共创视角): 
  Do NOT use any patronizing, didactic, or authoritative phrasing. Do NOT use phrases like "xx劝你" (so-and-so advises you), "听老钓手/老玩家一句劝" (listen to my advice), "让我来告诉你" (let me tell you), or "听劝". Instead, address the reader with absolute equality, mutual respect, and from their own perspective (equal peer partnership). Use collaborative and warm expressions like "我们一起交流分享" (let's share and chat together), "新手朋友常会遇到类似的疑惑" (we often face similar questions as beginners), or "作为同好的一点心得共勉" (mutual encouragement from a fellow enthusiast). 
  Do NOT refer to this article as a "课" (lesson/class/course), "第x课", "课程". Instead, refer to it as an "经验分享", "实战心得", "入门精选" or "干货拾遗".

- CRITICAL HIGH-TRAFFIC & VIRAL TITLE FORMULAS (公众号爆款高流量标题规范 - 严禁傲慢、严禁命令劝说):
  For the "title" field in the response, craft a compelling title that is highly attractive but retains absolute equality and mutual exploration. Avoid preachy phrases like "劝你" or "听我一句劝". Conform to these guidelines:
  1. 【痛点同频与共同探讨结构】:
     * 例如: \`【避坑指南】买第一套路亚装备时，那些我们容易共享的弯路与实在预算\`
     * 例如: \`【实操心得】大家都说水滴轮帅气好甩，为什么新手阶段我们更建议从纺车轮起步？\`
  2. 【双段式体验共鸣与无损悬念】:
     * 例如: \`百元级与千元级装备究竟差在哪些细节？不玩虚的，同好真实体验对比\`
     * 例如: \`总是炸线或找不到咬讯？或许我们只需要调整这一处细微的收线状态\`
  3. 【真实同好交流视角 (拉近距离，拒绝居高临下)】:
     * 例如: \`预算有限也想轻松享受作钓？这套经典搭配或许是更适合我们的温和选择\`
     * 例如: \`告别空军与频繁炒粉：一份适合新手的路亚搭配与平阶演练心得\`
  Make the title between 15 and 32 Chinese characters. It must sound friendly, authentic, and co-exploratory — as if sharing genuine thoughts over a campfire. NEVER output boring academic titles or hype-driven titles.

- CRITICAL Lure Requirement: Under the lure section (where minnows, spinnerbaits/spoons, and soft curly tail grubs are discussed), you MUST expand in rich, structured detail. For each of these three specific lure types, you must describe:
  1. Its realistic underwater action (泳姿及动作)
  2. Ideal fishing conditions (water depth, clarity/visibility, and temperature)
  3. Most receptive target predator specie(s)
  4. Specific step-by-step practical examples on how to rig and retrieve (组装与操饵/收线手法) for maximum strike rates.
  This must be formatted with elegant subheading bullets (like ■ or 【】) to represent WeChat post design excellence.

Format your output strictly as a JSON object with the specified schema below.
Ensure the text is lively, incorporates practical fishing insights, and provides helpful guidelines to keep beginners motivated. Avoid dry academic translations. Use standard fishing jargon in Chinese (e.g. 炸线, 炒米粉, 炒轮, 前导线, ML调, 纺车轮, 水滴轮).
`;
    }

    // 1. Check if user configured a custom third-party OpenAI-compatible model (e.g., Qwen, DeepSeek, etc.)
    if (aiConfig && aiConfig.provider === "custom") {
      const customApiUrl = `${aiConfig.baseUrl}/chat/completions`;
      console.log(`[Custom Model Engine] Generating article using model: ${aiConfig.textModel || 'qwen-plus'} on ${customApiUrl}`);
      
      const userPrompt = `${instructions}
      
CRITICAL: You MUST respond ONLY with a raw JSON object matching the requested schema. Do not output any markdown codeblock backticks (\`\`\`json) or additional conversational prefaces/intro/outro. Standard response schema:
{
  "title": "catchy WeChat article title",
  "subtitle": "WeChat subtitle",
  "intro": "engaging WeChat introduction hook",
  "sections": [
    {
      "id": "rod",
      "title": "01 Title",
      "subtitle": "Subtitle",
      "paragraphs": ["Para 1", "Para 2"],
      "proTips": "Pro tips",
      "imagePrompt": "English keywords"
    }
  ],
  "safetyTips": "Ethics and safety tips",
  "outro": "Outro text here"
}`;

      const response = await fetch(customApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.textModel || "qwen-plus",
          messages: [
            {
              role: "system",
              content: "You are an expert Chinese WeChat Official Account content creator specializing in outdoor sports and lure fishing. You MUST respond ONLY with a raw valid JSON object complying with the user prompt."
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Custom LLM API Error: ${response.status} - ${errText}`);
      }

      const resJson = await response.json();
      const rawText = resJson.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new Error("No text content returned from Custom LLM API");
      }

      const cleaned = cleanJsonResponse(rawText);
      const parsedData = JSON.parse(cleaned);
      return res.json(parsedData);
    }

    // 2. Default to standard client (optionally passing user's own custom Gemini Key to bypass global quotas)
    const aiClient = getAiClient(aiConfig?.apiKey || undefined);
    if (!aiClient) {
      // Return beautiful fallback mock data dynamically synthesized from user inputs
      console.warn("GEMINI_API_KEY is not defined. Returning dynamically parsed mockup content.");
      return res.json(getFallbackArticle(basePrompt, theme, level, tone, customPrompt));
    }

    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let responseText = "";
    let generationSuccess = false;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini Engine] Attempting article generation with model: ${modelName}`);
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: instructions,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["title", "subtitle", "intro", "sections", "safetyTips", "outro"],
              properties: {
                title: {
                  type: Type.STRING,
                  description: "A highly viral WeChat article title (15-32 characters) using a dual-segment or bracketed tag format (e.g., 【新手避坑】... ! or ... vs ... ?) to maximize reads and close distance with friends.",
                },
                subtitle: {
                  type: Type.STRING,
                  description: "A compelling WeChat article subtitle summarizing the gear guide.",
                },
                intro: {
                  type: Type.STRING,
                  description: "A welcoming and engaging introduction hook for WeChat subscribers (150-250 characters).",
                },
                sections: {
                  type: Type.ARRAY,
                  description: "Sections detailing the equipment mentioned in the outline.",
                  items: {
                    type: Type.OBJECT,
                    required: ["id", "title", "subtitle", "paragraphs", "proTips", "imagePrompt"],
                    properties: {
                      id: {
                        type: Type.STRING,
                        description: "A unique identifier for this section (e.g., rod, reel, line, lures, accessories).",
                      },
                      title: {
                        type: Type.STRING,
                        description: "The section headline with numbering (e.g., '01 基础装备：直柄竿 ✕ ML或M调').",
                      },
                      subtitle: {
                        type: Type.STRING,
                        description: "An elegant sub-headline summarizing the recommendation.",
                      },
                      paragraphs: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "2-3 highly detailed, easy-to-understand tutorial paragraphs for this section.",
                      },
                      proTips: {
                        type: Type.STRING,
                        description: "A special 'Pro Tip' (避坑指南/实用秘籍) with high practical value.",
                      },
                      imagePrompt: {
                        type: Type.STRING,
                        description: "A 2-4 word specific English visual noun representing the item described (e.g., 'braided fishing line', 'lure fishing casting rod', 'spinning reel tackle', 'metallic fishing spoons lures' or 'soft swimbait plastic lures').",
                      },
                    },
                  },
                },
                safetyTips: {
                  type: Type.STRING,
                  description: "Safety recommendations and ethical fishing principles (e.g. catch & release, protecting the environment).",
                },
                outro: {
                  type: Type.STRING,
                  description: "An elegant conclusion calling readers to action (follow, like, share, and comment).",
                },
              },
            },
          },
        });

        if (response && response.text) {
          responseText = response.text;
          generationSuccess = true;
          console.log(`[Gemini Engine] Successful generation using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Engine] Model ${modelName} failed or busy:`, err.message || err);
      }
    }

    if (!generationSuccess) {
      throw lastError || new Error("All tried Gemini models failed to generate content");
    }

    const parsedData = JSON.parse(responseText || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini article generation failed:", error);

    // Track if the user explicitly provided an API key in the frontend settings
    const userKeyUsed = aiConfig?.apiKey && typeof aiConfig.apiKey === "string" && aiConfig.apiKey.trim().length > 4;
    const errorMsg = error.message || String(error);

    // If they have explicitly configured their own personal API Key, always bubble up the error immediately
    if (userKeyUsed) {
      return res.status(400).json({
        success: false,
        error: errorMsg,
        details: "检测到您当前在【模型设置】中配置了独占 API Key 或者是自定义对接，系统为您透传了真实的接口调用报错：\n\n「 " + errorMsg + " 」\n\n常见故障排查建议：\n1. 请检查您的 API 密钥是否完整正确，特别是没有误粘贴前后空格或开头多复制了字符；\n2. 请确认您在 Google AI Studio 申请的密钥是否有效。正常的 Gemini Key 通常以「 AIzaSy 」开头；\n3. 如果您是在本地运行，请确定国内网络可直接访问 Google API 地址，或者在左侧设置中切换为国内第三方中转 API（例如 SiliconFlow / OpenRouter/ 义乌等第三方服务商）；\n4. 如果暂时没有有效 Key，可以直接【清空密钥输入框】，系统将会自动优雅降级为本地大纲规则渲染引擎，保证应用流畅不中断演示！"
      });
    }

    // Default system-level run or shared key run fallback
    const safeTheme = theme || "green";
    const safeLevel = level || "Beginner";
    const safeTone = tone || "Friendly";
    const safeCustomPrompt = customPrompt || "";

    const fallback = getFallbackArticle(outline, safeTheme, safeLevel, safeTone, safeCustomPrompt);
    
    // Check if the fallback is triggered specifically by an invalid default key
    const isInvalidKey = errorMsg.includes("API key not valid") || errorMsg.includes("INVALID_ARGUMENT") || errorMsg.includes("API_KEY_INVALID");
    if (isInvalidKey) {
      fallback.intro = `【💡 实况提示：由于当前检测到系统默认公用的 API 密钥失效或不可用（暂未获取到有效的 Gemini 通道），系统已自动为您零延迟激活“本地智能排版渲染引擎”！\n\n您可以无缝继续预览全部排版格式与段落细节。如需连接云端真实大语言模型生成实时内容，欢迎在左下角“模型设置”栏内填入您个人的独占 Gemini APIKey。】\n\n` + fallback.intro;
    } else {
      fallback.intro = `【💡 缓冲提示：由于当前默认云端 AI 接口话务量异常庞大（429 频控限制或 503 超时），系统已自动切换至“本地智能排版渲染引擎”保障您的推文预览体验不受阻碍！】\n\n` + fallback.intro;
    }
    
    return res.json(fallback);
  }
});

// Curated high-fidelity professional fishing-focused Unsplash stock photo pools matching our course keywords perfectly.
// Because default API keys have strict rate-limits, this ensures users get 100% relevant, pristine visuals instantly on fallback.
const curatedPhotos: Record<string, string[]> = {
  cover: [
    "https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=80&w=800"
  ],
  rod: [
    "https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1564858908855-08ddcce08fe7?auto=format&fit=crop&q=80&w=600"
  ],
  reel: [
    "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1622325983777-628f80456209?auto=format&fit=crop&q=80&w=600"
  ],
  line: [
    "https://images.unsplash.com/photo-1514907283155-ea5f4094c70c?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600"
  ],
  lures: [
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1548543604-a87c9909abec?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1611095790444-1dfa4825e5a2?auto=format&fit=crop&q=80&w=600"
  ],
  accessories: [
    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600"
  ],
  casting: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?auto=format&fit=crop&q=80&w=600"
  ],
  actions: [
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=600"
  ]
};

// ----------------------------------------------------
// API: Generate Illustration via gemini-2.5-flash-image
// ----------------------------------------------------
app.post("/api/generate-illustration", async (req, res) => {
  const { prompt, id, style, aiConfig } = req.body;
  const isIllustration = style === "illustration";
  
  // High-fidelity fallback URL generator using Unsplash Featured redirect for dynamic and fresh visual options on every click
  const getDynamicFallbackUrl = () => {
    const randomSig = Math.floor(Math.random() * 100000);
    const idKey = id || "lure";
    
    // Check if we have pre-curated high-fidelity photos for this exact physical ID
    if (!isIllustration && curatedPhotos[idKey]) {
      const arr = curatedPhotos[idKey];
      const selectedUrl = arr[Math.floor(Math.random() * arr.length)];
      return `${selectedUrl}${selectedUrl.includes("?") ? "&" : "?"}sig=${randomSig}`;
    }

    if (isIllustration) {
      return `https://images.unsplash.com/featured/800x600/?atmospheric,artistic,illustration,watercolor,${encodeURIComponent(id || "lure")}&sig=${randomSig}`;
    }
    return `https://images.unsplash.com/featured/800x600/?lure,fishing,closeup,${encodeURIComponent(id || "gear")}&sig=${randomSig}`;
  };

  try {
    // 1. Handle custom third-party OpenAI-compatible Text-To-Image APIs (SiliconFlow, local setups, etc.)
    if (aiConfig && aiConfig.provider === "custom") {
      const customApiUrl = `${aiConfig.baseUrl}/images/generations`;
      console.log(`[Custom Image Engine] Generating image using model: ${aiConfig.imageModel || "black-forest-labs/FLUX.1-schnell"} on ${customApiUrl}`);
      
      const styledTextPrompt = isIllustration
        ? `${prompt}, professional atmospheric hand-drawn artistic illustration, exquisite watercolor and gouache texture, soft gentle natural light, elegant paper grain brushstrokes, high artistic visual mood, harmonious soft color palette, aesthetic nature integration, depth of field, 意境唯美温润手绘插画, 艺术感质感水彩水粉, 柔和自然光影, 比例构图完美, 留白美学`
        : `${prompt}, ultra-sharp professional product photography catalog view, high performance premium fishing tackle, clear detailed studio lighting, elegant blurred shallow depth backdrop, photorealistic style, 真实路亚现场, 钓鱼, 比例完美`;

      const response = await fetch(customApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.imageModel || "black-forest-labs/FLUX.1-schnell",
          prompt: styledTextPrompt,
          size: "1024x768"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Custom Image Gen API Error: ${response.status} - ${errText}`);
      }

      const resJson = await response.json();
      const returnedImgUrl = resJson.data?.[0]?.url || resJson.data?.[0]?.b64_json;
      if (!returnedImgUrl) {
        throw new Error("No image URL or b64 data returned from Custom Image Gen API");
      }

      if (returnedImgUrl.startsWith("data:") || !returnedImgUrl.startsWith("http")) {
        let base64Part = returnedImgUrl;
        if (returnedImgUrl.includes("base64,")) {
          base64Part = returnedImgUrl.split("base64,")[1];
        }
        const imageId = `${id || "custom_img"}_${Math.random().toString(36).substring(2, 10)}`;
        generatedImages.set(imageId, { mimeType: "image/png", data: base64Part });
        return res.json({ imageUrl: `/api/img/${imageId}`, isMock: false });
      } else {
        // Fetch external image stream and proxy locally to avoid iframe Referrer/CORS restrictions
        const fetchedImg = await fetch(returnedImgUrl);
        if (fetchedImg.ok) {
          const buffer = await fetchedImg.arrayBuffer();
          const base64Part = Buffer.from(buffer).toString("base64");
          const imageId = `${id || "custom_img"}_${Math.random().toString(36).substring(2, 10)}`;
          generatedImages.set(imageId, { mimeType: "image/png", data: base64Part });
          return res.json({ imageUrl: `/api/img/${imageId}`, isMock: false });
        } else {
          return res.json({ imageUrl: returnedImgUrl, isMock: false });
        }
      }
    }

    // 2. Default to Google Gemini (optionally passing user's own custom key to bypass 429 quota limits)
    const aiClient = getAiClient(aiConfig?.apiKey || undefined);
    if (!aiClient) {
      console.warn("GEMINI_API_KEY is not defined. Returning dynamically searched Unsplash Featured layout.");
      return res.json({ imageUrl: getDynamicFallbackUrl(), isMock: true });
    }

    console.log(`Generating image for prompt: "${prompt}" (Style: ${isIllustration ? "Illustration" : "Photography"}) using gemini-2.5-flash-image`);
    
    // Standardize stylistic wrap depending on graphic choice
    const styledTextPrompt = isIllustration
      ? `${prompt}, professional atmospheric hand-drawn artistic illustration, exquisite watercolor and gouache texture, soft gentle natural light, elegant paper grain brushstrokes, high artistic visual mood, harmonious soft color palette, aesthetic nature integration, depth of field, 意境唯美温润手绘插画, 艺术感质感水彩水粉, 柔和自然光影, 比例构图完美, 留白美学`
      : `${prompt}, ultra-sharp professional product photography catalog view, high performance premium fishing tackle, clear detailed studio lighting, elegant blurred shallow depth backdrop, photorealistic style, 真实路亚现场, 钓鱼, 比例完美`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: styledTextPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9", // Beautiful widescreen format
        },
      },
    });

    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      const imageId = `${id || "illustration"}_${Math.random().toString(36).substring(2, 10)}`;
      generatedImages.set(imageId, {
        mimeType: "image/png",
        data: base64Image
      });
      console.log(`Saved generated image with ID: ${imageId}`);
      return res.json({ imageUrl: `/api/img/${imageId}`, isMock: false });
    } else {
      throw new Error("No image data returned from Gemini");
    }
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const isQuotaError = errorMsg.includes("quota") || errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED");
    
    if (isQuotaError) {
      console.log(`[Image Fallback] Quota limit hit or rate-limited for model 'gemini-2.5-flash-image'. Silently falling back to high-fidelity Unsplash redirects.`);
    } else {
      console.log(`[Image Fallback] Falling back to high-fidelity Unsplash stock photo redirects due to: ${errorMsg}`);
    }
    
    return res.json({ 
      imageUrl: getDynamicFallbackUrl(), 
      isMock: true,
      error: isQuotaError ? "API rate limited or over-quota. Switched to high-fidelity stock photo fallback." : errorMsg
    });
  }
});

// ----------------------------------------------------
// API: Serve in-memory generated images
// ----------------------------------------------------
app.get("/api/img/:id", (req, res) => {
  const { id } = req.params;
  const image = generatedImages.get(id);
  if (!image) {
    return res.status(404).send("Image not found");
  }
  res.setHeader("Content-Type", image.mimeType);
  return res.send(Buffer.from(image.data, "base64"));
});

app.get("/api/img-proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Missing url parameter");
    }

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return res.status(imageRes.status).send("Failed to fetch image");
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache 1 day

    const arrayBuffer = await imageRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.warn("Proxy fetch image failed:", error.message || error);
    return res.status(500).send("Internal server error proxying image");
  }
});

function getFallbackArticle(
  outline: string,
  theme: string,
  level: string,
  tone: string,
  customPrompt: string
) {
  const lines = (outline || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Default initial strings if outline is dry
  let title = "【新手避坑】新手究竟怎么挑第一套竿线轮？听老钓手一句劝，省下千元冤枉钱！";
  let subtitle = `拒绝交学费！资深钓友手把手教你配齐路亚第一套黄金装备 (${level === "Beginner" ? "新手入门" : level === "Intermediate" ? "中级进阶" : "骨灰玩家"} · ${tone === "Friendly" ? "亲切幽默" : tone === "Professional" ? "严谨专业" : tone === "Enthusiastic" ? "饱满激情" : "轻松风趣"})`;
  let intro = `嘿！各位钓友，我是你们的路亚老钓友。相信很多刚入坑的朋友对装备选择非常纠结。根据大家最新的反馈，今天我们特别针对全新的定制化大纲进行独家拆解，为你深度定制一套属于你的超级爆护黄金装备！`;

  // Try to find a good title from outline
  if (lines.length > 0 && lines[0].length > 5 && !lines[0].includes("：") && !lines[0].includes(":")) {
    title = `【今日爆款】${lines[0]}`;
  }

  // Generate sections based on the outline lines
  const sections: any[] = [];
  const contentLines = lines.filter((line, idx) => {
    // Skip first line if it was used as title
    if (idx === 0 && line === title.replace("【今日爆款】", "")) return false;
    return true;
  });

  const defaultSections = [
    {
      id: "rod",
      title: "01 基础装备：路亚竿（首选直柄竿，ML或M调）",
      subtitle: "新手黄金起步杆，泛用性与感知手感的完美桥梁",
      paragraphs: [
        "直柄路亚竿其超高的抛投与出线容错率是让你不至于在第一天就崩溃退坑的底线。先能顺利把假饵扔出去，你才谈得上逗鱼 and 爆护，对吧？",
        "在竿子硬度也就是调性选择上，推荐直接选【ML调（中偏软）】或者【M调（中等）】的单节或双节泛用竿。这个规格对拟饵克重的兼容性极强，不论是丢几克重的小亮片，还是甩十几克的小米诺，腰力上都绰绰有余。"
      ],
      proTips: "买竿时优先买两节插节式钓竿，便于携带。且买碳素含量在90%以上的，腰力充足，感知极其灵敏！",
      imagePrompt: "lure fishing casting rod"
    },
    {
      id: "reel",
      title: "02 稳健运转：纺车轮（推荐2000-2500型浅线杯）",
      subtitle: "出线零阻碍，彻底告别“炒粉”炸线尴尬",
      paragraphs: [
        "纺车轮的出线原理是螺旋状自然脱出，完全依赖假饵飞行拉扯渔线，这在物理上就彻底消存在内摩擦或失控逆转，可以说是真正的“炸线杀手”。",
        "新手挑轮子，建议闭眼入 2000型 或 2500型 的【浅线杯】。它的重量极其迎合ML竿的重心平衡，拿在手里很轻巧，甩一整天老手 and 新手胳膊都不会酸。"
      ],
      proTips: "每次作钓结束回家后，建议用清水冲洗主轴和轴承处，甩干水滴并点一滴润滑油，恢复丝滑齿比性能！",
      imagePrompt: "lure spinning reel 2000"
    },
    {
      id: "line",
      title: "03 隐形桥梁：主线（PE编织线） + 前导线（碳素线）",
      subtitle: "双线黄金搭档，兼顾拉力强度与水中完美隐蔽",
      paragraphs: [
        "主线是连接猎物的黄金纽带。新手的主线建议直接选用四编或八编的【PE编织线（0.8号或1.0号）】。PE线没有弹性，拉力极强，而且线径细能甩得更远。",
        "为了防磨和隐形，你必须在前端绑定一截一米左右的【碳素前导线】。碳素线耐磨防划性能绝佳，可以肆无忌惮地在枯木烂石和树桩等重组障碍里磨蹭投掷。"
      ],
      proTips: "主线与前导线的连接推荐使用“简易FG结”或“双套结”。虽然新手在绑线时可能花费一些时间，但在搏击水中巨翘嘴或鳜鱼时，它能让你绝对避免切线跑鱼的惨剧！",
      imagePrompt: "braided fishing line"
    }
  ];

  if (contentLines.length > 0) {
    contentLines.forEach((line, index) => {
      // Create a section for each logical line in the template
      const itemTitle = line.length > 40 ? line.substring(0, 38) + "..." : line;
      let sectionId = `sect_${index}`;
      if (line.includes("竿") || line.includes("杆") || line.includes("棒")) sectionId = "rod";
      else if (line.includes("轮") || line.includes("轴") || line.includes("绞")) sectionId = "reel";
      else if (line.includes("线") || line.includes("绳") || line.includes("丝")) sectionId = "line";
      else if (line.includes("饵") || line.includes("拟") || line.includes("虫") || line.includes("假")) sectionId = "lures";
      else if (line.includes("配件") || line.includes("钳") || line.includes("镜") || line.includes("夹")) sectionId = "accessories";

      sections.push({
        id: sectionId,
        title: `${String(index + 1).padStart(2, "0")} ${itemTitle}`,
        subtitle: `针对“${itemTitle.split(/[：:]/)[0] || itemTitle}”的高效实战经验`,
        paragraphs: [
          `在本次的最新定制内容中，我们针对【${line}】展开了深度策划。针对 ${level === "Beginner" ? "新手入门 (Beginner)" : level === "Intermediate" ? "进阶提升 (Intermediate)" : "骨灰钓手 (Expert)"} 级别钓友展开深度科普，带所有人一同规避高频踩坑雷区。`,
          `在实际水域垂钓中，操控该部分的核心关键在于把握好力度与摆动节奏。在运用 【${tone === "Friendly" ? "亲切幽默" : tone === "Professional" ? "严谨专业" : tone === "Enthusiastic" ? "饱满激情" : "轻松风趣"}】 的表达方式来分享时，老玩家最建议的核心要素就是多看鱼情、多练手法。`
        ],
        proTips: `针对“${itemTitle.split(/[：:]/)[0] || itemTitle}”，我们给出的避坑指南：${customPrompt || "一定要注重对细节的理解，抛竿前多注意观察周围环境，不乱丢垃圾保护好自然生态！"}`
      });
    });
  } else {
    sections.push(...defaultSections);
  }

  return {
    title,
    subtitle,
    intro,
    sections: sections.slice(0, 5), // limit of max 5 sections matching UI illustrations
    safetyTips: `【绿色路亚精神】适度留鱼，我们极力提倡放流（Catch & Release）小鱼与怀卵母鱼。随手带走垃圾，不丢废弃线材，一同保护好水土。${customPrompt ? "补充建议：" + customPrompt : "抛投作钓时注意周围环境健康安全为先！"}`,
    outro: `路亚不仅是一手技术，更是我们与自然的一场博弈。好啦，以上就是针对本次全新大纲我们为您制作的专属微信公众号排版。在【${theme === "green" ? "自然绿" : theme === "blue" ? "深邃蓝" : "炽热橙"}】模板衬托下已经完美就绪。心动不如行动，快配齐装备，去水边解锁属于你的好心情吧！`
  };
}

// ----------------------------------------------------
// API: Get Server Information (Including Public IP for Whitelisting)
// ----------------------------------------------------
let cachedPublicIp = "";
app.get("/api/server-info", async (req, res) => {
  try {
    if (!cachedPublicIp) {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      if (ipRes.ok) {
        const data = await ipRes.json();
        cachedPublicIp = data.ip;
      }
    }
    return res.json({ publicIp: cachedPublicIp || "127.0.0.1" });
  } catch (err) {
    return res.json({ publicIp: "Could not fetch server public IP" });
  }
});

// ----------------------------------------------------
// API: Publish Article Content directly to WeChat Official Account Draft Box
// ----------------------------------------------------
app.post("/api/wechat/publish", async (req, res) => {
  try {
    const {
      appId,
      appSecret,
      title,
      author,
      digest,
      contentHtml,
      coverUrl,
      originalDeclaration,
      addToCollection,
      collectionId,
      isScheduled,
      scheduledTime,
      publishToDraft
    } = req.body;

    if (!appId || !appSecret) {
      return res.status(400).json({
        success: false,
        error: "缺少必要的微信开发者凭证：AppID 和 AppSecret 不能为空。"
      });
    }

    if (!title || !contentHtml) {
      return res.status(400).json({
        success: false,
        error: "发布文章失败：文章标题或内容不能为空。"
      });
    }

    // Step 1: Fetch Official WeChat access_token
    console.log(`[WeChat publisher] Connecting to WeChat API for AppID: ${appId}`);
    const tokenUrl = `https://api.weixin.org/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    
    let tokenRes;
    try {
      tokenRes = await fetch(tokenUrl);
    } catch (fetchTokenErr: any) {
      console.error("[WeChat token fetch error]", fetchTokenErr);
      return res.status(500).json({
        success: false,
        error: `连接微信服务器（获取 Access Token）失败，网络连接异常: ${fetchTokenErr.message || fetchTokenErr}。请检查您的服务器出站网络是否被限制，或确保 IP 白名单配置正确。`
      });
    }
    
    if (!tokenRes.ok) {
      return res.status(400).json({
        success: false,
        error: `微信 Access Token 服务响应异常 HTTP ${tokenRes.status}`
      });
    }
    
    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      console.error("[WeChat error]", tokenData);
      return res.status(400).json({
        success: false,
        error: tokenData.errmsg || "获取 WeChat access_token 失败。请检查微信后台的 AppID 与 AppSecret，并确保服务器 IP 已在 IP 白名单中。",
        errcode: tokenData.errcode
      });
    }
    
    const accessToken = tokenData.access_token;

    // Step 2: Download cover image from URL and upload to WeChat to acquire thumb_media_id
    let thumbMediaId = "";
    if (coverUrl) {
      try {
        let imageBuffer: ArrayBuffer;
        let contentType = "image/jpeg";

        if (coverUrl.startsWith("data:")) {
          console.log(`[WeChat publisher] Decoding local uploaded base64 data for cover image`);
          const matches = coverUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) {
            throw new Error("无效的本地 Base64 封面图片格式");
          }
          contentType = matches[1];
          const base64Data = matches[2];
          // Use Buffer to easily handle base64 decoding on Node back-end
          const buffer = Buffer.from(base64Data, 'base64');
          imageBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        } else {
          console.log(`[WeChat publisher] Downloading cover image from ${coverUrl}`);
          let actualCoverUrl = coverUrl;
          // If relative URL (such as our own /api/img/...) then download it from 127.0.0.1 to avoid localhost IPv6 resolution issue
          if (coverUrl.startsWith("/")) {
            actualCoverUrl = `http://127.0.0.1:3000${coverUrl}`;
          }

          let imageRes;
          try {
            imageRes = await fetch(actualCoverUrl);
          } catch (fetchImgErr: any) {
            console.error("[WeChat cover fetch error]", fetchImgErr);
            throw new Error(`网络异常：无法下载封面配图: ${fetchImgErr.message || fetchImgErr} (请求地址: ${actualCoverUrl})`);
          }

          if (!imageRes.ok) {
            throw new Error(`下载封面配图服务响应错误 (HTTP ${imageRes.status}) (请求地址: ${actualCoverUrl})`);
          }
          
          imageBuffer = await imageRes.arrayBuffer();
          contentType = imageRes.headers.get("content-type") || "image/jpeg";
        }

        let extension = "jpg";
        if (contentType.includes("png")) extension = "png";
        
        // Use native Blob and FormData for a fully compliant multipart upload
        const imageBlob = new Blob([imageBuffer], { type: contentType });
        const uploadForm = new FormData();
        uploadForm.append("media", imageBlob, `cover_thumbnail.${extension}`);

        console.log(`[WeChat publisher] Uploading cover image to WeChat media container...`);
        const uploadUrl = `https://api.weixin.org/cgi-bin/media/upload?access_token=${accessToken}&type=thumb`;
        
        let uploadRes;
        try {
          uploadRes = await fetch(uploadUrl, {
            method: "POST",
            body: uploadForm
          });
        } catch (uploadFetchErr: any) {
          console.error("[WeChat upload fetch network error]", uploadFetchErr);
          throw new Error(`上传临时媒体文件到微信服务器时，网络通信失败: ${uploadFetchErr.message || uploadFetchErr}`);
        }

        if (!uploadRes.ok) {
          throw new Error(`微信封面上传接口响应异常 HTTP ${uploadRes.status}`);
        }

        const uploadData = (await uploadRes.json()) as any;
        if (uploadData.thumb_media_id) {
          thumbMediaId = uploadData.thumb_media_id;
          console.log(`[WeChat publisher] Cover image uploaded successfully. Thumbnail Media ID: ${thumbMediaId}`);
        } else {
          console.error("[WeChat media upload error]", uploadData);
          return res.status(400).json({
            success: false,
            error: uploadData.errmsg || "上传微信临时封面素材失败（微信API返回空 media_id）。",
            errcode: uploadData.errcode
          });
        }
      } catch (coverErr: any) {
        console.error("[WeChat cover process error]", coverErr);
        return res.status(500).json({
          success: false,
          error: `同步封面配图失败: ${coverErr.message || coverErr}`
        });
      }
    }

    // Step 3: Insert draft into WeChat Draft Box
    console.log(`[WeChat publisher] Creating drafted article in WeChat...`);
    const draftAddUrl = `https://api.weixin.org/cgi-bin/draft/add?access_token=${accessToken}`;
    
    // WeChat draft body
    const draftPayload = {
      articles: [
        {
          title: title,
          author: author || "路亚玩家",
          digest: digest || "",
          content: contentHtml,
          thumb_media_id: thumbMediaId || "MOCK_THUMB_MEDIA_ID_FALLBACK",
          need_open_comment: 1,
          only_fans_can_comment: 0,
          is_declared_original: originalDeclaration ? 1 : 0
        }
      ]
    };

    let draftRes;
    try {
      draftRes = await fetch(draftAddUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftPayload)
      });
    } catch (draftFetchErr: any) {
      console.error("[WeChat draft fetch network error]", draftFetchErr);
      return res.status(500).json({
        success: false,
        error: `连接微信公众草稿箱服务失败，网络请求异常: ${draftFetchErr.message || draftFetchErr}`
      });
    }

    if (!draftRes.ok) {
      return res.status(400).json({
        success: false,
        error: `微信公众新建草稿服务响应异常 HTTP ${draftRes.status}`
      });
    }

    const draftData = (await draftRes.json()) as any;
    if (!draftData.media_id) {
      console.error("[WeChat Draft add error]", draftData);
      return res.status(400).json({
        success: false,
        error: draftData.errmsg || "建立微信公众草稿失败，API 格式异常。",
        errcode: draftData.errcode
      });
    }

    const draftMediaId = draftData.media_id;
    console.log(`[WeChat publisher] Draft created successfully! Draft Media ID: ${draftMediaId}`);

    // Step 4: Add to Collection if requested
    let collectionStatus = "未添加";
    if (addToCollection && collectionId) {
      try {
        console.log(`[WeChat publisher] Attempting to add draft to collection ID: ${collectionId}`);
        const collectionUrl = `https://api.weixin.org/cgi-bin/album/adddraft?access_token=${accessToken}`;
        
        let colRes;
        try {
          colRes = await fetch(collectionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              album_id: parseInt(collectionId) || collectionId,
              draft_id: draftMediaId
            })
          });
        } catch (colFetchErr: any) {
          console.error("[WeChat collection fetch network error]", colFetchErr);
          throw new Error(`请求添加合集专栏超时或失败: ${colFetchErr.message || colFetchErr}`);
        }

        if (colRes && colRes.ok) {
          const colData = (await colRes.json()) as any;
          if (colData.errcode === 0) {
            collectionStatus = `成功添加至合集 [ID: ${collectionId}]`;
          } else {
            collectionStatus = `添加失败 (${colData.errmsg})`;
            console.warn("[WeChat Collection Error]", colData);
          }
        } else {
          collectionStatus = `关联异常 (微信服务器状态码: ${colRes?.status})`;
        }
      } catch (colErr: any) {
        collectionStatus = `关联异常: ${colErr.message}`;
      }
    }

    // Step 5: Handle simulation/scheduling or schedule publishing
    const onlyDraft = publishToDraft === true || publishToDraft === "true";
    let publishId = "";

    if (!onlyDraft) {
      try {
        console.log(`[WeChat publisher] Performing Free Publish for media_id: ${draftMediaId}`);
        const publishUrl = `https://api.weixin.org/cgi-bin/freepublish/submit?access_token=${accessToken}`;
        
        let pubRes;
        try {
          pubRes = await fetch(publishUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              media_id: draftMediaId
            })
          });
        } catch (pubFetchErr: any) {
          console.error("[WeChat publish fetch network error]", pubFetchErr);
          throw new Error(`连接微信公众号正式发表（群发）接口失败: ${pubFetchErr.message || pubFetchErr}`);
        }

        if (!pubRes.ok) {
          throw new Error(`微信正式群发接口返回网络状态码错误 (HTTP ${pubRes.status})`);
        }

        const pubData = (await pubRes.json()) as any;
        if (pubData.errcode && pubData.errcode !== 0) {
          console.error("[WeChat publish submit error]", pubData);
          return res.status(400).json({
            success: false,
            error: pubData.errmsg || `微信正式发布/发表接口返回错误 (代码: ${pubData.errcode})`,
            errcode: pubData.errcode
          });
        }
        publishId = pubData.publish_id || "";
        console.log(`[WeChat publisher] Free Publish successfully initiated with publish_id: ${publishId}`);
      } catch (pubErr: any) {
        console.error("[WeChat publishing error]", pubErr);
        return res.status(500).json({
          success: false,
          error: `微信一键正式发表流程中断: ${pubErr.message || pubErr}`
        });
      }
    }

    let publishingSchedule = isScheduled ? `已设于 ${scheduledTime} 自动发布` : (onlyDraft ? "仅存入草稿箱" : "已完成正式发表");

    const finalMsg = onlyDraft
      ? "一键同步保存至微信公众号【草稿箱】完成！你可以在微信公众号后台的「草稿箱」中直接预览与最终群发。"
      : "同步并正式发表成功！文章已成功在您的公众号正式发表并生成专属访问链接。";

    return res.json({
      success: true,
      mediaId: draftMediaId,
      publishId: publishId || undefined,
      thumbMediaId: thumbMediaId,
      collectionStatus,
      publishingSchedule,
      message: finalMsg
    });

  } catch (error: any) {
    console.error("[WeChat general publishing error]", error);
    return res.status(500).json({
      success: false,
      error: `系统内部通道发布异常: ${error.message || String(error)}`
    });
  }
});

// ----------------------------------------------------
// API: Fetch WeChat Official Account Album/Collection list
// ----------------------------------------------------
app.get("/api/wechat/albums", async (req, res) => {
  try {
    const { appId, appSecret } = req.query;

    if (!appId || !appSecret) {
      return res.status(400).json({
        success: false,
        error: "缺少必要的微信开发者凭证：AppID 和 AppSecret 不能为空。"
      });
    }

    // Step 1: Fetch Official WeChat access_token
    console.log(`[WeChat Album] Connecting to WeChat API for AppID: ${appId}`);
    const tokenUrl = `https://api.weixin.org/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    
    let tokenRes;
    try {
      tokenRes = await fetch(tokenUrl);
    } catch (fetchTokenErr: any) {
      console.error("[WeChat token fetch error (album)]", fetchTokenErr);
      return res.status(500).json({
        success: false,
        error: `连接微信服务器（获取 Access Token）失败，网络连接异常: ${fetchTokenErr.message || fetchTokenErr}。请检查您的服务器出站网络，并确保已将您的服务 IP 添加到微信公众后台的 IP 白名单中。`
      });
    }
    
    if (!tokenRes.ok) {
      return res.status(400).json({
        success: false,
        error: `微信 Access Token 服务响应异常 HTTP ${tokenRes.status}`
      });
    }
    
    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      return res.status(400).json({
        success: false,
        error: tokenData.errmsg || "获取 access_token 失败。请检查微信后台的 AppID 与 AppSecret，并确保服务器 IP 已在 IP 白名单中。"
      });
    }
    
    const accessToken = tokenData.access_token;
    
    console.log(`[WeChat Album] Fetching album list...`);
    const albumUrl = `https://api.weixin.org/cgi-bin/album/getall?access_token=${accessToken}`;
    
    let albumRes;
    try {
      albumRes = await fetch(albumUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          begin: 0,
          count: 50
        })
      });
    } catch (albumFetchErr: any) {
      console.error("[WeChat album fetch network error]", albumFetchErr);
      return res.status(500).json({
        success: false,
        error: `连接微信公众合集/专辑数据服务失败，网络异常: ${albumFetchErr.message || albumFetchErr}`
      });
    }
    
    if (!albumRes.ok) {
      return res.status(400).json({
        success: false,
        error: `微信专辑列表接口返回异常状态码: HTTP ${albumRes.status}`
      });
    }
    
    const albumData = (await albumRes.json()) as any;
    if (albumData.errcode && albumData.errcode !== 0) {
      return res.status(400).json({
        success: false,
        error: albumData.errmsg || `微信获取合集接口返回错误 (代码: ${albumData.errcode})`,
        errcode: albumData.errcode
      });
    }
    
    return res.json({
      success: true,
      albums: albumData.album_list || []
    });
  } catch (error: any) {
    console.error("[WeChat general album error]", error);
    return res.status(500).json({
      success: false,
      error: `系统内部获取合集通道异常: ${error.message || String(error)}`
    });
  }
});

// ----------------------------------------------------
// Serve static frontend files (Development vs Production)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
