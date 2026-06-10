import React from "react";
import { ThemePreset } from "../types";
import { WECHAT_THEMES } from "../lib/wechat-themes";
import { getFishingVectorSvgString } from "../lib/vector-illustrations";

interface FishingVectorProps {
  id: string; // 'cover' | 'rod' | 'reel' | 'line' | 'lures' | 'accessories'
  themeId: ThemePreset;
  className?: string;
}

export default function FishingVector({ id, themeId, className = "w-full h-full" }: FishingVectorProps) {
  const theme = WECHAT_THEMES[themeId];
  const color = theme.primaryColor;
  const secondary = theme.secondaryColor;

  const svgString = getFishingVectorSvgString(id, color, secondary);

  return (
    <div 
      className={`${className} select-none flex items-center justify-center w-full h-full`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
