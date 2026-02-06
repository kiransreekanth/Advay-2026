'use client';

import Lenis from 'lenis';

/**
 * Initialize Lenis smooth scrolling
 * Mobile-optimized settings with better parallax performance
 */
export function initLenis(): Lenis {
  const lenis = new Lenis({
    duration: 0.6, // Faster scrolling
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.5, // Increased scroll speed
    touchMultiplier: 2.5, // Faster touch scrolling
    infinite: false,
  });

  return lenis;
}

/**
 * Start the Lenis RAF loop
 */
export function startLenisRAF(lenis: Lenis): void {
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}
