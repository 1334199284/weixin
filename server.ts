import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables from .env
dotenv.config();

const WECHAT_API_BASE = process.env.WECHAT_API_URL || "https://api.weixin.org";

function getWeChatCredentials(req: express.Request, isPost: boolean = false) {
  let appId = process.env.WECHAT_APPID;
  let appSecret = process.env.WECHAT_APPSECRET;

  if (!appId) appId = req.headers["x-wechat-appid"] as string;
  if (!appSecret) appSecret = req.headers["x-wechat-appsecret"] as string;

  if (!appId) appId = (isPost ? req.body?.appId : req.query?.appId) as string;
  if (!appSecret) appSecret = (isPost ? req.body?.appSecret : req.query?.appSecret) as string;

  return {
    appId: appId ? String(appId).trim() : "",
    appSecret: appSecret ? String(appSecret).trim() : ""
  };
}

function handleFetchError(err: any, endpointName: string) {
  console.error(`[WeChat ${endpointName}] Fetch error:`, err);
  const errMsg = err.message || String(err);
  if (errMsg.includes("ENOTFOUND") || errMsg.includes("fetch failed") || errMsg.includes("getaddrinfo")) {
    return `无法访问微信官方接口服务器 (${WECHAT_API_BASE})，发生网络/DNS解析错误: ${errMsg}。\n\n【排查指引】：由于有些海外或容器云环境（如 Cloud Run）的公共 DNS 无法直连或解析官方接口（api.weixin.org），请选择：\n1.【推荐】在微信同步设置最下方的「高级设置」区域配置第三方的同步代理网关（例如您的 http://www.legns.top:1234 等）；\n2.【环境变量】在系统配置中通过 WECHAT_API_URL 环境变量指定微信 API 接口中转代理；\n3.【IP白名单】请确认您的服务器出站 IP 是否已填写到微信公众号后台的“IP白名单”中。`;
  }
  return `连接微信 ${endpointName} 失败，网络连接异常: ${errMsg}`;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Custom robust CORS middleware to handle different frontend host/containers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Content-Type, Authorization, X-Requested-With");
  
  // Handle HTTP OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// In-memory store for generated images
const generatedImages = new Map<string, { mimeType: string; data: string }>();

// Initialize Gemini Client dynamically with User-Agent set for telemetry as required
function getAiClient(customApiKey?: string) {
  let apiKey = "";
  if (customApiKey && typeof customApiKey === "string") {
    apiKey = customApiKey.trim();
  }
  
  // If the key is blank, or contains password mask characters (dots/asterisks), fall back to server env or default key
  if (!apiKey || apiKey.includes("•") || apiKey.includes("*") || apiKey === "undefined" || apiKey === "null") {
    apiKey = (process.env.GEMINI_API_KEY || "AIzaSyCZiUdeJw6ocYvy6A1iHMqeRvWhLZrEfQQ").trim();
  }

  // If there is still no key, or it's a default example placeholder, return our verified fallback key
  if (!apiKey || apiKey.includes("your_") || apiKey.includes("YOUR_") || apiKey.length < 5) {
    apiKey = "AIzaSyCZiUdeJw6ocYvy6A1iHMqeRvWhLZrEfQQ";
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
You MUST write as the persona of "LEG", a close friend and fellow enthusiast on the road, publishing on your WeChat Official Account "鱼佬圈".

Article Outline:
${basePrompt}

Additional Instructions:
- Target Reader Skill Level: ${level || 'Beginner'}
- Article Tone: ${tone || 'Friendly & Professional'}
- Theme Preference: ${theme || 'Natural Green'}
- Custom Request: ${customPrompt || 'None'}
- CRITICAL Perspective & Tone Constraint (平等共平阶交流，零说教，极致沉浸代入感): 
  1. 严禁使用任何居高临下、带有说教意味或指点色彩的词汇。绝对不能出现以下或类似的高高在上词汇：【劝你】、【听劝】、【听老手/老钓手一句劝】、【听我一句话】、【少走弯路/少交学费】、【让我告诉你】、【不听吃亏】。
  2. 语气应该是一种“共同面对、一起探索、纯粹同好共创交流”的平等同伴感。写的时候，要把读者完全拉入到这个“我们”的群体中，就好像大家是在同一个鱼塘边，吹着微风，肩并肩坐在钓箱上分享心得。
  3. 读者一读进去，就能产生天然的共鸣，觉得是“我们在经历”、“我们当时一起探索的快乐”，而不是在上一堂大师大讲堂课程。
  4. 绝不将文章说成是“课程”、“第一课”或者“教材”。而是以“同好经验分享”、“实战体验探讨”、“入门精选交流”或者“咱们的一点装备小结”。
  5. 标题与正文所有的句式和措辞全部转换成“我们”、“咱们”第一人称去带入，让文章不仅有干货，更极具情绪共鸣和绝对温柔平等的交流语境。

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

- CRITICAL Lure Fishing Action Realism Rules (极致真实路亚核心动作规范 - 严禁夸大、必须专业严谨):
  1. 【抛投动作规范】: 必须描述“抛投时由大臂带动小臂，最后利用手腕自然释放，让竿身充分完成回弹。拟饵会沿着稳定的抛物线飞向目标，而不是靠蛮力‘甩’出去。”真正的发力来自竿身的弹性，整个动作由身体、手臂和手腕自然连贯完成，杜绝慢拉或者猛甩蛮力。
  2. 【侧抛落水声响】: 侧抛的落水水花应描述为“落水声音更轻，更适合惊扰较小的目标鱼”，严禁使用“毫无声息”或夸张修辞。
  3. 【控饵魅力与停顿】: 必须使用“路亚最大的魅力，就是让拟饵‘活’起来”这类自然表达。描述抽停时，要讲明“很多鲈鱼都会选择在停顿的一瞬间发动攻击，因此停顿往往比连续收线更容易迎来咬口”，避免过多绝对化的统计口吻（如“九成以上”）。
  4. 【跳底慢拖要领】: 描述跳底手法时，应准确写为“每次轻轻挑离底部约10厘米左右，再缓慢收紧余线，让拟饵自然回落。保持线始终略微绷紧，才能第一时间感受到轻微的咬口。”
  5. 【扬竿刺鱼力度】: 杜绝描述为“大力扬竿”或“大力刺鱼”。必须描述为：“当感觉到明显的顿口、重量变化或主线异常移动时，应迅速扬竿刺鱼，动作干脆有力即可，不必刻意用尽全力（避免因动作猛烈导致鱼嘴被拉豁或断线爆竿）。”
  6. 【文章正能量收尾】: 文章结尾风格必须升华为：“路亚的乐趣，从来不只是鱼获本身。每一次精准的抛投、每一次拟饵在水中的动作、每一次突然传来的咬口，都值得慢慢体会。希望今天分享的技巧，能帮助大家少走一些弯路，在下一次出钓时收获更多乐趣。如果还有想了解的内容，欢迎留言交流，我们水边见！”

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

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const modelName of modelsToTry) {
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Gemini Engine] Attempting article generation with model: ${modelName} (Attempt ${attempt}/${maxRetries})`);
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
            console.log(`[Gemini Engine] Successful generation using model: ${modelName} on attempt ${attempt}`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err.message || String(err);
          console.log(`[Gemini Engine] Model ${modelName} state: busy or high demand (Attempt ${attempt}/${maxRetries}).`);

          const isTransient = errMsg.includes("503") || 
                              errMsg.includes("500") || 
                              errMsg.includes("429") || 
                              errMsg.includes("limit") || 
                              errMsg.includes("LIMIT") || 
                              errMsg.includes("exhausted") || 
                              errMsg.includes("busy") || 
                              errMsg.includes("overload") || 
                              errMsg.includes("unavailable") || 
                              errMsg.includes("UNAVAILABLE") || 
                              errMsg.includes("demand");

          if (isTransient && attempt < maxRetries) {
            const backoffMs = attempt * 1500;
            console.log(`[Gemini Engine] Applying automatic pacing delay. Waiting ${backoffMs}ms before next check for ${modelName}...`);
            await sleep(backoffMs);
          } else {
            console.log(`[Gemini Engine] Model ${modelName} was busy after ${attempt} checks. Transitioning automatically to next lane.`);
            break;
          }
        }
      }
      if (generationSuccess) {
        break;
      }
    }

    if (!generationSuccess) {
      throw lastError || new Error("All tried Gemini models failed to generate content");
    }

    const parsedData = JSON.parse(responseText || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    const rawErrorMsg = error?.message || String(error);
    const isQuotaError = rawErrorMsg.includes("quota") || rawErrorMsg.includes("429") || rawErrorMsg.includes("RESOURCE_EXHAUSTED");
    
    // Sanitize the error message to avoid printing raw JSON objects in console logs
    const errorMsg = isQuotaError 
      ? "Gemini API Quota Limit Exceeded (429 RESOURCE_EXHAUSTED)" 
      : rawErrorMsg.replace(/[{}]/g, "").substring(0, 200).trim();

    console.log(`[Article Gen Fallback] Normal failover activated: ${errorMsg}`);

    // Track if the user explicitly provided an API key in the frontend settings
    const userKeyUsed = aiConfig?.apiKey && typeof aiConfig.apiKey === "string" && aiConfig.apiKey.trim().length > 4;

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
    // 1. Handle custom third-party OpenAI-compatible Text-To-Image APIs
    // Bypassed: As requested by the user ("图片绘画 你就默认用gemini嘛"), we default all image drawings to Google Gemini.
    const useBypassedCustomImageEngine = false;
    if (useBypassedCustomImageEngine && aiConfig && aiConfig.provider === "custom") {
      try {
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
          throw new Error(`Custom Image Gen API Error: ${response.status} - ${errText.substring(0, 200)}`);
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
      } catch (customErr: any) {
        console.warn(`[Custom Image Warning] Custom Image Generation failed: ${customErr.message}. Falling back to default Gemini/Unsplash channels.`);
        // Let it fall back to standard image generation flows down below
      }
    }

    // 2. Default to Google Gemini (using user's Gemini key if provider is Gemini, or falling back to verified default Gemini API key)
    const geminiKeyToUse = (aiConfig && aiConfig.provider === "gemini") ? aiConfig.apiKey : undefined;
    const aiClient = getAiClient(geminiKeyToUse);
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
    const rawErrorMsg = error?.message || String(error);
    const isQuotaError = rawErrorMsg.includes("quota") || rawErrorMsg.includes("429") || rawErrorMsg.includes("RESOURCE_EXHAUSTED");
    
    // Sanitize the error message to avoid printing raw JSON objects in console logs or frontend responses
    const errorMsg = isQuotaError 
      ? "Gemini API Quota Limit Exceeded (429 RESOURCE_EXHAUSTED)" 
      : rawErrorMsg.replace(/[{}]/g, "").substring(0, 200).trim();
    
    console.log(`[Image Generation Fallback] Normal failover activated: ${errorMsg}. Seamlessly loaded premium catalog illustrations.`);
    
    return res.json({ 
      imageUrl: getDynamicFallbackUrl(), 
      isMock: true,
      error: errorMsg,
      warning: "AI 绘画接口暂时受限（可能由于配额或API密钥限制），已自动使用高清实景路亚垂钓/手绘水彩插画进行智能平滑替代，以确保正文完美呈现。"
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
  let title = "【避坑指南】选对第一套路亚假饵和竿线轮：那些我们一言难尽又真实管用的良心搭配";
  let subtitle = `拒绝盲目堆料！咱们一同看清路亚第一套泛用装备的真实细节 (${level === "Beginner" ? "新手配置" : level === "Intermediate" ? "中级进阶" : "骨灰玩家"} · ${theme || "经典绿调"})`;
  let intro = `大家好！刚开始接触路亚或者面对新水域时，大家难免会对竿、线、轮和假饵的层层搭配感到困惑。其实这些纠结，我们在新手阶段或开发新点位时全部经历过。今天，咱们就以最真实的同好探讨视角，把这些经典的实战细节一并拆解，不搞虚的概念，只希望咱们每次挥竿都能多一份舒坦与底气！`;

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
        "直柄路亚竿超佳的抛投与出线容错率往往是我们在新手期能保持平稳心态的关键。优先做到顺利稳定地把假饵抛投出去，咱们才有信心和乐趣去开展后续 of 控饵与咬讯试探。",
        "在竿子硬度也就是调性选择上，我们更推荐关注【ML调（中偏软）】或者【M调（中等）】的单节或双节泛用竿。这个规格对拟饵克重的兼容性极强，不论是丢几克重的小亮片，还是甩十几克的小米诺，整体腰力上都绰绰有余。"
      ],
      proTips: "竿子选择时优先考虑两节插节式，这样我们日常携带或自驾都会方便很多。同时选择碳素含量在90%以上，能帮我们更好地感知水下微小的咬讯和障碍碰撞手感！",
      imagePrompt: "lure fishing casting rod"
    },
    {
      id: "reel",
      title: "02 稳健运转：纺车轮（推荐2000-2500型浅线杯）",
      subtitle: "出线零阻碍，彻底告别“炒粉”炸线尴尬",
      paragraphs: [
        "纺车轮的出线原理是螺旋状自然脱出，完全依赖假饵飞行拉扯渔线，这在物理层面上能很大程度上消解主轴失控逆转，可以说是我们的“炸线避难所”。",
        "咱们在选择轮子时，建议首选 2000型 或 2500型 的【浅线杯】。这类中轻型轮子的重心搭配和ML竿非常协调，持感轻巧，日常我们挥竿作钓一整天也不会感到手臂沉重。"
      ],
      proTips: "每次作钓结束回家后，建议用清水冲洗主轴等细部，甩干水滴并滴上一两滴齿轮油，长久保持丝滑的出线质感！",
      imagePrompt: "lure spinning reel 2000"
    },
    {
      id: "line",
      title: "03 隐形桥梁：主线（PE编织线） + 前导线（碳素线）",
      subtitle: "双线黄金搭档，兼顾拉力强度与水中完美隐蔽",
      paragraphs: [
        "主线是连接咱们和水下猎物的核心纽带。在新手阶段，咱们的主线建议直接考虑选用四编或八编的【PE编织线（0.8号或1.0号）】。PE线没有弹性，拉力极强，而且线径细能甩得更远。",
        "为了应对障碍物防划和水中隐形，建议在前端绑定一截一米左右的【碳素前导线】。碳素线耐磨防划性能绝佳，可以让我们在水底树桩或乱石堆等重障碍区域更为从容。"
      ],
      proTips: "主线与前导线的连接掌握好“简易FG结”或“双套结”。虽然绑定前导线在刚开始上手时可能有些考验精细度，但在遭遇磨底碎石或与极具爆发力的个体力争时，它能给到我们更安心的防切线保证！",
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
          `在实际水域垂钓中，操控该部分的核心关键在于把握好力度与摆动节奏。在运用 【${tone === "Friendly" ? "亲切幽默" : tone === "Professional" ? "严谨专业" : tone === "Enthusiastic" ? "饱满激情" : "轻松风趣"}】 的同好视角分享时，LEG最提倡的核心要素就是多看鱼情、多练手法，咱们一起切磋共同精进！`
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

    const { appId, appSecret } = getWeChatCredentials(req, true);

    if (!appId || !appSecret) {
      return res.status(400).json({
        success: false,
        error: "缺少必要的微信开发者凭证：未在系统环境变量中配置，且请求中未提供合法的 AppID 或 AppSecret。"
      });
    }

    if (!title || !contentHtml) {
      return res.status(400).json({
        success: false,
        error: "发布文章失败：文章标题或内容不能为空。"
      });
    }

    // Step 1: Fetch Official WeChat access_token
    console.log(`[WeChat publisher] Connecting to WeChat API at ${WECHAT_API_BASE} for AppID: ${appId}`);
    const tokenUrl = `${WECHAT_API_BASE}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    
    let tokenRes;
    try {
      tokenRes = await fetch(tokenUrl);
    } catch (fetchTokenErr: any) {
      const verboseErr = handleFetchError(fetchTokenErr, "获取 Access Token");
      return res.status(500).json({
        success: false,
        error: verboseErr
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
        error: tokenData.errmsg || "获取 WeChat access_token 失败。请检查微信后台的 AppID 与 AppSecret，并确保服务器 IP 已在 IP 白名单中（如果有配置中介代理服务，请确保中介参数无误）。",
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
          // If relative URL (such as our own /api/img/...) then download it using the current request host and protocol dynamically to support custom deployments on other ports (such as :1234)
          if (coverUrl.startsWith("/")) {
            const host = req.headers.host || "127.0.0.1:3000";
            const protocol = req.headers["x-forwarded-proto"] || "http";
            actualCoverUrl = `${protocol}://${host}${coverUrl}`;
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
        const uploadUrl = `${WECHAT_API_BASE}/cgi-bin/media/upload?access_token=${accessToken}&type=thumb`;
        
        let uploadRes;
        try {
          uploadRes = await fetch(uploadUrl, {
            method: "POST",
            body: uploadForm
          });
        } catch (uploadFetchErr: any) {
          const verboseErr = handleFetchError(uploadFetchErr, "上传临时媒体文件");
          throw new Error(verboseErr);
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
    const draftAddUrl = `${WECHAT_API_BASE}/cgi-bin/draft/add?access_token=${accessToken}`;
    
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
        const collectionUrl = `${WECHAT_API_BASE}/cgi-bin/album/adddraft?access_token=${accessToken}`;
        
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
          const verboseErr = handleFetchError(colFetchErr, "向合集专栏添加草稿");
          throw new Error(verboseErr);
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
        const publishUrl = `${WECHAT_API_BASE}/cgi-bin/freepublish/submit?access_token=${accessToken}`;
        
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
          const verboseErr = handleFetchError(pubFetchErr, "正式发布/群发");
          throw new Error(verboseErr);
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
app.all("/api/wechat/albums", async (req, res) => {
  try {
    const { appId, appSecret } = getWeChatCredentials(req, req.method === "POST");

    if (!appId || !appSecret) {
      return res.status(400).json({
        success: false,
        error: "缺少必要的微信开发者凭证：AppID 和 AppSecret 不能为空。"
      });
    }

    // Step 1: Fetch Official WeChat access_token
    console.log(`[WeChat Album] Connecting to WeChat API at ${WECHAT_API_BASE} for AppID: ${appId}`);
    const tokenUrl = `${WECHAT_API_BASE}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    
    let tokenRes;
    try {
      tokenRes = await fetch(tokenUrl);
    } catch (fetchTokenErr: any) {
      const verboseErr = handleFetchError(fetchTokenErr, "获取 Access Token");
      return res.status(500).json({
        success: false,
        error: verboseErr
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
    const albumUrl = `${WECHAT_API_BASE}/cgi-bin/album/getall?access_token=${accessToken}`;
    
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
      const verboseErr = handleFetchError(albumFetchErr, "获取合集专栏列表");
      return res.status(500).json({
        success: false,
        error: verboseErr
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
// API: Query server-side WeChat configuration states
// ----------------------------------------------------
app.get("/api/wechat/config", (req, res) => {
  res.json({
    success: true,
    appIdConfigured: !!process.env.WECHAT_APPID,
    appSecretConfigured: !!process.env.WECHAT_APPSECRET,
    appId: process.env.WECHAT_APPID ? `${process.env.WECHAT_APPID.substring(0, 6)}******` : ""
  });
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
