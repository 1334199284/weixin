import { ThemeConfig, ThemePreset, WeChatArticle } from "../types";
import { getFishingVectorSvgString } from "./vector-illustrations";

export const WECHAT_THEMES: Record<ThemePreset, ThemeConfig> = {
  green: {
    id: "green",
    name: "自然翠绿 (Outdoor Green)",
    primaryColor: "#059669", // emerald-600
    secondaryColor: "#ecfdf5", // emerald-50
    borderStyle: "border-l-4 border-emerald-500",
    accentBadge: "bg-emerald-600 text-white",
    iconColor: "text-emerald-600",
  },
  blue: {
    id: "blue",
    name: "深邃湖蓝 (Lake Blue)",
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#eff6ff", // blue-50
    borderStyle: "border-l-4 border-blue-500",
    accentBadge: "bg-blue-600 text-white",
    iconColor: "text-blue-600",
  },
  orange: {
    id: "orange",
    name: "野性暖橙 (Sunset Orange)",
    primaryColor: "#ea580c", // orange-600
    secondaryColor: "#fff7ed", // orange-50
    borderStyle: "border-l-4 border-orange-500",
    accentBadge: "bg-orange-600 text-white",
    iconColor: "text-orange-600",
  },
  minimalist: {
    id: "minimalist",
    name: "经典极简 (Charcoal Slate)",
    primaryColor: "#1f2937", // gray-800
    secondaryColor: "#f9fafb", // gray-50
    borderStyle: "border-l-4 border-gray-700",
    accentBadge: "bg-gray-800 text-white",
    iconColor: "text-gray-800",
  },
  red: {
    id: "red",
    name: "炽热国潮红 (Crimson Trail)",
    primaryColor: "#dc2626", // red-600
    secondaryColor: "#fef2f2", // red-50
    borderStyle: "border-l-4 border-red-500",
    accentBadge: "bg-red-600 text-white",
    iconColor: "text-red-600",
  },
  purple: {
    id: "purple",
    name: "数码科技紫 (Cyber Orchid)",
    primaryColor: "#7c3aed", // violet-600
    secondaryColor: "#f5f3ff", // violet-50
    borderStyle: "border-l-4 border-violet-500",
    accentBadge: "bg-violet-600 text-white",
    iconColor: "text-violet-600",
  },
  gold: {
    id: "gold",
    name: "经典复古金 (Amber Vintage)",
    primaryColor: "#d97706", // amber-600
    secondaryColor: "#fffbeb", // amber-50
    borderStyle: "border-l-4 border-amber-500",
    accentBadge: "bg-amber-600 text-white",
    iconColor: "text-amber-600",
  },
  forest: {
    id: "forest",
    name: "深幽松针绿 (Boreal Spruce)",
    primaryColor: "#0f5132", // deep green
    secondaryColor: "#f4f9f4", // light green background tint
    borderStyle: "border-l-4 border-emerald-900",
    accentBadge: "bg-emerald-950 text-white",
    iconColor: "text-emerald-900",
  },
};

/**
 * Utility to convert the structured article JSON to an inline-styled HTML string
 */
