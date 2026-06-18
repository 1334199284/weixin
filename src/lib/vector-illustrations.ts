import { ThemePreset } from "../types";

/**
 * High-fidelity, custom hand-rendered SVG vector illustrations for lure fishing.
 * Using standards-compliant lowercase and kebab-case attributes to make them
 * 100% compatible with both web rendering and WeChat Official Account (MP) Editor's pasting parser.
 */
export function getFishingVectorSvgString(id: string, color: string, secondary: string): string {
  const normId = (id || "").toLowerCase().trim();
  let targetId = normId;

  if (normId === "cover") {
    targetId = "cover";
  } else if (normId.includes("hard_lures_1") || normId.includes("minnow") || normId.includes("pencil") || normId.includes("米诺") || normId.includes("铅笔")) {
    targetId = "minnow_pencil";
  } else if (normId.includes("hard_lures_2") || normId.includes("crank") || normId.includes("vib") || normId.includes("小胖子")) {
    targetId = "crank_vib";
  } else if (normId.includes("soft_lures_jig") || normId.includes("jig") || normId.includes("grub") || normId.includes("铅头钩") || normId.includes("软饵")) {
    targetId = "soft_jig";
  } else if (normId.includes("rod") || normId.includes("竿")) {
    targetId = "rod";
  } else if (normId.includes("reel") || normId.includes("轮") || normId.includes("wheel")) {
    targetId = "reel";
  } else if (normId.includes("line") || normId.includes("线") || normId.includes("knot")) {
    targetId = "line";
  } else if (normId.includes("lure") || normId.includes("饵") || normId.includes("bait")) {
    targetId = "lures";
  } else if (normId.includes("accessories") || normId.includes("配件") || normId.includes("钳") || normId.includes("工具")) {
    targetId = "accessories";
  } else if (normId.includes("casting") || normId.includes("抛") || normId.includes("投")) {
    targetId = "casting";
  } else if (normId.includes("action") || normId.includes("手法") || normId.includes("操") || normId.includes("操饵") || normId.includes("泳姿")) {
    targetId = "actions";
  } else {
    // If it's a generic section ID that didn't match anything, we fall back to a high-quality lure/gear drawing
    targetId = "lures";
  }

  switch (targetId) {
    case "cover":
      return `<svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <defs>
            <linearGradient id="skyGrad_cover" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="${color}" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#fff7ed" />
            </linearGradient>
            <linearGradient id="waterGrad_cover" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f8fafc" />
              <stop offset="100%" stop-color="${color}" stop-opacity="0.25" />
            </linearGradient>
            <linearGradient id="primaryAccentGrad_cover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${color}" />
              <stop offset="100%" stop-color="#1e293b" />
            </linearGradient>
          </defs>

          <!-- Background Sky -->
          <rect width="800" height="280" fill="${secondary}" style="fill: url(#skyGrad_cover);" />
          <!-- Water -->
          <rect y="280" width="800" height="170" fill="#f1f5f9" style="fill: url(#waterGrad_cover);" />

          <!-- Mountains in background -->
          <path d="M-50 280 L120 160 L310 280 Z" fill="#94a3b8" opacity="0.3" />
          <path d="M220 280 L420 140 L580 280 Z" fill="#64748b" opacity="0.25" />
          <path d="M480 280 L680 120 L880 280 Z" fill="#475569" opacity="0.3" />

          <!-- Golden Sun rise light -->
          <circle cx="360" cy="240" r="50" fill="#fed7aa" opacity="0.8" />
          <circle cx="360" cy="240" r="80" fill="#ffedd5" opacity="0.4" />

          <!-- Water horizon line -->
          <line x1="0" y1="280" x2="800" y2="280" stroke="#cbd5e1" stroke-width="2" />

          <!-- Pine trees on shores -->
          <path d="M40 280 L60 210 L80 280 Z" fill="#334155" opacity="0.6" />
          <path d="M55 280 L70 220 L85 280 Z" fill="#1e293b" opacity="0.7" />
          <path d="M720 280 L740 200 L760 280 Z" fill="#334155" opacity="0.6" />

          <!-- Waves ripples on water -->
          <path d="M100 310 Q200 305 300 310 T500 310 T700 310" stroke="#cbd5e1" stroke-width="1.5" fill="none" />
          <path d="M50 340 Q220 335 390 340 T730 340" stroke="${color}" stroke-width="1" stroke-dasharray="15 8" opacity="0.5" fill="none" />
          <path d="M120 380 Q320 375 520 380 T790 380" stroke="${color}" stroke-width="1.5" stroke-dasharray="30 15" opacity="0.3" fill="none" />
          <path d="M10 410 Q250 405 490 410 T770 410" stroke="#94a3b8" stroke-width="1" opacity="0.4" fill="none" />

          <!-- Jumping Bass fish leaping from water -->
          <g transform="translate(560, 240) scale(0.95)">
            <path d="M-40 60 C-20 60 -10 -10 -40 -30" stroke="#94a3b8" stroke-width="2.5" fill="none" opacity="0.7" />
            <path d="M40 60 C20 60 10 -10 40 -30" stroke="#94a3b8" stroke-width="2.5" fill="none" opacity="0.7" />
            <circle cx="-15" cy="10" r="3" fill="#cbd5e1" />
            <circle cx="20" cy="15" r="2.5" fill="#e2e8f0" />
            <circle cx="2" cy="-10" r="3.5" fill="#94a3b8" />

            <path d="M-40 40 C-25 15 -10 -5 20 -15 C45 -22 80 -10 90 20 C65 25 35 15 10 12 C-15 10 -30 25 -40 40 Z" fill="${color}" style="fill: url(#primaryAccentGrad_cover);" />
            <path d="M-35 35 C-15 12 10 8 30 15 C50 20 70 25 82 23 C70 12 40 8 20 -12" fill="#f8fafc" opacity="0.9" />
            <path d="M-40 40 L-65 30 L-55 50 L-68 62 L-40 46 Z" fill="${color}" />
            <path d="M25 10 L10 25 L32 20 Z" fill="${color}" opacity="0.8" />
            <path d="M60 18 L55 32 L68 25 Z" fill="#64748b" />
            <circle cx="75" cy="10" r="3" fill="#ffffff" />
            <circle cx="75" cy="10" r="1.5" fill="#000000" />
            <path d="M62 4 C66 4 68 10 65 14" stroke="#475569" stroke-width="1.5" fill="none" />
          </g>

          <!-- Fisherman Silhouette standing casting -->
          <g transform="translate(180, 240)">
            <path d="M-70 40 C-40 40 60 40 100 35 C70 50 -40 50 -70 40 Z" fill="#334155" />
            <path d="M12 40 C12 25 18 20 18 15 C18 10 24 8 28 8 C32 8 38 12 38 18 C38 24 35 30 35 40 Z" fill="#1e293b" />
            <path d="M24 7 C24 3 32 3 32 7 Z" fill="#1e293b" />
            <ellipse cx="28" cy="7" rx="10" ry="1.5" fill="#1e293b" />
            <path d="M35 18 L190 -80 C200 -85 220 -82 230 -60" stroke="#0f172a" stroke-width="2.5" fill="none" />
            <path d="M230 -60 C260 -10 325 10 400 40" stroke="#e2e8f0" stroke-width="1.2" fill="none" opacity="0.75" />
          </g>

          <!-- Professional Header Text -->
          <rect x="240" y="25" width="320" height="34" rx="17" fill="white" fill-opacity="0.9" />
          <circle cx="260" cy="42" r="6" fill="${color}" />
          <text x="268" y="47" fill="#1e293b" font-size="13" font-weight="bold" font-family="sans-serif" letter-spacing="1">
            鱼佬圈 · LEG新手装备与实战分享
          </text>
        </svg>`;

    case "rod":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          <path d="M0 50 H600 M0 100 H600 M0 150 H600 M0 200 H600 M0 250 H600 M0 300 H600" stroke="#000000" stroke-opacity="0.03" stroke-width="1" />
          <path d="M100 0 V338 M200 0 V338 M300 0 V338 M400 0 V338 M500 0 V338" stroke="#000000" stroke-opacity="0.03" stroke-width="1" />

          <rect x="30" y="270" width="130" height="22" rx="4" fill="#d97706" opacity="0.8" />
          <rect x="40" y="270" width="110" height="22" fill="#f59e0b" opacity="0.6" />
          <line x1="55" y1="270" x2="55" y2="292" stroke="#b45309" stroke-width="1" />
          <line x1="75" y1="270" x2="75" y2="292" stroke="#b45309" stroke-width="1" />
          <line x1="95" y1="270" x2="95" y2="292" stroke="#b45309" stroke-width="1" />
          <line x1="115" y1="270" x2="115" y2="292" stroke="#b45309" stroke-width="1" />
          <line x1="135" y1="270" x2="135" y2="292" stroke="#b45309" stroke-width="1" />

          <rect x="160" y="267" width="45" height="28" rx="2" fill="#334155" />
          <rect x="168" y="270" width="28" height="22" fill="#1e293b" />
          <rect x="205" y="274" width="6" height="14" fill="#fbbf24" />
          <rect x="154" y="274" width="6" height="14" fill="#fbbf24" />

          <rect x="211" y="272" width="30" height="18" rx="3" fill="#d97706" />

          <line x1="241" y1="281" x2="540" y2="60" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
          <line x1="250" y1="280" x2="538" y2="61" stroke="#475569" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" />

          <g transform="translate(300, 237) rotate(-36)">
            <path d="M0 0 L15 -25 L35 -20 L15 0 Z" fill="#64748b" />
            <circle cx="23" cy="-21" r="14" fill="#334155" stroke="#94a3b8" stroke-width="2" />
            <circle cx="23" cy="-21" r="10" fill="#0f172a" />
          </g>

          <g transform="translate(390, 171) rotate(-36)">
            <path d="M0 0 L10 -18 L24 -14 L10 0 Z" fill="#64748b" />
            <circle cx="16" cy="-15" r="10" fill="#334155" stroke="#94a3b8" stroke-width="1.5" />
            <circle cx="16" cy="-15" r="7" fill="#0f172a" />
          </g>

          <g transform="translate(470, 112) rotate(-36)">
            <path d="M0 0 L8 -12 L16 -9 L8 0 Z" fill="#64748b" />
            <circle cx="11" cy="-10" r="7" fill="#334155" stroke="#94a3b8" stroke-width="1" />
            <circle cx="11" cy="-10" r="4.5" fill="#0f172a" />
          </g>

          <circle cx="538" cy="61" r="4" fill="#64748b" />
          <path d="M536 63 L544 57" stroke="#1e293b" stroke-width="2" />

          <path d="M220 285 Q300 190 318 200 T406 142 T481 92 T538 61 C550 55 580 40 590 35" stroke="${color}" stroke-width="1.5" fill="none" stroke-dasharray="3 3" />

          <g transform="translate(40, 50)">
            <rect width="180" height="90" rx="10" fill="white" fill-opacity="0.95" />
            <text x="15" y="26" fill="${color}" font-size="14" font-weight="bold" font-family="sans-serif">【直柄竿 (ML调)】</text>
            <text x="15" y="48" fill="#475569" font-size="11" font-family="sans-serif">• 全拔出长度: 1.98m / 2.1m最佳</text>
            <text x="15" y="65" fill="#475569" font-size="11" font-family="sans-serif">• 竿梢硬度 (Power): ML (中软)</text>
            <text x="15" y="80" fill="#475569" font-size="11" font-family="sans-serif">• 泛用拟饵克重: 3g - 15g</text>
          </g>
        </svg>`;

    case "reel":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          <circle cx="300" cy="170" r="120" stroke="${color}" stroke-opacity="0.04" stroke-width="2" />
          <circle cx="300" cy="170" r="80" stroke="${color}" stroke-opacity="0.06" stroke-width="1.5" />

          <g transform="translate(180, 40)">
            <path d="M120 20 L150 20 L150 35 L125 100 L108 100 L100 35 Z" fill="#475569" />
            <rect x="90" y="12" width="80" height="10" rx="3" fill="#1e293b" />

            <path d="M70 100 C70 85 85 75 105 75 C125 75 145 95 145 115 C145 140 120 160 90 160 C65 160 55 140 55 125 C55 110 65 100 70 100 Z" fill="#334155" stroke="#64748b" stroke-width="1.5" />
            <circle cx="100" cy="118" r="28" fill="#1e293b" />
            <circle cx="100" cy="118" r="18" fill="none" stroke="#fbbf24" stroke-width="2" />
            
            <path d="M100 100 L115 110 L130 90 L135 150 L110 160 L100 100 Z" fill="#64748b" opacity="0.3" />
            <path d="M140 85 C140 85 165 100 165 130 C165 140 155 165 155 165 L142 160 L148 130 L132 105 L140 85 Z" fill="#1e293b" />

            <path d="M152 70 C140 30 50 15 25 80" stroke="#94a3b8" stroke-width="3" fill="none" stroke-linecap="round" />
            <circle cx="152" cy="74" r="6" fill="#fbbf24" />

            <rect x="42" y="55" width="82" height="42" rx="4" fill="#0f172a" />
            <rect x="42" y="60" width="82" height="6" fill="#ca8a04" />
            <rect x="42" y="85" width="82" height="4" fill="#ca8a04" />
            <circle cx="55" cy="74" r="4" fill="#334155" />
            <circle cx="68" cy="74" r="4" fill="#334155" />
            <circle cx="81" cy="74" r="4" fill="#334155" />
            <circle cx="94" cy="74" r="4" fill="#334155" />
            <circle cx="107" cy="74" r="4" fill="#334155" />
            <rect x="48" y="68" width="71" height="12" fill="${color}" opacity="0.8" rx="1" />

            <path d="M42 63 L28 66 L28 86 L42 89 Z" fill="#475569" stroke="#1e293b" />
            <line x1="28" y1="76" x2="42" y2="76" stroke="#94a3b8" stroke-width="2.5" />

            <path d="M100 118 L140 158 L180 158 L185 148 L145 140 Z" fill="#64748b" />
            <circle cx="100" cy="118" r="6" fill="#fbbf24" />
            <rect x="175" y="142" width="8" height="32" rx="2" fill="#1e293b" />
            <path d="M170 174 C165 174 158 185 158 190 C158 198 170 205 182 205 C195 205 200 198 200 190 C200 185 192 174 188 174 Z" fill="#0f172a" />
          </g>

          <g transform="translate(360, 45)">
            <rect width="195" height="100" rx="12" fill="white" fill-opacity="0.95" />
            <text x="16" y="28" fill="${color}" font-size="14" font-weight="bold" font-family="sans-serif">【浅线杯纺车轮】</text>
            <text x="16" y="52" fill="#334155" font-size="11" font-family="sans-serif">• 轮号推荐: 2000型 / 2500型</text>
            <text x="16" y="70" fill="#334155" font-size="11" font-family="sans-serif">• 刹车阻泄力: 精密前置调节</text>
            <text x="16" y="87" fill="#64748b" font-size="10" font-family="sans-serif">优点：出线顺畅、绝不产生炒粉炸线</text>
          </g>
        </svg>`;

    case "line":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />

          <g transform="translate(40, 40)">
            <rect width="520" height="74" rx="12" fill="#ffffff" fill-opacity="0.9" stroke="${color}" stroke-opacity="0.15" />
            <text x="20" y="24" fill="${color}" font-size="12" font-weight="bold" font-family="sans-serif">新手核心：PE主线 ✕ 碳素前导结</text>
            <text x="20" y="44" fill="#64748b" font-size="11" font-family="sans-serif">主线提供极限拉力与灵敏鱼讯，碳素前导担当防磨和隐形保镖。</text>
            <text x="20" y="60" fill="#dc2626" font-size="11" font-weight="semibold" font-family="sans-serif">⚠️ 新手千万不要用单PE直连钩子，石头一割就断！</text>
          </g>

          <g transform="translate(0, 160)">
            <path d="M 10 -15 C 40 -15, 60 15, 100 15 C 130 15, 150 -15, 190 -15 C 220 -15, 240 15, 280 15 C 300 15, 310 5, 315 0" stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none" />
            <path d="M 10 15 C 40 15, 60 -15, 100 -15 C 130 -15, 150 15, 190 15 C 220 15, 240 -15, 280 -15 C 300 -15, 310 -5, 315 0" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9" />
            <path d="M 10 0 C 40 0, 80 5, 120 0 C 160 -5, 200 5, 240 0 C 270 0, 290 2, 315 0" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5" />
            
            <rect x="20" y="32" width="90" height="22" rx="4" fill="#334155" />
            <text x="32" y="47" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif">PE 编织主线</text>

            <g transform="translate(315, 0)">
              <path d="M 0 0 L 260 0" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" opacity="0.3" />
              <path d="M 0 0 L 260 0" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round" />

              <rect x="130" y="32" width="105" height="22" rx="4" fill="#475569" />
              <text x="140" y="47" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif">碳素前导线 (2.0#)</text>

              <ellipse cx="6" cy="0" rx="6" ry="12" fill="${color}" />
              <ellipse cx="14" cy="0" rx="6" ry="12" fill="#fbbf24" stroke="${color}" stroke-width="1" />
              <ellipse cx="22" cy="0" rx="6" ry="12" fill="${color}" />
              <ellipse cx="30" cy="0" rx="6" ry="12" fill="#fbbf24" stroke="${color}" stroke-width="1" />
              <ellipse cx="38" cy="0" rx="6" ry="12" fill="${color}" />
              <ellipse cx="46" cy="0" rx="6" ry="12" fill="#f59e0b" />
              <ellipse cx="54" cy="0" rx="4" ry="9" fill="${color}" />
              <circle cx="64" cy="-4" r="5" fill="#ca8a04" />
              <circle cx="72" cy="4" r="5" fill="${color}" />
              <circle cx="80" cy="-4" r="5" fill="#ca8a04" />

              <path d="M 84 -4 L 98 -16" stroke="${color}" stroke-width="3" stroke-linecap="round" />
              <path d="M 80 4 L 92 12" stroke="#475569" stroke-width="2.5" stroke-linecap="round" />
              
              <circle cx="40" cy="0" r="50" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 3" />
              <rect x="68" y="-60" width="100" height="20" rx="4" fill="#dc2626" />
              <text x="76" y="-46" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif">GT结 / 万能两线结</text>
            </g>
          </g>

          <g transform="translate(140, 275)">
            <text x="0" y="0" fill="#475569" font-size="11" font-family="sans-serif">主线：1.0号 PE线 (高拉力、无延性)</text>
            <text x="180" y="0" fill="#94a3b8" font-size="11" font-family="sans-serif">|</text>
            <text x="200" y="0" fill="#475569" font-size="11" font-family="sans-serif">前导线：2.0号 碳素线 (耐磨、水中隐形)</text>
          </g>
        </svg>`;

    case "minnow_pencil":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          
          <!-- Background grids and guides to evoke a technical sketch feel -->
          <path d="M0 60 H600 M0 120 H600 M0 180 H600 M0 240 H600 M0 300 H600" stroke="#000000" stroke-opacity="0.02" stroke-width="1" />
          <path d="M120 0 V338 M240 0 V338 M360 0 V338 M480 0 V338" stroke="#000000" stroke-opacity="0.02" stroke-width="1" />

          <defs>
            <linearGradient id="minnowGrad_special" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="#ef4444" />
              <stop offset="40%" stop-color="#f97316" />
              <stop offset="100%" stop-color="#eab308" />
            </linearGradient>
            <linearGradient id="pencilGrad_special" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="#3b82f6" />
              <stop offset="50%" stop-color="#a855f7" />
              <stop offset="100%" stop-color="#ec4899" />
            </linearGradient>
          </defs>

          <!-- 1. MINNOW LURE (浮水米诺) -->
          <g transform="translate(130, 85)">
            <!-- Plastic diving lip -->
            <path d="M 120 12 L 140 28 L 132 34 L 115 15 Z" fill="#ffffff" fill-opacity="0.6" stroke="#475569" stroke-width="1.2" />
            
            <!-- Minnow body -->
            <path d="M -80 5 C -55 -15, 10 -22, 70 -12 C 100 -7, 120 4, 120 12 C 120 20, 95 28, 65 28 C 25 28, -35 20, -80 5 Z" fill="#f97316" style="fill: url(#minnowGrad_special);" stroke="#1e293b" stroke-width="1.8" />
            
            <!-- Scale details and eyes -->
            <path d="M 0 -12 Q 10 -4, 20 -12 M 15 -10 Q 25 -2, 35 -10 M 30 -8 Q 40 0, 50 -8" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2" fill="none" />
            <circle cx="102" cy="4" r="7.5" fill="#facc15" stroke="#d97706" stroke-width="1" />
            <circle cx="104" cy="4" r="4" fill="#000000" />
            <circle cx="106" cy="2" r="1.5" fill="#ffffff" />
            
            <!-- Treble hooks with subtle sketch look -->
            <g transform="translate(0, 24)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -8 10 C -8 18, 8 18, 8 10" />
              <path d="M -8 10 L -6 12 M 8 10 L 6 12" />
            </g>
            <g transform="translate(70, 22)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -8 10 C -8 18, 8 18, 8 10" />
              <path d="M -8 10 L -6 12 M 8 10 L 6 12" />
            </g>
            
            <!-- Swim motion wave ripples-->
            <path d="M 130 12 C 145 6, 160 18, 175 12" stroke="${color}" stroke-opacity="0.5" stroke-width="1.5" fill="none" stroke-linecap="round" />
            <path d="M -90 5 Q -105 -5, -120 10 T -145 0" stroke="${color}" stroke-opacity="0.3" stroke-width="1" fill="none" stroke-dasharray="3 2" />

            <text x="-75" y="-22" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">米诺 (Minnow) · 仿生逃蹿</text>
          </g>

          <!-- 2. PENCIL LURE (水面系铅笔) -->
          <g transform="translate(370, 210)">
            <!-- Pencil body (sleek, no bill) -->
            <path d="M -90 -5 C -60 -18, 15 -18, 70 -8 C 90 -4, 105 4, 105 10 C 105 16, 90 20, 65 18 C 25 15, -45 10, -90 -5 Z" fill="#a855f7" style="fill: url(#pencilGrad_special);" stroke="#1e293b" stroke-width="1.8" />
            
            <!-- Eyes and line-tie -->
            <circle cx="85" cy="5" r="7" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
            <circle cx="87" cy="5" r="4" fill="#000000" />
            <circle cx="106" cy="10" r="4" fill="none" stroke="#475569" stroke-width="1.5" />
            
            <!-- Treble hooks -->
            <g transform="translate(-10, 15)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -8 10 C -8 18, 8 18, 8 10" />
            </g>
            <g transform="translate(60, 14)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -8 10 C -8 18, 8 18, 8 10" />
            </g>

            <!-- Walk the Dog "Z" shape path -->
            <path d="M -160 30 L -120 10 L -80 30 L -40 10 L 0 30" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="5 3" stroke-linecap="round" fill="none" opacity="0.8" />
            
            <text x="-80" y="-24" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">铅笔 (Pencil) · 水面“之”字飘逸</text>
          </g>

          <!-- Professional Legend Cover overlays -->
          <rect x="25" y="278" width="550" height="36" rx="6" fill="#ffffff" fill-opacity="0.9" stroke="${color}" stroke-opacity="0.1" />
          <circle cx="42" cy="296" r="4.5" fill="#ef4444" />
          <text x="54" y="300" fill="#475569" font-size="11" font-family="sans-serif">
            <tspan font-weight="bold" fill="#1e293b">操饵秘籍：</tspan>米诺重在“抽一停一”刺激顿口；铅笔依靠竿梢微松规律点抖，引爆水面爆水！
          </text>
        </svg>`;

    case "crank_vib":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          
          <path d="M0 60 H600 M0 120 H600 M0 180 H600 M0 240 H600 M0 300 H600" stroke="#000000" stroke-opacity="0.02" stroke-width="1" />
          <path d="M120 0 V338 M240 0 V338 M360 0 V338 M480 0 V338" stroke="#000000" stroke-opacity="0.02" stroke-width="1" />

          <defs>
            <linearGradient id="crankGrad_special" x1="0%" y1="0%" x2="100%" y2="55%">
              <stop offset="0%" stop-color="#84cc16" />
              <stop offset="50%" stop-color="#eab308" />
              <stop offset="100%" stop-color="#ca8a04" />
            </linearGradient>
            <linearGradient id="vibGrad_special" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="#3b82f6" />
              <stop offset="40%" stop-color="#e0f2fe" />
              <stop offset="100%" stop-color="#ef4444" />
            </linearGradient>
          </defs>

          <!-- 1. CRANKBAIT (避障小胖子) -->
          <g transform="translate(130, 95)">
            <!-- Massive diving lip -->
            <path d="M 68 15 L 115 50 L 98 62 L 56 22 Z" fill="#ffffff" fill-opacity="0.6" stroke="#334155" stroke-width="1.5" />
            
            <!-- Stubby Crank body -->
            <path d="M -60 10 C -45 -18, 15 -25, 60 -5 C 75 5, 75 22, 60 28 C 30 35, -25 32, -60 10 Z" fill="#ca8a04" style="fill: url(#crankGrad_special);" stroke="#1e293b" stroke-width="1.8" />
            
            <!-- Beautiful Eyes -->
            <circle cx="48" cy="4" r="8" fill="#ffffff" stroke="#eab308" stroke-width="1" />
            <circle cx="50" cy="4" r="4.5" fill="#000000" />
            <circle cx="52" cy="2" r="1.5" fill="#ffffff" />
            
            <!-- Front & back hooks -->
            <g transform="translate(5, 28)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -7 10 C -7 16, 7 16, 7 10" />
            </g>
            <g transform="translate(-56, 12)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -7 10 C -7 16, 7 16, 7 10" />
            </g>

            <!-- Vibration waves -->
            <path d="M 85 45 A 25 25 0 0 0 105 15" stroke="${color}" stroke-opacity="0.6" stroke-width="2" fill="none" />
            <path d="M 95 55 A 35 35 0 0 0 120 15" stroke="${color}" stroke-opacity="0.3" stroke-width="1.5" fill="none" />
            
            <text x="-65" y="-28" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">小胖子 (Crank) · 强力撞障撞石</text>
          </g>

          <!-- 2. VIB (全水层高频震颤) -->
          <g transform="translate(370, 205)">
            <!-- Sinking style, flat head tied from top -->
            <path d="M -70 12 C -60 -10, -10 -22, 45 -4 C 65 3, 75 14, 55 22 C 25 30, -35 25, -70 12 Z" fill="#2563eb" style="fill: url(#vibGrad_special);" stroke="#1e293b" stroke-width="1.8" />
            
            <!-- Tie point on back -->
            <circle cx="15" cy="-14" r="3.5" fill="none" stroke="#475569" stroke-width="1.8" />
            <line x1="15" y1="-14" x2="15" y2="-40" stroke="#475569" stroke-width="1.2" stroke-dasharray="3 2" />

            <!-- Large glowing fish eye -->
            <circle cx="48" cy="8" r="7.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="1" />
            <circle cx="50" cy="8" r="4" fill="#000000" />
            
            <!-- Sinking ripples surrounding VIB -->
            <path d="M 12 2 C 16 -4, 25 -4, 30 2" stroke="#fbbf24" stroke-width="1.5" fill="none" opacity="0.8" />
            <path d="M -2 2 C 2 -6, 12 -6, 16 2" stroke="#fbbf24" stroke-width="1.5" fill="none" opacity="0.8" />

            <g transform="translate(-25, 22)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -6 10 C -6 16, 6 16, 6 10" />
            </g>
            <g transform="translate(35, 23)" stroke="#334155" stroke-width="1.5" fill="none">
              <line x1="0" y1="0" x2="0" y2="12" />
              <path d="M -6 10 C -6 16, 6 16, 6 10" />
            </g>

            <text x="-65" y="-22" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">VIB (Vibration) · 全水层嗡嗡激怒</text>
          </g>

          <!-- Footer Tips -->
          <rect x="25" y="278" width="550" height="36" rx="6" fill="#ffffff" fill-opacity="0.9" stroke="${color}" stroke-opacity="0.1" />
          <circle cx="42" cy="296" r="4.5" fill="#f59e0b" />
          <text x="54" y="300" fill="#475569" font-size="11" font-family="sans-serif">
            <tspan font-weight="bold" fill="#1e293b">避障原理：</tspan>小胖子在游动时头部朝下，大勺状舌板会先触碰并弹开乱石，绝妙保护钩子不被卡死！
          </text>
        </svg>`;

    case "soft_jig":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          
          <path d="M0 60 H600 M0 120 H600 M0 180 H600 M0 240 H600 M0 300 H600" stroke="#000000" stroke-opacity="0.02" stroke-width="1" />
          <path d="M120 0 V338 M240 0 V338 M360 0 V338 M480 0 V338" stroke="#000000" stroke-opacity="0.02" stroke-width="1" />

          <!-- Bottom muddy slope line to represent crawling on bottom -->
          <path d="M 10 240 Q 300 230, 590 260 L 590 338 L 10 338 Z" fill="${color}" fill-opacity="0.02" />
          <line x1="0" y1="240" x2="600" y2="240" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 2" />

          <defs>
            <linearGradient id="jigheadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#94a3b8" />
              <stop offset="100%" stop-color="#475569" />
            </linearGradient>
            <linearGradient id="curlyTailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ca8a04" />
              <stop offset="70%" stop-color="#fbbf24" />
              <stop offset="100%" stop-color="#fef08a" />
            </linearGradient>
          </defs>

          <!-- Curvy Tail Soft Worm JIG Component -->
          <g transform="translate(180, 140)">
            <!-- Steel lead round jig head -->
            <circle cx="-25" cy="0" r="14" fill="#475569" style="fill: url(#jigheadGrad);" stroke="#1e293b" stroke-width="1.8" />
            <circle cx="-25" cy="-6" r="3.5" fill="#f8fafc" opacity="0.6" />
            <!-- Line tie loop -->
            <circle cx="-28" cy="-14" r="4.5" fill="none" stroke="#475569" stroke-width="1.8" />
            
            <!-- Hooks outline looping through body -->
            <path d="M -18 0 L 32 0 M 24 0 C 24 -24, 46 -24, 46 -6" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M 46 -6 L 43 -2" stroke="#1e293b" stroke-width="2" /> <!-- Hook barb -->
 
            <!-- Segmented Grub body -->
            <path d="M -15 -10 Q -5 -11, 4 -10 L 4 10 Q -5 11, -15 10 Z" fill="#ca8a04" style="fill: url(#curlyTailGrad);" stroke="#b45309" stroke-width="1" />
            <path d="M 4 -10 Q 12 -11, 20 -10 L 20 10 Q 12 11, 4 10 Z" fill="#ca8a04" style="fill: url(#curlyTailGrad);" stroke="#b45309" stroke-width="1" />
            <path d="M 20 -10 Q 28 -11, 35 -10 L 35 10 Q 28 11, 20 10 Z" fill="#ca8a04" style="fill: url(#curlyTailGrad);" stroke="#b45309" stroke-width="1" />
            <path d="M 35 -8 Q 40 -9, 45 -8 L 45 8 Q 40 9, 35 8 Z" fill="#ca8a04" style="fill: url(#curlyTailGrad);" stroke="#b45309" stroke-width="1" />
            <path d="M 45 -6 Q 48 -7, 52 -6 L 52 6 Q 48 7, 45 6 Z" fill="#ca8a04" style="fill: url(#curlyTailGrad);" stroke="#b45309" stroke-width="1" />

            <!-- Long elegant watercolor-style curly tail in motion -->
            <path d="M 52 0 C 60 -6, 75 -15, 95 -15 C 122 -15, 142 12, 122 24 C 105 34, 82 23, 80 10 C 78 -3, 98 -6, 110 -2 C 122 2, 115 18, 105 18" stroke="#ca8a04" stroke-width="8.5" fill="none" stroke-linecap="round" />
            <path d="M 95 10 C 100 6, 105 6, 110 10" stroke="#fef08a" stroke-width="1.8" fill="none" opacity="0.6" />

            <text x="-40" y="-35" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">铅头钩卷尾蛆 (Jighead with Curly Tail)</text>
            <text x="-40" y="-20" fill="#64748b" font-size="9" font-family="sans-serif">万能百搭 / 诱鱼极高 / 练习跳底神器</text>
          </g>

          <!-- Action path - Lift and Fall trajectory -->
          <g transform="translate(100, 180)" stroke-linecap="round">
            <path d="M 10 60 Q 90 0, 150 40 T 320 60" stroke="#84cc16" stroke-width="2" stroke-dasharray="4 3" fill="none" opacity="0.8" />
            
            <circle cx="10" cy="60" r="4" fill="#84cc16" />
            <text x="14" y="55" fill="#475569" font-size="9" font-family="sans-serif">【触底】</text>

            <path d="M 90 20 L 85 10 M 90 20 L 100 15" stroke="#475569" stroke-width="1.5" />
            <text x="96" y="8" fill="#16a34a" font-size="9" font-weight="bold" font-family="sans-serif">1. 挑竿 (Lift)</text>

            <path d="M 230 45 L 238 55 M 230 45 L 222 50" stroke="#475569" stroke-width="1.5" />
            <text x="240" y="53" fill="#b45309" font-size="9" font-weight="bold" font-family="sans-serif">2. 缓沉 (Fall & Roll)</text>
          </g>

          <rect x="25" y="278" width="550" height="36" rx="6" fill="#ffffff" fill-opacity="0.9" stroke="${color}" stroke-opacity="0.1" />
          <circle cx="42" cy="296" r="4.5" fill="#16a34a" />
          <text x="54" y="300" fill="#475569" font-size="11" font-family="sans-serif">
            <tspan font-weight="bold" fill="#1e293b">跳底妙处：</tspan>缓慢慢拖、小幅挑跳，卷尾会在泥浆边缘滑行蠕动，极易挑逗深水鲶鱼/大鲈鱼！
          </text>
        </svg>`;

    case "lures":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          
          <path d="M50 120 Q 300 80, 550 120" stroke="${color}" stroke-opacity="0.08" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M20 200 Q 300 160, 580 200" stroke="${color}" stroke-opacity="0.08" stroke-width="5" fill="none" stroke-linecap="round" />
          
          <g transform="translate(100, 110)">
            <path d="M 125 15 L 148 40 L 138 46 L 118 20 Z" fill="#94a3b8" opacity="0.4" stroke="#64748b" stroke-width="1" />

            <defs>
              <linearGradient id="minnowGrad_lures" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stop-color="#ef4444" />
                <stop offset="35%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="${color}" />
              </linearGradient>
              <linearGradient id="grubGrad_lures" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ca8a04" />
                <stop offset="70%" stop-color="#fef08a" />
                <stop offset="100%" stop-color="#fef9c3" />
              </linearGradient>
            </defs>

            <path d="M -60 10 C -40 -15, 20 -25, 80 -15 C 110 -10, 130 5, 130 15 C 130 25, 100 35, 70 35 C 30 35, -30 25, -60 10 Z" fill="#ef4444" style="fill: url(#minnowGrad_lures);" />

            <path d="M 20 -15 Q 30 -5, 40 -15 M 30 -15 Q 40 -5, 50 -15 M 40 -15 Q 50 -5, 60 -15" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5" fill="none" />
            <path d="M 10 5 Q 20 15, 30 5 M 20 5 Q 30 15, 40 5 M 30 5 Q 40 15, 50 5" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5" fill="none" />

            <circle cx="25" cy="5" r="5" fill="#000000" opacity="0.7" />

            <circle cx="110" cy="5" r="9" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
            <circle cx="108" cy="4" r="5" fill="#000000" />
            <circle cx="106" cy="2" r="1.5" fill="#ffffff" />

            <circle cx="132" cy="15" r="4.5" fill="none" stroke="#94a3b8" stroke-width="1.5" />

            <circle cx="20" cy="28" r="3" fill="none" stroke="#475569" stroke-width="1.5" />
            <circle cx="80" cy="25" r="3" fill="none" stroke="#475569" stroke-width="1.5" />

            <g transform="translate(20, 28) scale(0.9)">
              <line x1="0" y1="0" x2="0" y2="18" stroke="#475569" stroke-width="2" />
              <path d="M -10 12 C -10 24, 10 24, 10 12" stroke="#475569" stroke-width="2" fill="none" />
              <path d="M -10 12 L -7 14" stroke="#475569" stroke-width="2" />
              <path d="M 10 12 L 7 14" stroke="#475569" stroke-width="2" />
            </g>
            <g transform="translate(80, 25) scale(0.9)">
              <line x1="0" y1="0" x2="0" y2="18" stroke="#475569" stroke-width="2" />
              <path d="M -10 12 C -10 24, 10 24, 10 12" stroke="#475569" stroke-width="2" fill="none" />
              <path d="M -10 12 L -7 14" stroke="#475569" stroke-width="2" />
              <path d="M 10 12 L 7 14" stroke="#475569" stroke-width="2" />
            </g>

            <text x="30" y="-30" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">① 浮水米诺 (硬饵)</text>
          </g>

          <g transform="translate(360, 210)">
            <circle cx="-30" cy="0" r="12" fill="#64748b" stroke="#475569" stroke-width="1" />
            <circle cx="-30" cy="-6" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="-34" cy="-10" r="3" fill="none" stroke="#475569" stroke-width="1.5" />

            <path d="M -20 0 L 30 0" stroke="#334155" stroke-width="2" stroke-dasharray="3 2" />
            <path d="M 20 0 C 20 -20, 42 -20, 42 -5 L 42 0" stroke="#334155" stroke-width="2" fill="none" />
            <path d="M 42 -5 L 39 -1" stroke="#334155" stroke-width="2" />

            <path d="M -18 -8 Q -10 -9, -2 -8 L -2 8 Q -10 9, -18 8 Z" fill="#ca8a04" style="fill: url(#grubGrad_lures);" />
            <path d="M -2 -8 Q 5 -9, 12 -8 L 12 8 Q 5 9, -2 8 Z" fill="#ca8a04" style="fill: url(#grubGrad_lures);" />
            <path d="M 12 -8 Q 18 -9, 24 -8 L 24 8 Q 18 9, 12 8 Z" fill="#ca8a04" style="fill: url(#grubGrad_lures);" />
            <path d="M 24 -7 Q 28 -8, 32 -7 L 32 7 Q 28 8, 24 7 Z" fill="#ca8a04" style="fill: url(#grubGrad_lures);" />
            <path d="M 32 -6 Q 36 -7, 40 -6 L 40 6 Q 36 7, 32 6 Z" fill="#ca8a04" style="fill: url(#grubGrad_lures);" />

            <path d="M 40 0 C 44 -4, 52 -10, 68 -10 C 88 -10, 102 12, 85 24 C 70 34, 54 26, 52 14 C 50 2, 64 -2, 75 0 C 85 2, 80 14, 72 14" stroke="#ca8a04" stroke-width="6" fill="none" stroke-linecap="round" />
            <circle cx="5" cy="2" r="1.5" fill="#facc15" />
            <circle cx="20" cy="-4" r="1" fill="#facc15" />
            <circle cx="68" cy="-5" r="1.5" fill="#facc15" />
            <circle cx="80" cy="10" r="1.5" fill="#facc15" />

            <text x="-5" y="-35" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">② 卷尾蛆 ✕ 铅头钩 (百搭软饵组)</text>
          </g>

          <rect x="20" y="278" width="560" height="34" rx="6" fill="#f1f5f9" />
          <text x="35" y="299" fill="#475569" font-size="11" font-family="sans-serif">
            💡 战术划分：硬饵米诺适合中上层搜索探路；软饵德州/铅头蛆适合触底、搜暗礁障碍物。
          </text>
        </svg>`;

    case "accessories":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />

          <rect x="20" y="20" width="560" height="298" rx="10" fill="#ffffff" fill-opacity="0.4" />

          <g transform="translate(90, 160) rotate(-15)">
            <path d="M -15 -4 L -50 -5 C -65 -5, -65 5, -50 5 L -15 4 Z" fill="#94a3b8" />
            <path d="M -50 -5 L -56 -2 L -50 1" fill="#64748b" stroke="#334155" stroke-width="1" />
            <circle cx="-15" cy="0" r="6" fill="#475569" stroke="#cbd5e1" stroke-width="1.5" />
            <line x1="-18" y1="-3" x2="-12" y2="3" stroke="#ffffff" stroke-width="1" />

            <path d="M -15 -4 C 10 -8, 30 -30, 60 -30 C 70 -30, 80 -15, 75 -5 L 60 -10 C 40 -10, 10 -2, -15 -2 Z" fill="#eb5e28" />
            <path d="M -15 4 C 10 8, 30 30, 60 30 C 70 30, 80 15, 75 5 L 60 10 C 40 10, 10 2, -15 2 Z" fill="${color}" />

            <path d="M 75 -5 Q 110 -20, 120 10 T 150 0" stroke="#cbd5e1" stroke-width="2" fill="none" stroke-dasharray="30 5 10" />

            <text x="-35" y="-45" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">【路亚钳】无伤开双环、解钩专用</text>
          </g>

          <g transform="translate(320, 70)">
            <rect x="0" y="5" width="110" height="12" rx="2" fill="#475569" stroke="#334155" />
            
            <rect x="30" y="6" width="30" height="10" fill="#e2e8f0" />
            <line x1="45" y1="6" x2="45" y2="16" stroke="#94a3b8" stroke-width="1" />

            <rect x="80" y="0" width="16" height="22" rx="4" fill="#1e293b" />

            <rect x="110" y="2" width="75" height="18" rx="3" fill="#0f172a" />
            <line x1="125" y1="2" x2="125" y2="20" stroke="#334155" />
            <line x1="145" y1="2" x2="145" y2="20" stroke="#334155" />
            <line x1="165" y1="2" x2="165" y2="20" stroke="#334155" />

            <path d="M 185 11 Q 200 11, 210 25 T 225 35" stroke="#334155" stroke-width="2.5" fill="none" />

            <path d="M 0 5 C -15 2, -22 -10, -12 -12 L -2 -3 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.5" />
            <path d="M 0 17 C -15 20, -22 32, -12 34 L -2 25 Z" fill="#cbd5e1" stroke="#334155" stroke-width="1.5" />

            <text x="35" y="-12" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">【控鱼器】稳夹鱼唇防止挣扎扎手</text>
          </g>

          <g transform="translate(340, 210) scale(0.85)">
            <path d="M 10 30 C 10 15, 60 5, 80 20 C 100 5, 150 15, 150 30 C 150 65, 105 60, 80 50 C 55 60, 10 65, 10 30 Z" fill="#1e293b" />
            <path d="M 72 34 C 75 25, 85 25, 88 34" stroke="#475569" stroke-width="3.5" fill="none" />

            <defs>
              <linearGradient id="lensGrad" x1="0%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="50%" stop-color="#c084fc" />
                <stop offset="100%" stop-color="#f59e0b" />
              </linearGradient>
            </defs>
            <path d="M 14 30 C 14 19, 56 12, 70 24 C 74 44, 45 56, 18 50 C 14 42, 14 34, 14 30 Z" fill="#3b82f6" style="fill: url(#lensGrad);" />
            <path d="M 146 30 C 146 19, 104 12, 90 24 C 86 44, 115 56, 142 50 C 146 42, 146 34, 146 30 Z" fill="#3b82f6" style="fill: url(#lensGrad);" />

            <path d="M 22 24 L 56 42" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round" />
            <path d="M 98 24 L 132 42" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round" />

            <text x="-8" y="75" fill="#1e293b" font-size="13" font-weight="bold" font-family="sans-serif">【偏光反射镜】滤水面反射、透视鱼影踪迹</text>
          </g>

          <line x1="40" y1="285" x2="560" y2="285" stroke="#e2e8f0" stroke-width="1" />
          <text x="220" y="303" fill="#64748b" font-size="10" font-family="sans-serif" font-style="italic">
            —— 三大安全配件缺一不可：安全、体面、爆护保障 ——
          </text>
        </svg>`;

    case "casting":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          <path d="M0 50 H600 M0 100 H600 M0 150 H600 M0 200 H600 M0 250 H600 M0 300 H600" stroke="#000000" stroke-opacity="0.03" stroke-width="1" />
          <path d="M100 0 V338 M200 0 V338 M300 0 V338 M400 0 V338 M500 0 V338" stroke="#000000" stroke-opacity="0.03" stroke-width="1" />

          <!-- Sun light -->
          <circle cx="500" cy="180" r="40" fill="#fed7aa" opacity="0.3" />

          <!-- Mountains far away -->
          <path d="M400 240 L480 180 L560 240 Z" fill="#94a3b8" opacity="0.2" />
          <path d="M460 240 L540 160 L620 240 Z" fill="#475569" opacity="0.15" />

          <!-- Land/Water dividing line -->
          <line x1="0" y1="240" x2="600" y2="240" stroke="#cbd5e1" stroke-width="2" />
          <!-- Water ripples -->
          <path d="M50 260 Q150 255 250 260 T450 260" stroke="${color}" stroke-opacity="0.25" stroke-width="1" fill="none" />
          <path d="M120 290 Q270 285 410 290 T580 290" stroke="${color}" stroke-opacity="0.15" stroke-width="1" fill="none" />

          <!-- Silhouette of casting fisherman -->
          <g transform="translate(100, 160)">
            <ellipse cx="28" cy="10" rx="9" ry="1.5" fill="#334155" opacity="0.4" />
            <!-- Feet and legs -->
            <path d="M12 80 C12 60 16 50 18 45 L20 80 Z" fill="#1e293b" />
            <path d="M28 80 C28 60 30 50 32 45 L34 80 Z" fill="#1e293b" />
            <!-- Body -->
            <path d="M10 45 C10 25 18 15 28 15 C38 15 42 25 38 45 Z" fill="#1e293b" />
            <!-- Head with hat -->
            <circle cx="28" cy="5" r="7" fill="#1e293b" />
            <ellipse cx="28" cy="4" rx="12" ry="2" fill="#0f172a" />
            <!-- Fishing rod held in hand, showing dynamic bend of overhead casting back-angle -->
            <path d="M 32 30 L 100 -20 Q 150 -40, 210 -10" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M 100 -20 Q 150 -40, 115 -10" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3 3" fill="none" />
            
            <!-- Casting trajectory line (Dotted curve) -->
            <path d="M 210 -10 Q 300 -90, 480 80" stroke="${color}" stroke-width="2" stroke-dasharray="5 4" fill="none" />
            
            <!-- Splash of lure hitting water -->
            <g transform="translate(480, 80) scale(0.6)">
              <circle cx="0" cy="0" r="1.5" fill="${color}" />
              <path d="M-10 -5 Q0 -20 10 -5" stroke="${color}" stroke-width="1.5" fill="none" />
              <path d="M-20 0 L20 0" stroke="${color}" stroke-width="1.5" />
            </g>
          </g>

          <g transform="translate(40, 40)">
            <rect width="210" height="90" rx="10" fill="white" fill-opacity="0.95" />
            <text x="15" y="26" fill="${color}" font-size="14" font-weight="bold" font-family="sans-serif">【过头抛与侧抛】</text>
            <text x="15" y="48" fill="#475569" font-size="11" font-family="sans-serif">• 蓄力：竿梢向后挥动一瞬间满弓</text>
            <text x="15" y="65" fill="#475569" font-size="11" font-family="sans-serif">• 释放：在10点钟位置松指抛出</text>
            <text x="15" y="80" fill="#475569" font-size="11" font-family="sans-serif">• 侧抛：适合重障碍下的平射落点</text>
          </g>
        </svg>`;

    case "actions":
      return `<svg viewBox="0 0 600 338" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; border-radius: 8px;">
          <rect width="600" height="338" fill="${secondary}" rx="8" />
          <path d="M0 50 H600 M0 100 H600 M0 150 H600 M0 200 H600 M0 250 H600 M0 300 H600" stroke="#000000" stroke-opacity="0.03" stroke-width="1" />
          <path d="M100 0 V338 M200 0 V338 M300 0 V338 M400 0 V338 M500 0 V338" stroke="#000000" stroke-opacity="0.03" stroke-width="1" />

          <!-- Water Surface line (Split view, underwater display) -->
          <line x1="0" y1="120" x2="600" y2="120" stroke="#94a3b8" stroke-width="2.5" />
          <path d="M0 120 C150 115, 300 125, 450 120 T600 120" stroke="${color}" stroke-opacity="0.6" stroke-width="1.5" fill="none" />

          <!-- Deep water shading -->
          <rect y="121" width="600" height="217" fill="${color}" fill-opacity="0.06" />

          <!-- Underwater structures / weeds -->
          <path d="M40 338 Q60 250 30 180 T70 121" stroke="#16a34a" stroke-width="3" stroke-opacity="0.3" fill="none" />
          <path d="M500 338 Q540 270 510 200 T530 121" stroke="#16a34a" stroke-width="2.5" stroke-opacity="0.25" fill="none" />

          <!-- Wave motion action line showing "Twitch / Pause" -->
          <path d="M100 150 Q160 220 220 160 T340 230 T460 180" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4" stroke-linecap="round" fill="none" />
          
          <!-- Text annotations directly on the curve path points -->
          <rect x="135" y="195" width="40" height="15" rx="3" fill="#ef4444" />
          <text x="141" y="206" fill="#ffffff" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" transform="translate(18, 0)">抽</text>

          <rect x="235" y="145" width="40" height="15" rx="3" fill="#3b82f6" />
          <text x="241" y="155" fill="#ffffff" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" transform="translate(18, 0)">停</text>
          
          <rect x="335" y="225" width="45" height="15" rx="3" fill="#16a34a" />
          <text x="340" y="235" fill="#ffffff" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" transform="translate(20, 0)">慢拖</text>

          <!-- Small fish swimming looking at bait -->
          <g transform="translate(480, 240) scale(0.65)">
            <path d="M-40 40 C-15 10 10 8 30 15 C50 20 70 25 82 23 C70 12 40 8 20 -12 C-15 -10 -30 25 -40 40 Z" fill="#334155" />
            <path d="M-40 40 L-65 30 L-55 50 L-40 46 Z" fill="#1e293b" />
            <circle cx="25" cy="10" r="3" fill="#ffffff" />
            <circle cx="25" cy="10" r="1.5" fill="#000000" />
          </g>

          <!-- Little dynamic Minnow lure moving on the action path -->
          <g transform="translate(300, 205) rotate(25) scale(0.6)">
            <rect x="-30" y="-8" width="60" height="16" rx="6" fill="#e11d48" />
            <path d="M30 0 L45 -12 L45 12 Z" fill="#f43f5e" />
            <circle cx="-15" cy="-2" r="3" fill="#000000" />
            <circle cx="-16" cy="-3" r="1.5" fill="#ffffff" />
          </g>

          <g transform="translate(40, 30)">
            <rect width="215" height="74" rx="10" fill="white" fill-opacity="0.95" />
            <text x="15" y="24" fill="${color}" font-size="14" font-weight="bold" font-family="sans-serif">【控饵技巧：水中骗术】</text>
            <text x="15" y="44" fill="#475569" font-size="11" font-family="sans-serif">• 抽停结合：模仿负伤鱼儿引逗翘嘴</text>
            <text x="15" y="60" fill="#475569" font-size="11" font-family="sans-serif">• 跳底慢拖：使尾巴晃动触底挑逗底栖</text>
          </g>
        </svg>`;

    default:
      return "";
  }
}
