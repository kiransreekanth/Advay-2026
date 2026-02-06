'use client';

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, useAnimation, animate } from "framer-motion";

type AssetType = "instant" | "fast" | "normal" | "heavy";

interface Asset {
  url: string;
  weight: AssetType;
  targetRange: [number, number];
}

const ASSET_MANIFEST: Asset[] = [
    { url: "HTTPS://ADVAY.IO/INIT/BOOT_SEQ/X/8821", weight: "fast", targetRange: [0, 12] },
    { url: "HTTPS://ADVAY.IO/CACHE/USER_PREFS/L/0021", weight: "instant", targetRange: [12, 28] },
    { url: "HTTPS://ADVAY.IO/CACHE/LOCAL_STORAGE/K/9912", weight: "instant", targetRange: [28, 42] },
    { url: "HTTPS://ADVAY.IO/SRC/MAIN_BUNDLE/J/JS_CORE", weight: "normal", targetRange: [42, 58] },
    { url: "HTTPS://ADVAY.IO/ASSETS/TEXTURES/HIGH_RES/PACK_01", weight: "heavy", targetRange: [58, 82] },
    { url: "HTTPS://ADVAY.IO/API/HANDSHAKE/SECURE_TOKEN", weight: "instant", targetRange: [82, 91] },
    { url: "HTTPS://ADVAY.IO/ASSETS/AUDIO/AMBIENCE/LOOP_WAV", weight: "normal", targetRange: [91, 96] },
    { url: "https://advay.in/complete/ready/z/fn_999xx0", weight: "instant", targetRange: [96, 100] },
];

export default function Loader({
  onFinished,
  canFinish,
}: {
  onFinished: () => void;
  canFinish: boolean;
}) {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);

  const barFillControls = useAnimation();
  const fullBarContainerControls = useAnimation();
  const textControls = useAnimation();
  const progressRef = useRef(0);

  const currentAsset = useMemo(() => ASSET_MANIFEST[currentAssetIndex], [currentAssetIndex]);

  useEffect(() => {
    let cancelled = false;
    const processQueue = async () => {
      for (let i = 0; i < ASSET_MANIFEST.length; i++) {
        if (cancelled) return;
        setCurrentAssetIndex(i);
        const asset = ASSET_MANIFEST[i];
        const [start, end] = asset.targetRange;
        const runStep = async (to: number, duration: number, ease: any = "linear") => {
          animate(progressRef.current, to, { duration, ease, onUpdate: (latest) => { progressRef.current = latest; setDisplayPercent(Math.floor(latest)); }, });
          await barFillControls.start({ width: `${to}%`, transition: { duration, ease } });
        };
        if (asset.weight === "instant") { const mid = start + (end - start) * 0.6; await runStep(mid, 0); await runStep(end, 0); } 
        else if (asset.weight === "fast") { await runStep(end, 0.3, "circOut"); }
        else if (asset.weight === "normal") { await runStep(end, 0.8, "easeInOut"); }
        else if (asset.weight === "heavy") { const stall = start + (end - start) * 0.7; await runStep(stall, 0.4, "easeOut"); await runStep(end - 2, 2.4, "linear"); await runStep(end, 0.2, "circOut"); }
      }
      setDisplayPercent(96);
      await barFillControls.start({ width: "96%", transition: { duration: 0.5, ease: "easeOut" } });
      while (!canFinish && !cancelled) { await new Promise((r) => setTimeout(r, 100)); }
      if (cancelled) return;

      await barFillControls.start({ width: "100%", transition: { duration: 0.4, ease: "circOut" } });
      setDisplayPercent(100);
      await new Promise(res => setTimeout(res, 200));
      if (cancelled) return;

      await textControls.start({ opacity: 0, transition: { duration: 0.3, ease: "easeOut" } });
      await fullBarContainerControls.start({ x: "100%", opacity: 0, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } });
      
      onFinished();
    };

    processQueue();
    return () => { cancelled = true; };
  }, [barFillControls, fullBarContainerControls, textControls, onFinished, canFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white text-black font-mono select-none cursor-wait flex items-center justify-center">
      <motion.div 
        className="relative w-full max-w-[92vw] sm:max-w-[70vw] lg:max-w-[50vw] px-4 sm:px-0"
        initial={{ opacity: 1 }}
        animate={textControls}
      >
        <div className="flex justify-center gap-2 mb-3 sm:hidden">
          <span className="text-[12px] animate-pulse inline-block translate-y-[-1px]">▶▶</span>
          <span className="text-[12px] uppercase tracking-tight tabular-nums">LOADING — {displayPercent}%</span>
        </div>

        <motion.div
          className="relative w-full h-[1.5px] sm:h-[1px] bg-black/10"
          initial={{ x: "0%", opacity: 1 }}
          animate={fullBarContainerControls}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={barFillControls}
            className="absolute top-0 left-0 h-full bg-black"
          />
        </motion.div>

        <div className="hidden sm:flex justify-between items-start mt-3 text-[10px] uppercase tracking-tight">
          <div className="flex items-center gap-2">
            <span className="text-[8px] animate-pulse inline-block translate-y-[-1px]">▶▶</span>
            <span className="tabular-nums">LOADING — {displayPercent}%</span>
          </div>
          <div className="flex-1 text-right truncate pl-6 opacity-50">{currentAsset?.url}</div>
        </div>

        <div className="hidden sm:flex mt-12 justify-center opacity-20">
          <span className="text-[9px] tracking-[0.4em] uppercase">{displayPercent >= 100 ? "[ SYNC COMPLETE ]" : "[ INITIALIZING ]"}</span>
        </div>
      </motion.div>

      {/* 💡 FIX: Apply the fade-out animation to the corner text elements */}
      <motion.div 
        className="absolute top-4 sm:top-8 left-4 sm:left-8 text-[9px] text-black/40 tracking-[0.2em] uppercase"
        initial={{ opacity: 1 }}
        animate={textControls}
      >
        Advay.2026
      </motion.div>
      <motion.div 
        className="absolute top-4 sm:top-8 right-4 sm:right-8 text-[9px] text-black/40 tracking-[0.2em] uppercase"
        initial={{ opacity: 1 }}
        animate={textControls}
      >
        v2.5.1_STABLE
      </motion.div>
      <motion.div 
        className="absolute bottom-4 sm:bottom-8 text-[9px] text-black/40 tracking-[0.2em] uppercase"
        initial={{ opacity: 1 }}
        animate={textControls}
      >
        Developed by MuLearn TIST
      </motion.div>
    </div>
  );
}
