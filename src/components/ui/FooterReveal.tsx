'use client';
import CipherText from './CipherText';

// This is the fixed part of the footer that is revealed on scroll.
export default function FooterReveal() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-[20vh] md:h-[46vh] z-0 flex flex-col justify-end bg-[#050000] overflow-hidden">
      
      {/* 1. GIANT BACKGROUND TEXT */}
      <div className="absolute inset-0 flex justify-center items-end pointer-events-none select-none z-0">
        <h1 className="text-[23vw] md:text-[23vw] leading-[0.75] font-black tracking-tighter text-[#3a0505] whitespace-nowrap">
          ADVAY'26
        </h1>
      </div>

      {/* 2. BOTTOM LEGAL STRIP */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 items-center gap-y-4 md:gap-y-0 px-8 py-8 text-[10px] uppercase tracking-widest text-red-900/70 border-t border-red-900/20 bg-transparent">
          <div className="flex justify-start text-red-900/50">
                <span>© 2026 ADVAAY</span>
          </div>
      </div>

    </div>
  );
}
