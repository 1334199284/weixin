import React, { useState, useEffect, useRef } from "react";
import { X, Crop, Move, ZoomIn, ZoomOut, Check, RefreshCw, RefreshCw as ResetIcon } from "lucide-react";

interface WeChatCoverCropperProps {
  imageSrc: string; // Base64 or external proxied URL
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImgBase64: string) => void;
}

interface CropBox {
  x: number; // in displayed pixels
  y: number;
  width: number;
  height: number;
}

export const WeChatCoverCropper: React.FC<WeChatCoverCropperProps> = ({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}) => {
  const [activeMode, setActiveMode] = useState<"banner" | "square">("banner");
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);

  // Original natural dimensions of the image loaded
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  // Scaled dimensions as rendered inside the cropping container
  const [displayW, setDisplayW] = useState(0);
  const [displayH, setDisplayH] = useState(0);

  // Bounds of the draggable cropping rectangle (in displayW/displayH pixels)
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // State for dragging/resizing interaction
  const [dragAction, setDragAction] = useState<"move" | "tl" | "tr" | "bl" | "br" | null>(null);
  const dragStartRef = useRef({
    clientX: 0,
    clientY: 0,
    boxX: 0,
    boxY: 0,
    boxW: 0,
    boxH: 0,
  });

  const bannerRatio = 900 / 383; // 2.35:1
  const squareRatio = 1 / 1; // 1:1
  const activeRatio = activeMode === "banner" ? bannerRatio : squareRatio;

  // Outer bounds configuration for fitting image
  const MAX_VIEW_W = 520;
  const MAX_VIEW_H = 320;

  // Use natural Image standard loader to prevent React cached image .onLoad bugs
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    setLoading(true);
    setErrorLoading(null);

    const img = new Image();
    // Support cross-origins
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setLoading(false);
    };

    img.onerror = () => {
      // Clean fallback if proxy fails on certain aggressive CORS
      const fallbackImg = new Image();
      fallbackImg.src = imageSrc; // try without anonymous crossOrigin flag
      fallbackImg.onload = () => {
        setNaturalWidth(fallbackImg.naturalWidth);
        setNaturalHeight(fallbackImg.naturalHeight);
        setLoading(false);
      };
      fallbackImg.onerror = () => {
        setErrorLoading("无法加载并解析该图片，请确保网络正常或尝试换回 JPG/PNG 格式。");
        setLoading(false);
      };
    };
  }, [imageSrc, isOpen]);

  // Handle auto scaling image and matching crop rectangle on load / format selection
  useEffect(() => {
    if (loading || naturalWidth === 0 || naturalHeight === 0) return;

    // Calculate maximum fitted box containing the image naturally
    const imgAspect = naturalWidth / naturalHeight;

    let dW = MAX_VIEW_W;
    let dH = MAX_VIEW_W / imgAspect;

    if (dH > MAX_VIEW_H) {
      dH = MAX_VIEW_H;
      dW = MAX_VIEW_H * imgAspect;
    }

    setDisplayW(dW);
    setDisplayH(dH);

    // Default configuration:
    // "切图默认图片过宽展示多宽，默认展示在顶部"
    // -> If image aspect ratio is wider than target crop ratio:
    // Fits height, and centers or displays full-width.
    // If we want it to fit width by default and show at the top:
    let cropW = 0;
    let cropH = 0;

    if (imgAspect > activeRatio) {
      // Image is wider than crop box aspect ratio.
      // Height can fill the image height completely:
      cropH = dH;
      cropW = cropH * activeRatio;
    } else {
      // Image is taller or equal
      cropW = dW;
      cropH = cropW / activeRatio;
    }

    // Default showing at the top ("默认展示在顶部"): y is 0
    const cropX = (dW - cropW) / 2;
    const cropY = 0; // Top Aligned!

    setCropBox({
      x: Math.max(0, cropX),
      y: cropY,
      width: Math.min(dW, cropW),
      height: Math.min(dH, cropH),
    });
  }, [loading, naturalWidth, naturalHeight, activeMode]);

  // Start drag/resize actions
  const handlePointerDown = (
    e: React.PointerEvent,
    action: "move" | "tl" | "tr" | "bl" | "br"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLDivElement;
    try {
      target.setPointerCapture(e.pointerId);
    } catch (err) {}

    setDragAction(action);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height,
    };
  };

  // Perform smooth dragging calculations
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragAction) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    const { boxX, boxY, boxW, boxH } = dragStartRef.current;
    const R = activeRatio;

    if (dragAction === "move") {
      // Dragging the entire cropping rectangle
      let nextX = boxX + dx;
      let nextY = boxY + dy;

      // Restrict within image borders
      nextX = Math.max(0, Math.min(displayW - boxW, nextX));
      nextY = Math.max(0, Math.min(displayH - boxH, nextY));

      setCropBox((prev) => ({ ...prev, x: nextX, y: nextY }));
    } else {
      // Dragging handles to resize (and preserving strict ratio)
      let nextW = boxW;
      let nextH = boxH;
      let nextX = boxX;
      let nextY = boxY;

      const MIN_SIZE = 40;

      if (dragAction === "br") {
        // Bottom-Right handle
        nextW = boxW + dx;
        nextH = nextW / R;

        if (nextX + nextW > displayW) {
          nextW = displayW - nextX;
          nextH = nextW / R;
        }
        if (nextY + nextH > displayH) {
          nextH = displayH - nextY;
          nextW = nextH * R;
        }

        if (nextW >= MIN_SIZE && nextH >= MIN_SIZE) {
          setCropBox((prev) => ({ ...prev, width: nextW, height: nextH }));
        }
      } 
      else if (dragAction === "br" || dragAction === "tr") {
        // Top-Right handle: moves Y and changes height and width
        nextW = boxW + dx;
        nextH = nextW / R;
        nextY = boxY + (boxH - nextH);

        if (nextX + nextW > displayW) {
          nextW = displayW - nextX;
          nextH = nextW / R;
          nextY = boxY + (boxH - nextH);
        }
        if (nextY < 0) {
          nextY = 0;
          nextH = boxY + boxH;
          nextW = nextH * R;
        }

        if (nextW >= MIN_SIZE && nextH >= MIN_SIZE && nextY >= 0) {
          setCropBox({ x: nextX, y: nextY, width: nextW, height: nextH });
        }
      }
      else if (dragAction === "tl") {
        // Top-Left handle: shifts both X and Y
        nextW = boxW - dx;
        nextH = nextW / R;
        nextX = boxX + (boxW - nextW);
        nextY = boxY + (boxH - nextH);

        if (nextX < 0) {
          nextX = 0;
          nextW = boxX + boxW;
          nextH = nextW / R;
          nextY = boxY + (boxH - nextH);
        }
        if (nextY < 0) {
          nextY = 0;
          nextH = boxY + boxH;
          nextW = nextH * R;
          nextX = boxX + (boxW - nextW);
        }

        if (nextW >= MIN_SIZE && nextH >= MIN_SIZE && nextX >= 0 && nextY >= 0) {
          setCropBox({ x: nextX, y: nextY, width: nextW, height: nextH });
        }
      }
      else if (dragAction === "bl") {
        // Bottom-Left handle: shifts X and increases height
        nextW = boxW - dx;
        nextH = nextW / R;
        nextX = boxX + (boxW - nextW);

        if (nextX < 0) {
          nextX = 0;
          nextW = boxX + boxW;
          nextH = nextW / R;
        }
        if (nextY + nextH > displayH) {
          nextH = displayH - nextY;
          nextW = nextH * R;
          nextX = boxX + (boxW - nextW);
        }

        if (nextW >= MIN_SIZE && nextH >= MIN_SIZE && nextX >= 0) {
          setCropBox({ x: nextX, y: nextY, width: nextW, height: nextH });
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragAction) return;
    const target = e.currentTarget as HTMLDivElement;
    try {
      target.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setDragAction(null);
  };

  // Canvas drawing & High quality JPEG encoding output
  const handleConfirmCrop = () => {
    if (naturalWidth === 0 || naturalHeight === 0 || displayW === 0 || displayH === 0) return;

    const scaleX = naturalWidth / displayW;
    const scaleY = naturalHeight / displayH;

    // Convert cropBox display-coords to original natural source-coords
    const sourceX = cropBox.x * scaleX;
    const sourceY = cropBox.y * scaleY;
    const sourceW = cropBox.width * scaleX;
    const sourceH = cropBox.height * scaleY;

    // Output dimensions (WeChat standards)
    const outW = activeMode === "banner" ? 900 : 500;
    const outH = activeMode === "banner" ? 383 : 500;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background fill (white)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);

    try {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const originImg = imageRef.current;
      if (originImg) {
        ctx.drawImage(
          originImg,
          sourceX,
          sourceY,
          sourceW,
          sourceH,
          0,
          0,
          outW,
          outH
        );

        const base64Out = canvas.toDataURL("image/jpeg", 0.9);
        onCropComplete(base64Out);
        onClose();
      }
    } catch (err) {
      console.error("Cropping canvas draw failed:", err);
      alert("本地图片截取失败，可能是因为图片文件限制，您可以直接尝试在剪裁框点击取消并重新上传。");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Header Heading */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-gray-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Crop className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">微信封面智能裁切</h3>
              <p className="text-xs text-gray-500 font-medium">拖拽剪切框或调节其大小，完美契合微信公众号比例</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 flex flex-col items-center justify-center">
          
          {/* Mode Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl w-full max-w-md">
            <button
              onClick={() => setActiveMode("banner")}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition duration-200 ${
                activeMode === "banner"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-950"
              }`}
            >
              2.35:1 单图封面 (900x383)
            </button>
            <button
              onClick={() => setActiveMode("square")}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition duration-200 ${
                activeMode === "square"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-950"
              }`}
            >
              1:1 分享/次条 (500x500)
            </button>
          </div>

          {/* Interactive Workspace Area */}
          <div className="relative w-full flex items-center justify-center min-h-[300px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner p-4">
            
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-300 gap-3">
                <RefreshCw className="h-7 w-7 animate-spin text-emerald-500" />
                <span className="text-xs font-bold text-gray-400">正在分析原始图片结构...</span>
              </div>
            )}

            {errorLoading && (
              <div className="text-center p-6 space-y-3 bg-red-950/40 text-red-300 border border-red-900/40 rounded-2xl max-w-sm">
                <p className="text-xs font-medium leading-relaxed">{errorLoading}</p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  重试
                </button>
              </div>
            )}

            {!loading && !errorLoading && displayW > 0 && (
              <div
                className="relative select-none touch-none shadow-lg border border-slate-700"
                style={{
                  width: `${displayW}px`,
                  height: `${displayH}px`,
                }}
              >
                {/* 1. Underlying Natural Image */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop Target"
                  draggable={false}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover pointer-events-none select-none"
                />

                {/* 2. Semi-transparent backdrop shadow mask outside the cropBox */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* SVG overlay to render high-performance transparent hollow-rect mask */}
                  <svg className="absolute inset-0 w-full h-full">
                    <defs>
                      <mask id="hollow-mask">
                        {/* Anything white is shown, black is masked (transparent) */}
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect
                          x={cropBox.x}
                          y={cropBox.y}
                          width={cropBox.width}
                          height={cropBox.height}
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill="rgba(0, 0, 0, 0.70)"
                      mask="url(#hollow-mask)"
                    />
                  </svg>
                </div>

                {/* 3. Draggable & Resizable Cropping Rectangle Overlay */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, "move")}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="absolute cursor-move border-[2px] border-emerald-400 group active:border-emerald-300"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.width}px`,
                    height: `${cropBox.height}px`,
                    boxShadow: "0 0 16px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                    <div className="border-b border-r border-emerald-400/30" />
                    <div className="border-b border-r border-emerald-400/30" />
                    <div className="border-b border-emerald-400/30" />
                    <div className="border-b border-r border-emerald-400/30" />
                    <div className="border-b border-r border-emerald-400/30" />
                    <div className="border-b border-emerald-400/30" />
                  </div>

                  {/* Corner Resize Handles */}
                  {/* Top-Left */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, "tl")}
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full cursor-nwse-resize z-30 shadow-sm flex items-center justify-center hover:scale-130 transition-transform"
                  />
                  {/* Top-Right */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, "tr")}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full cursor-nesw-resize z-30 shadow-sm flex items-center justify-center hover:scale-130 transition-transform"
                  />
                  {/* Bottom-Left */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, "bl")}
                    className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full cursor-nesw-resize z-30 shadow-sm flex items-center justify-center hover:scale-130 transition-transform"
                  />
                  {/* Bottom-Right */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, "br")}
                    className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full cursor-nwse-resize z-30 shadow-sm flex items-center justify-center hover:scale-130 transition-transform"
                  />
                </div>

              </div>
            )}
          </div>

          {/* Guidelines info */}
          {!loading && !errorLoading && (
            <div className="w-full max-w-md text-center p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-[11px] text-gray-500 font-bold leading-relaxed flex items-center justify-center gap-1.5">
              <span>💡</span>
              <span>
                按住<b>剪切框中间</b>可自由拖动；拖动<b>四个角的绿色圆点</b>可缩放裁剪尺寸。
              </span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/70 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-650 rounded-xl text-xs font-bold transition duration-150-all shadow-3xs"
          >
            取消
          </button>
          <button
            onClick={handleConfirmCrop}
            disabled={loading || errorLoading || displayW === 0}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition duration-150-all flex items-center gap-1.5 shadow-sm"
          >
            <Check className="h-4 w-4" />
            确认裁剪
          </button>
        </div>

      </div>
    </div>
  );
};
