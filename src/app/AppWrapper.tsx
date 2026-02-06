'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Loader from "@/components/ui/loading/Loader";
import LogoReveal from "@/components/ui/loading/LogoReveal";
import FooterReveal from '@/components/ui/FooterReveal';
import { Scene } from '@/components/canvas';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  // State management for loading sequence
  // If we are not on the home page, we skip the loading sequence explicitly
  // by marking everything as "done" or "ready" immediately.
  const [videoReady, setVideoReady] = useState(!isHome);
  const [loaderDone, setLoaderDone] = useState(!isHome);
  const [revealDone, setRevealDone] = useState(!isHome);

  // Callbacks to update state from child components
  const handleVideoReady = useCallback(() => setVideoReady(true), []);
  const handleLoaderFinished = useCallback(() => setLoaderDone(true), []);
  const handleRevealComplete = useCallback(() => setRevealDone(true), []);

  // Condition to trigger the LogoReveal animation
  const canReveal = loaderDone && videoReady;

  return (
    <>
      {/* --- Loading Sequence (Only on Home) --- */}
      {isHome && !revealDone && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* 1. The Loader. It now fades out to create an overlap. */}
          <div
            className={`absolute inset-0 z-20 transition-opacity duration-700 ease-out ${loaderDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
          >
            <Loader canFinish={videoReady} onFinished={handleLoaderFinished} />
          </div>

          {/* 2. The LogoReveal. It sits underneath the loader, ready to be revealed. */}
          <div className="absolute inset-0 z-10">
            <LogoReveal
              active={canReveal}
              onReady={handleVideoReady}
              onComplete={handleRevealComplete}
            />
          </div>
        </div>
      )}

      {/* --- Main Content and Footer Reveal Structure --- */}
      <div
        className={`transition-opacity duration-700 ${revealDone ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className='absolute w-full h-full z-10 bg-black'>
          <Scene canPlayAnimations={revealDone} />
        </div>
        {/* THE "CURTAIN" WRAPPER (Your footer settings are preserved) */}
        <div className="relative z-30  mb-[10vh] md:mb-[46vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {children}
        </div>

        {/* THE FIXED REVEAL FOOTER (Your component choice is preserved) */}
        <FooterReveal />
      </div>
    </>
  );
}
