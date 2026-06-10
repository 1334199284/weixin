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
};

/**
 * Utility to convert the structured article JSON to an inline-styled HTML string
 * suitable for pasting directly into WeChat Official Account editor.
 */
export function generateWeChatInlineHtml(
  article: WeChatArticle, 
  themeId: ThemePreset, 
  coverUrl?: string,
  sectionImages?: Record<string, string>,
  useVectorGraphics: boolean = true,
  origin: string = ""
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
  if (useVectorGraphics) {
    const svgStr = getFishingVectorSvgString("cover", theme.primaryColor, theme.secondaryColor);
    coverHtml = `<section style="margin: 0px 0px 16px; width: 100%; border-radius: 8px; overflow: hidden; background-color: ${theme.secondaryColor};">${svgStr}</section>`;
  } else if (coverUrl) {
    coverHtml = `<section style="margin: 0px 0px 16px; width: 100%; border-radius: 8px; overflow: hidden;"><img src="${getAbsoluteImageUrl(coverUrl)}" style="width: 100%; display: block; border-radius: 8px;" alt="Banner"/></section>`;
  }

  let sectionsHtml = "";
  for (const [index, sec] of article.sections.entries()) {
    const paragraphsHtml = sec.paragraphs
      .map(p => `<p style="margin: 0px 0px 12px; line-height: 1.6; font-size: 15px; color: #2d3748; text-align: justify; text-justify: inter-ideograph;">${p}</p>`)
      .join("");

    const sectionGraphicHtml = useVectorGraphics 
      ? `<section style="margin: 14px 0px; border-radius: 8px; overflow: hidden; max-width: 100%; border: 1px solid #edf2f7; background-color: ${theme.secondaryColor};">
          ${getFishingVectorSvgString(sec.id, theme.primaryColor, theme.secondaryColor)}
         </section>`
      : (sectionImages && sectionImages[sec.id] ? `
        <section style="margin: 14px 0px; border-radius: 8px; overflow: hidden; max-width: 100%; border: 1px solid #edf2f7; background-color: #f7fafc;">
          <img src="${getAbsoluteImageUrl(sectionImages[sec.id])}" style="width: 100%; display: block; border-radius: 8px;" alt="${sec.title}"/>
        </section>
        ` : "");

    sectionsHtml += `
      <!-- Section ${sec.id} -->
      <section style="margin: 28px 0px; padding: 0px 4px;">
        <!-- Heading (WeChat-Compatible Floated Layout inside H2 without spacing) -->
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
        <section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf=""><mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe mp_common_widget" data-pluginname="mpprofile" data-nickname="鱼佬圈" data-alias="W1334199284" data-from="0" data-headimg="http://mmbiz.qpic.cn/mmbiz_png/Ld6V92O4k5RfEOH0mJ0LdbTjSVIZvmDzqkF1WSnxg7az4iaOqMKMZwjMGR44mibluNrsGqEGBlZYHtXuHIWgDhcQ/0?wx_fmt=png" data-signature="解锁最纯粹的户外钓鱼美学！我这不仅有硬核的台钓、路亚、海钓实战技术，更有让你彻底解压的爆护盛宴。一根鱼竿，不仅是水下的博弈，更是成年人说走就走的精致生活。关注并加入属于我们的圈子，一起享受水边最自由的灵魂。" data-id="MzUyNjgwOTEyOQ==" data-is_biz_ban="0" data-service_type="1" data-verify_status="0" contenteditable="false"></mp-common-profile><img class="ProseMirror-separator" alt=""><br class="ProseMirror-trailingBreak"></section>
      </section>
    </section>
  `;
}