export function generateWeChatInlineHtml(
  article: WeChatArticle, 
  themeId: ThemePreset, 
  layoutId: 'classic' | 'split' | 'hybrid' | 'clean_accent' | 'fresh_borderless' | 'bubble_fresh' = 'classic',
  coverUrl?: string,
  sectionImages?: Record<string, string>,
  useVectorGraphics: boolean = true,
  origin: string = "",
  coverIllustrationUrl?: string,
  sectionIllustrations?: Record<string, string>,
  deletedImages?: Record<string, boolean>
): string {
  const theme = WECHAT_THEMES[themeId];
  
  // Helper to ensure URLs are absolute and proxied/processed correctly for WeChat editor
  const getAbsoluteImageUrl = (url?: string): string => {
    if (!url) return "";
    const currentOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
    // If it's already an absolute URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // If it contains our proxy pathways, return as is
      if (url.includes("/api/img/") || url.includes("/api/img-proxy")) {
        return url;
      }
      // Proxy Unsplash images to prevent 403 hotlink/crawler block by WeChat Editor
      if (url.includes("images.unsplash.com")) {
        return `${currentOrigin}/api/img-proxy?url=${encodeURIComponent(url)}`;
      }
      return url;
    }
    // If it's a relative API path
    if (url.startsWith("/")) {
      return `${currentOrigin}${url}`;
    }
    return url;
  };

  let coverHtml = "";
  // Check if cover is deleted by user
  if (!deletedImages || !deletedImages['cover']) {
    if (useVectorGraphics) {
      if (coverIllustrationUrl && !coverIllustrationUrl.includes("photo-1579783902614-a3fb3927b6a5")) {
        coverHtml = `<section style="margin: 0px 0px 16px; width: 100%; border-radius: 8px; overflow: hidden;"><img src="${getAbsoluteImageUrl(coverIllustrationUrl)}" style="width: 100%; display: block; border-radius: 8px;" alt="Banner Illustration"/></section>`;
      } else {
        const svgStr = getFishingVectorSvgString("cover", theme.primaryColor, theme.secondaryColor);
        coverHtml = `<section style="margin: 0px 0px 16px; width: 100%; border-radius: 8px; overflow: hidden; background-color: ${theme.secondaryColor};">${svgStr}</section>`;
      }
    } else if (coverUrl) {
      coverHtml = `<section style="margin: 0px 0px 16px; width: 100%; border-radius: 8px; overflow: hidden;"><img src="${getAbsoluteImageUrl(coverUrl)}" style="width: 100%; display: block; border-radius: 8px;" alt="Banner"/></section>`;
    }
  }

  let sectionsHtml = "";
  for (const [index, sec] of article.sections.entries()) {
    const paragraphsHtml = sec.paragraphs
      .map(p => {
        if (layoutId === 'fresh_borderless' || layoutId === 'bubble_fresh') {
          return `<p style="margin: 0px 0px 14px; line-height: 1.75; font-size: 15px; color: #2d3748; text-align: justify; text-justify: inter-ideograph; letter-spacing: 0.5px;">${p}</p>`;
        }
        return `<p style="margin: 0px 0px 12px; line-height: 1.6; font-size: 15px; color: #2d3748; text-align: justify; text-justify: inter-ideograph;">${p}</p>`;
      })
      .join("");

    let sectionGraphicHtml = "";
    // Only compile section graphic if NOT deleted by user
    if (!deletedImages || !deletedImages[sec.id]) {
      sectionGraphicHtml = useVectorGraphics 
        ? (sectionIllustrations && sectionIllustrations[sec.id] ? `
           <section style="margin: 14px 0px; border-radius: 8px; overflow: hidden; max-width: 100%; border: 1px solid #edf2f7; background-color: #ffffff; padding: 12px;">
             <img src="${getAbsoluteImageUrl(sectionIllustrations[sec.id])}" style="width: 100%; display: block; border-radius: 8px;" alt="${sec.title}"/>
           </section>
          ` : `<section style="margin: 14px 0px; border-radius: 8px; overflow: hidden; max-width: 100%; border: 1px solid #edf2f7; background-color: ${theme.secondaryColor};">
            ${getFishingVectorSvgString(sec.id, theme.primaryColor, theme.secondaryColor)}
           </section>`)
        : (sectionImages && sectionImages[sec.id] ? `
          <section style="margin: 14px 0px; border-radius: 8px; overflow: hidden; max-width: 100%; border: 1px solid #edf2f7; background-color: #f7fafc;">
            <img src="${getAbsoluteImageUrl(sectionImages[sec.id])}" style="width: 100%; display: block; border-radius: 8px;" alt="${sec.title}"/>
          </section>
          ` : "");
    }

    if (layoutId === 'fresh_borderless') {
      sectionsHtml += `
        <!-- Section ${sec.id} - Air Breathable Layout -->
        <section style="margin: 36px 0px 24px; padding: 0px 4px;">
          <!-- Left-aligned Title with Clean Underline -->
          <div style="border-bottom: 1px solid ${theme.primaryColor}30; padding-bottom: 8px; margin-bottom: 14px; text-align: left;">
            <h2 style="margin: 0px; font-size: 17px; font-weight: bold; color: #1a202c; text-align: left; clear: both; display: inline-block;">
              <span style="color: ${theme.primaryColor}; font-family: Consolas, Monaco, monospace; font-size: 14.5px; margin-right: 6px; font-weight: bold; font-style: italic;">◆ 0${index + 1}</span>
              ${sec.title.replace(/^\d+\s+/, "")}
            </h2>
          </div>
          
          <!-- Elegant Subtitle -->
          <p style="font-size: 13px; font-style: italic; color: #718096; margin: 0px 0px 16px 4px; text-align: left; line-height: 1.45;">
            ${sec.subtitle}
          </p>

          <!-- Section Illustration -->
          ${sectionGraphicHtml}
          
          <!-- Paragraphs with extra line-spacing/letter-spacing for ultimate breathability -->
          <section style="margin: 14px 4px 18px; text-align: left;">
            ${paragraphsHtml}
          </section>
          
          <!-- Modern Light Clean Tips Box -->
          <section style="margin: 20px 4px; padding: 14px 16px; background-color: #fafbfc; border-radius: 8px; border: 1px solid #edf2f7; text-align: left;">
            <strong style="color: ${theme.primaryColor}; font-size: 13.5px; display: block; margin-bottom: 6px; letter-spacing: 0.5px;">🍀 FOCUS POINT / 重中之重</strong>
            <p style="font-size: 13px; color: #4a5568; margin: 0; line-height: 1.55; text-align: justify;">
              ${sec.proTips}
            </p>
          </section>
        </section>
      `;
    } else if (layoutId === 'split') {
      sectionsHtml += `
        <!-- Section ${sec.id} - Split Card Layout -->
        <section style="margin: 24px 0px; padding: 18px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.015); overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px;">
            <h2 style="margin: 0px; font-size: 16px; font-weight: bold; color: ${theme.primaryColor};">${sec.title.replace(/^\d+\s+/, "")}</h2>
            <span style="background-color: ${theme.primaryColor}; color: #ffffff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 20px; font-family: monospace;">0${index + 1}</span>
          </div>
          <p style="font-size: 12.5px; color: #718096; font-weight: 500; margin-bottom: 14px; margin-top: -6px; padding-left: 2px;">
            ${sec.subtitle}
          </p>
          
          ${sectionGraphicHtml}
          
          <section style="margin: 12px 0px 14px;">
            ${paragraphsHtml}
          </section>
          
          <section style="margin-top: 14px; padding: 12px; background-color: ${theme.secondaryColor}; border-radius: 8px; border-left: 3px solid ${theme.primaryColor};">
            <span style="color: ${theme.primaryColor}; font-size: 13.5px; font-weight: bold; display: block; margin-bottom: 4px;">💡 独家秘法：</span>
            <span style="font-size: 13px; color: #4a5568; line-height: 1.5; display: block;">${sec.proTips}</span>
          </section>
        </section>
      `;
    } else if (layoutId === 'clean_accent') {
      sectionsHtml += `
        <!-- Section ${sec.id} - Geek SSPAI Clean Accent Layout -->
        <section style="margin: 32px 0px 24px; padding: 0px 4px;">
          <!-- Thick Left Accent Title Bar -->
          <div style="border-left: 4px solid ${theme.primaryColor}; padding-left: 12px; margin-bottom: 12px; line-height: 1.45;">
            <h2 style="margin: 0px; font-size: 17px; font-weight: 800; color: #1a202c; text-align: left; clear: both;">
              <span style="color: ${theme.primaryColor}; font-family: Consolas, Monaco, monospace; font-size: 13px; margin-right: 6px; font-weight: bold; position: relative; top: -1px;">0${index + 1} //</span>${sec.title.replace(/^\d+\s+/, "")}
            </h2>
          </div>
          
          <!-- Subtitle with padding matching left bar -->
          <p style="font-size: 13px; font-style: italic; color: #718096; margin: -4px 0px 16px 16px; text-align: left;">
            ${sec.subtitle}
          </p>

          <!-- Section Illustration -->
          ${sectionGraphicHtml}
          
          <!-- Body Paragraphs with matching left margin padding -->
          <section style="margin: 12px 0px 16px; padding-left: 16px;">
            ${paragraphsHtml}
          </section>
          
          <!-- Modern Technical Box for Pro Tips -->
          <section style="margin: 20px 0px 20px 16px; padding: 14px 16px; background-color: #f7fafc; border-left: 3px solid ${theme.primaryColor}; border-radius: 0px 6px 6px 0px;">
            <strong style="color: ${theme.primaryColor}; font-size: 13.5px; display: block; margin-bottom: 6px; letter-spacing: 0.5px;">⚡ GEAR INSIGHT / 实战要领</strong>
            <p style="font-size: 13px; color: #4a5568; margin: 0; line-height: 1.55; text-align: justify;">
              ${sec.proTips}
            </p>
          </section>
        </section>
      `;
    } else if (layoutId === 'bubble_fresh') {
      sectionsHtml += `
        <!-- Section ${sec.id} - Cute Macaron Layout -->
        <section style="margin: 28px 0px; padding: 18px 20px; border: 1px solid #edf2f7; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.025); text-align: left;">
          <!-- Small cute layout heading -->
          <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 15px;">
            <span style="height: 8px; width: 8px; border-radius: 55px; background-color: ${theme.primaryColor}; display: inline-block; margin-right: 8px; shrink: 0;"></span>
            <h2 style="margin: 0px; font-size: 16px; font-weight: bold; color: #2d3748; line-height: 1.4; display: inline-block;">
              <span style="font-size: 11px; font-weight: 900; background-color: ${theme.primaryColor}; color: #ffffff; border-radius: 20px; padding: 2px 7px; margin-right: 6px; position: relative; top: -1px;">${index + 1}</span>
              ${sec.title.replace(/^\d+\s+/, "")}
            </h2>
          </div>
          
          <!-- Subtitle -->
          <p style="font-size: 13px; color: #718096; margin: -4px 0px 16px 16px; text-align: left; line-height: 1.45;">
            ${sec.subtitle}
          </p>

          <!-- Section Graphic -->
          ${sectionGraphicHtml}
          
          <!-- Paragraphs -->
          <section style="margin: 14px 0px; text-align: left; padding-left: 2px;">
            ${paragraphsHtml}
          </section>
          
          <!-- Clean Border Dashed Tips Box -->
          <section style="margin: 16px 0px 4px; padding: 14px 16px; border: 1px dashed ${theme.primaryColor}60; border-radius: 12px; background-color: #fcfdfe; text-align: left;">
            <strong style="color: ${theme.primaryColor}; font-size: 13.5px; display: block; margin-bottom: 6px; text-align: left;">🍬 SWEET TIPS / 治愈秘笈</strong>
            <p style="font-size: 13px; color: #4a5568; margin: 0; line-height: 1.55; text-align: justify;">
              ${sec.proTips}
            </p>
          </section>
        </section>
      `;
    } else if (layoutId === 'hybrid') {
      sectionsHtml += `
        <!-- Section ${sec.id} - Hybrid Layout -->
        <section style="margin: 32px 0px; border: 2px solid ${theme.primaryColor}; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: ${theme.primaryColor}; color: #ffffff; padding: 12px 14px; font-weight: bold; line-height: 1.4;">
            <span style="font-size: 14.5px; letter-spacing: 0.5px; display: block;">0${index + 1} ${sec.title.replace(/^\d+\s+/, "")}</span>
          </div>
          <div style="padding: 16px; background-color: #ffffff;">
            <p style="font-size: 12.5px; color: #718096; font-weight: 500; margin-bottom: 14px; margin-top: 0px;">
              ▼ ${sec.subtitle}
            </p>
            
            ${sectionGraphicHtml}
            
            <section style="margin: 12px 0px;">
              ${paragraphsHtml}
            </section>
            
            <section style="margin-top: 14px; padding: 12px; background-color: ${theme.secondaryColor}; border: 1px dashed ${theme.primaryColor}; border-radius: 6px;">
              <strong style="font-size: 13px; color: ${theme.primaryColor}; margin-bottom: 4px; display: block;">💡 避坑指南 / 实用秘籍</strong>
              <p style="font-size: 12.5px; color: #4a5568; margin: 0; line-height: 1.5;">${sec.proTips}</p>
            </section>
          </div>
        </section>
      `;
    } else {
      // Classic layout (Default)
      sectionsHtml += `
        <!-- Section ${sec.id} - Classic Layout -->
        <section style="margin: 28px 0px; padding: 0px 4px;">
          <!-- Heading -->
          <h2 style="margin: 0px 0px 14px; font-size: 18px; font-weight: bold; color: ${theme.primaryColor}; line-height: 1.4; text-align: left; clear: both;"><span style="float: left; display: block; background-color: ${theme.primaryColor}; color: #ffffff; font-size: 12px; font-weight: bold; width: 30px; height: 20px; line-height: 20px; text-align: center; border-radius: 4px; box-sizing: border-box; margin-right: 10px; margin-top: 2px; margin-bottom: 0px; overflow: hidden;">0${index + 1}</span>${sec.title.replace(/^\d+\s+/, "")}</h2>
          
          <!-- Subtitle -->
          <p style="font-size: 13px; font-style: italic; color: #718096; margin: -6px 0px 14px 4px;">
            ${sec.subtitle}
          </p>

          <!-- Section Illustration Image if available -->
          ${sectionGraphicHtml}
          
          <!-- Body Paragraphs -->
          <section style="margin: 10px 0px; padding-left: 0px;">
            ${paragraphsHtml}
          </section>
          
          <!-- Pro Tips Box -->
          <section style="margin: 16px 0px; padding: 12px 16px; background-color: ${theme.secondaryColor}; border-left: 4px solid ${theme.primaryColor}; border-radius: 0px 8px 8px 0px;">
            <strong style="color: ${theme.primaryColor}; font-size: 14px; display: block; margin-bottom: 6px;">💡 避坑指南/实用秘籍</strong>
            <p style="font-size: 13.5px; color: #4a5568; margin: 0; line-height: 1.5; font-style: normal;">
              ${sec.proTips}
            </p>
          </section>
        </section>
      `;
    }
  }

  return `
    <section style="font-family: -apple-system-font, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; max-width: 677px; margin: 0px auto; text-size-adjust: 100%;">
      <!-- Article Cover Hero -->
      ${coverHtml}

      <!-- Compelling intro -->
      <section style="padding: 14px 18px; margin: 20px 0px; background-color: #f7fafc; border-radius: 8px; border: 1px dashed #cbd5e0;">
        <p style="margin: 0px; font-size: 14.5px; color: #4a5568; line-height: 1.6; text-align: justify;">
          ${article.intro}
        </p>
      </section>

      <!-- Sections -->
      ${sectionsHtml}

      <!-- Safety block -->
      <section style="margin: 32px 0px; padding: 16px; border: 1px solid #ffcc00; background-color: #fffdec; border-radius: 8px;">
        <strong style="color: #b7791f; font-size: 14.5px; display: block; margin-bottom: 6px;">🎣 安全倡议 & 户外礼仪</strong>
        <p style="font-size: 13px; color: #744210; margin: 0; line-height: 1.5; text-align: justify;">
          ${article.safetyTips}
        </p>
      </section>

      <!-- Outro Section -->
      <section style="margin: 32px 0px 20px; padding: 0px 4px;">
        <p style="margin: 0px; font-size: 14.5px; color: #2d3748; line-height: 1.6; text-align: justify; text-justify: inter-ideograph;">
          ${article.outro}
        </p>
      </section>

      <!-- Outro & Call to Action: WeChat Official Profile Card -->
      <section style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #f0f0f0;">
        <section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf=""><mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe mp_common_widget" data-pluginname="mpprofile" data-nickname="路亚视界" data-alias="LureWorld" data-from="0" data-headimg="http://mmbiz.qpic.cn/mmbiz_png/Ld6V92O4k5RfEOH0mJ0LdbTjSVIZvmDzqkF1WSnxg7az4iaOqMKMZwjMGR44mibluNrsGqEGBlZYHtXuHIWgDhcQ/0?wx_fmt=png" data-signature="解锁最纯粹的户外路亚美学！我这有深度的路亚实战技术、拟饵操饵手法。一根路亚竿，不仅是水底的博弈，更是行之随心的精致户外生活。关注并加入我们的圈子，一起探索水边最自由的灵魂。" data-id="MzUyNjgwOTEyOQ==" data-is_biz_ban="0" data-service_type="1" data-verify_status="0" contenteditable="false"></mp-common-profile><img class="ProseMirror-separator" alt=""><br class="ProseMirror-trailingBreak"></section>
      </section>
    </section>
  `;
}
