'use client';
import React from 'react';
import { ArrowDown } from 'lucide-react';
import CipherText from './CipherText'; // Import the new component

// This component is the top part of the footer that scrolls with the page.
export default function FooterContent() {
  return (
    <div id="contact" className="w-full grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-red-900/30 border-t border-red-900/30 bg-black">

      {/* COLUMN 1 */}
      <div className="p-6 md:p-8 flex flex-col justify-between h-auto hover:bg-red-900/10 transition-colors">
        <div className="flex items-start gap-3 text-xs text-red-500 font-bold tracking-widest">
          <div className="w-2 h-2 bg-red-600 mt-[2px]"></div>
          <CipherText text="DETAILS" />
        </div>
        <div className="mt-auto space-y-4">
          <p className="text-xs text-neutral-400 uppercase tracking-widest leading-relaxed">
            Get In Touch <br />
            <a href="mailto:advay26@tistcochin.edu.in" className="text-red-500 font-bold hover:text-white transition-colors cursor-pointer">advay26@tistcochin.edu.in</a>
          </p>
          <button className="w-full border border-red-600/50 py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] bg-black text-red-500 hover:bg-red-600 hover:text-black hover:border-red-600 transition-all duration-300 flex items-center justify-between group">
            <span className="group-hover:translate-x-1 transition-transform">Contact Us</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* COLUMN 2 */}
      <div className="p-6 md:p-8 flex flex-col justify-start gap-12 h-auto hover:bg-red-900/10 transition-colors">
        <div className="flex items-start gap-3 text-xs text-red-500 font-bold tracking-widest">
          <div className="w-2 h-2 bg-red-600 mt-[2px]"></div>
          <CipherText text="SITEMAP" />
        </div>
        <nav className="flex flex-col gap-2 text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">
          {['About', 'Events', 'Gallery'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-white hover:text-red-500 transition-colors w-max">
              <CipherText text={item} />
            </a>
          ))}
        </nav>
      </div>

      {/* COLUMN 3 */}
      <div className="p-6 md:p-8 flex flex-col justify-start gap-12 h-auto hover:bg-red-900/10 transition-colors">
        <div className="flex items-start gap-3 text-xs text-red-500 font-bold tracking-widest">
          <div className="w-2 h-2 bg-red-600 mt-[2px]"></div>
          <CipherText text="SOCIALS" />
        </div>
        <div className="flex flex-col gap-2 text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">
          {[
            { label: 'INSTAGRAM', href: 'https://www.instagram.com/advay.live?igsh=MWk2cHFtdnhpZTNz' },

            { label: 'YOUTUBE', href: 'https://www.youtube.com/live/xImxmkAxd7A?si=Bagt2BAbXvxE-ALV' }
          ].map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 transition-colors w-max">
              <CipherText text={social.label} />
            </a>
          ))}
        </div>
      </div>

      {/* COLUMN 4 */}
      <div className="p-6 md:p-8 flex flex-col justify-start group h-auto hover:bg-red-900/10 transition-colors">
        <div className="flex items-start gap-3 text-xs text-red-500 font-bold tracking-widest">
          <div className="w-2 h-2 bg-red-600 mt-[2px]"></div>
          <CipherText text="CREDITS" />
        </div>
        <div className="space-y-4 mt-12">
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            <a href="https://skfb.ly/68QGs" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-white transition-colors">"Arm & Hand sculpting"</a> by <span className="font-bold">alfance</span><br />
            is licensed under <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">CC Attribution</a>.
          </p>
          <p className="text-xs text-neutral-400 uppercase tracking-widest leading-relaxed">
            DEVELOPED BY: <br />
            <a href="https://www.instagram.com/mulearn.tist" target="_blank" rel="noopener noreferrer" className="text-red-500 font-bold hover:text-white transition-colors">
              MULEARN TIST
            </a>
          </p>
          <p className="text-xs text-neutral-400 uppercase tracking-widest leading-relaxed">
            INSPIRED BY: <br />
            <a href="https://kprverse.com" target="_blank" rel="noopener noreferrer" className="text-red-500 font-bold hover:text-white transition-colors">
              KPRVERSE.COM
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
