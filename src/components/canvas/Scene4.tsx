'use client'

import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'
import BoundaryFrame from '@/components/ui/BoundaryFrame'
import { COLORS } from '@/lib/constants'

// ============================================
// 1. GLOBAL CONSTANTS
// ============================================

const FONTS = {
  heading: `'Monument Extended', 'PP Monument Extended', 'Anton', 'Bebas Neue', 'Oswald', system-ui, sans-serif`,
  body: `'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif`,
  mono: `'SF Mono', 'Fira Code', 'Consolas', monospace`,
}

const ALL_IMAGES = [
  '/images/gallery/event-1.webp',
  '/images/gallery/event-2.webp',
  '/images/gallery/event-3.webp',
  '/images/gallery/event-4.webp',
  '/images/gallery/event-5.webp',
  '/images/gallery/event-6.webp',
  '/images/gallery/event-7.webp',
  '/images/gallery/event-8.webp',
  '/images/gallery/event-9.webp',
  '/images/gallery/event-10.webp',
  '/images/gallery/event-11.webp',
  '/images/gallery/event-12.webp',
  '/images/gallery/event-13.webp',
  '/images/gallery/event-14.webp',
  '/images/gallery/event-15.webp',
  '/images/gallery/event-16.webp',
  '/images/gallery/event-17.webp',
  '/images/gallery/event-18.webp',
  '/images/gallery/event-19.webp',
  '/images/gallery/event-20.webp',
]

const LEFT_IMAGES = ALL_IMAGES.slice(0, 10)
const RIGHT_IMAGES = ALL_IMAGES.slice(10, 20)

// Dimensions
const DESKTOP_WIDTH = 200
const DESKTOP_HEIGHT = 300
const DESKTOP_SPACING = 160
const VISIBLE_CARDS_DESKTOP = 6

// Mobile Dimensions
const MOBILE_CARD_W = 140
const MOBILE_CARD_H = 210
const MOBILE_GAP = 20

// Animation Timing
const SHIFT_DURATION = 0.5 
const PAUSE_DURATION = 1.0

const CARD_OVERLAYS = [
  'rgba(229, 9, 20, 0.12)', 'rgba(178, 7, 16, 0.15)', 'rgba(113, 121, 126, 0.12)',
  'rgba(229, 9, 20, 0.08)', 'rgba(13, 13, 13, 0.2)', 'rgba(229, 228, 226, 0.08)',
]

// ============================================
// 2. OPTIMIZATION HOOKS
// ============================================

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(check, 100)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])
  
  return isMobile
}

function useImagePreloader(images: string[]) {
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image()
      img.src = src
      if (img.decode) img.decode().catch(() => {}) 
    })
  }, [images])
}

// ============================================
// 3. CARD COMPONENT
// ============================================

const CardImageContent = React.memo(({ imageUrl, overlayColor, isMobile = false }: { imageUrl?: string, overlayColor?: string, isMobile?: boolean }) => {
  const safeSrc = imageUrl && imageUrl.length > 0 ? imageUrl : ALL_IMAGES[0]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}>
      <div className="card-shadow" style={{
        position: 'absolute',
        inset: isMobile ? '0' : '0',
        borderRadius: '12px',
        backgroundColor: '#000',
        boxShadow: isMobile ? `0 2px 8px rgba(0,0,0,0.6)` : '0 8px 16px rgba(0,0,0,0.4)',
        transform: 'translateZ(-1px)',
      }} />
      <div className="card-image" style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.1)',
        transform: 'translateZ(0)',
      }}>
        <img
          src={safeSrc}
          alt=""
          loading="eager"
          className="content-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
        />
        {!isMobile && overlayColor && <div style={{ position: 'absolute', inset: 0, background: overlayColor, mixBlendMode: 'multiply', pointerEvents: 'none' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none' }} />
      </div>
    </div>
  )
})
CardImageContent.displayName = 'CardImageContent'


// ============================================
// 4. MOBILE CAROUSEL (Tilted 3D Ring)
// ============================================

const MobileCarouselGSAP = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)
  
  // 1. Math for the Circle
  const numCards = ALL_IMAGES.length
  // r = (width + gap) / (2 * tan(PI/n))
  const radius = Math.round( (MOBILE_CARD_W + MOBILE_GAP) / (2 * Math.tan(Math.PI / numCards)) )
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
        // Spin the ring continuously
        gsap.to(spinnerRef.current, {
            rotationY: -360,
            duration: 50, 
            ease: "none",
            repeat: -1
        })
    }, containerRef)
    return () => ctx.revert()
  }, [radius])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        // Increased height to prevent reflection clipping and accommodate tilt
        height: '600px', 
        perspective: '1200px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden', 
        marginTop: '-50px' // Pull up slightly to center vertically in viewport
      }}
    >
        {/* SCENE WRAPPER */}
        <div 
            style={{
                position: 'relative',
                width: MOBILE_CARD_W,
                height: MOBILE_CARD_H,
                transformStyle: 'preserve-3d',
                // TILT ADJUSTMENT:
                // rotateX(-15deg) makes the "back" of the ring rise up,
                // making it visible behind the front cards.
                transform: `translateZ(-${radius}px) rotateX(-15deg)`,
            }}
        >
            {/* SPINNER */}
            <div 
                ref={spinnerRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    transformStyle: 'preserve-3d',
                }}
            >
                {ALL_IMAGES.map((src, i) => (
                    <div 
                        key={i}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            // Position in circle
                            transform: `rotateY(${i * (360 / numCards)}deg) translateZ(${radius}px)`,
                            // IMPORTANT: visible backface allows seeing cards on the rear arc
                            backfaceVisibility: 'visible', 
                            // REFLECTION FIX:
                            // Extended the gradient stop to 50% to show full reflection
                            // Added bottom padding via box-reflect offset (below 4px)
                            WebkitBoxReflect: 'below 4px linear-gradient(transparent, transparent 20%, rgba(0,0,0,0.4))'
                        }}
                    >
                        <CardImageContent imageUrl={src} isMobile={true} />
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

// ============================================
// 5. DESKTOP CAROUSEL
// ============================================

const DesktopGalleryCard = React.memo(({
  imageUrl,
  imageIndex,
  position,
  side,
  maxPosition,
  isShifting,
}: {
  imageUrl: string
  imageIndex: number
  position: number
  side: 'left' | 'right'
  maxPosition: number
  isShifting: boolean
}) => {
  const direction = side === 'left' ? -1 : 1
  const centerCardOffset = (DESKTOP_WIDTH / 2) + 10

  let moveOffset: number
  if (position === 0) {
    moveOffset = direction * centerCardOffset
  } else {
    moveOffset = direction * (centerCardOffset + (position * DESKTOP_SPACING))
  }

  const normalizedPos = Math.max(0, Math.min(position / maxPosition, 1))
  const scale = 1.1 - (normalizedPos * 0.25)
  const zIndex = position === 0 ? 120 : Math.round(100 - position * 10)
  const translateZ = 50 - normalizedPos * 100
  const overlayColor = CARD_OVERLAYS[imageIndex % CARD_OVERLAYS.length]

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: `${DESKTOP_WIDTH}px`,
        height: `${DESKTOP_HEIGHT}px`,
        marginLeft: `${-DESKTOP_WIDTH / 2}px`,
        marginTop: `${-DESKTOP_HEIGHT / 2}px`,
        transform: `translateX(${moveOffset}px) translateZ(${translateZ}px) scale(${scale})`,
        zIndex,
        transformStyle: 'preserve-3d',
        transition: isShifting
          ? `transform ${SHIFT_DURATION * 1000}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
          : 'none',
        willChange: 'transform',
      }}
    >
      <CardImageContent 
        imageUrl={imageUrl} 
        overlayColor={overlayColor} 
        isMobile={false} 
      />
    </div>
  )
})
DesktopGalleryCard.displayName = 'DesktopGalleryCard'

const DesktopCarouselGSAP = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const leftCardsRef = useRef<HTMLDivElement[]>([])
    const rightCardsRef = useRef<HTMLDivElement[]>([])
    
    const stateRef = useRef({
        leftIdx: 0,
        rightIdx: 0,
        leftPositions: new Array(LEFT_IMAGES.length).fill(100),
        rightPositions: new Array(RIGHT_IMAGES.length).fill(100)
    })

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const getStyle = (pos: number, side: 'left' | 'right') => {
                const direction = side === 'left' ? -1 : 1
                const centerCardOffset = (DESKTOP_WIDTH / 2) + 10
                let moveOffset = pos === 0 ? direction * centerCardOffset : direction * (centerCardOffset + (pos * DESKTOP_SPACING))
                const normalizedPos = Math.max(0, Math.min(pos / VISIBLE_CARDS_DESKTOP, 1))
                return {
                    x: moveOffset,
                    z: 50 - normalizedPos * 100,
                    scale: 1.1 - (normalizedPos * 0.25),
                    zIndex: pos === 0 ? 120 : Math.round(100 - pos * 10),
                    opacity: pos > VISIBLE_CARDS_DESKTOP ? 0 : 1,
                    visibility: pos > VISIBLE_CARDS_DESKTOP ? 'hidden' : 'visible'
                }
            }

            const animateSide = (side: 'left' | 'right', nodes: HTMLDivElement[], positions: number[], currentIdxTracker: 'leftIdx' | 'rightIdx') => {
                const nextIdx = stateRef.current[currentIdxTracker] % nodes.length
                const nextNode = nodes[nextIdx]
                
                gsap.killTweensOf(nextNode)
                const startStyle = getStyle(0, side)
                gsap.set(nextNode, { ...startStyle, scale: 0.8, opacity: 0, visibility: 'visible' })
                positions[nextIdx] = 0

                nodes.forEach((node, idx) => {
                    if (idx === nextIdx) {
                          gsap.to(node, { scale: startStyle.scale, opacity: 1, duration: SHIFT_DURATION, ease: "back.out(1.2)" })
                          const borderEl = node.querySelector('.card-image')
                          const shadowEl = node.querySelector('.card-shadow')
                          if(borderEl) gsap.to(borderEl, { borderColor: `${COLORS.red}25`, duration: SHIFT_DURATION })
                          if(shadowEl) gsap.to(shadowEl, { boxShadow: `0 25px 50px rgba(0,0,0,0.5), 0 0 40px ${COLORS.red}20`, duration: SHIFT_DURATION })
                    } else if (positions[idx] !== 100) {
                        positions[idx] += 1
                        if (positions[idx] > VISIBLE_CARDS_DESKTOP) {
                            positions[idx] = 100
                            gsap.to(node, { 
                                opacity: 0, 
                                duration: 0.2, 
                                onComplete: () => { gsap.set(node, { visibility: 'hidden' }) }
                            })
                        } else {
                            const target = getStyle(positions[idx], side)
                            gsap.to(node, { x: target.x, z: target.z, scale: target.scale, zIndex: target.zIndex, opacity: target.opacity, duration: SHIFT_DURATION, ease: "power2.out" })
                            const borderEl = node.querySelector('.card-image')
                            const shadowEl = node.querySelector('.card-shadow')
                            if(borderEl) gsap.to(borderEl, { borderColor: 'rgba(255,255,255,0.1)', duration: SHIFT_DURATION })
                            if(shadowEl) gsap.to(shadowEl, { boxShadow: '0 8px 16px rgba(0,0,0,0.4)', duration: SHIFT_DURATION })
                        }
                    }
                })
                stateRef.current[currentIdxTracker]++
            }

            const loop = () => {
                animateSide('left', leftCardsRef.current, stateRef.current.leftPositions, 'leftIdx')
                animateSide('right', rightCardsRef.current, stateRef.current.rightPositions, 'rightIdx')
                gsap.delayedCall(PAUSE_DURATION + (SHIFT_DURATION * 0.5), loop)
            }
            loop()
        }, containerRef)
        return () => ctx.revert()
    }, [])

    const cardStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: DESKTOP_WIDTH,
        height: DESKTOP_HEIGHT,
        marginLeft: -DESKTOP_WIDTH / 2,
        marginTop: -DESKTOP_HEIGHT / 2,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        visibility: 'hidden'
    }

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '420px', perspective: '1200px', perspectiveOrigin: '50% 50%', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
                {LEFT_IMAGES.map((src, i) => (
                    <div key={`l-${i}`} ref={el => { if(el) leftCardsRef.current[i] = el }} style={cardStyle}>
                        <CardImageContent imageUrl={src} overlayColor={CARD_OVERLAYS[i % CARD_OVERLAYS.length]} />
                    </div>
                ))}
                {RIGHT_IMAGES.map((src, i) => (
                    <div key={`r-${i}`} ref={el => { if(el) rightCardsRef.current[i] = el }} style={cardStyle}>
                        <CardImageContent imageUrl={src} overlayColor={CARD_OVERLAYS[(i + 2) % CARD_OVERLAYS.length]} />
                    </div>
                ))}
             </div>
             <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '100%', background: `linear-gradient(180deg, transparent 5%, ${COLORS.red}40 20%, ${COLORS.red}60 50%, ${COLORS.red}40 80%, transparent 95%)`, boxShadow: `0 0 20px ${COLORS.red}30`, zIndex: 50 }} />
             <div style={{ position: 'absolute', left: '50%', top: '15px', transform: 'translateX(-50%)', color: COLORS.textMuted, fontSize: '12px', opacity: 0.5, animation: 'bounceUp 1.5s ease-in-out infinite' }}>▲</div>
             <div style={{ position: 'absolute', left: '50%', bottom: '15px', transform: 'translateX(-50%)', color: COLORS.textMuted, fontSize: '12px', opacity: 0.5, animation: 'bounceDown 1.5s ease-in-out infinite' }}>▼</div>
        </div>
    )
}

// ============================================
// 6. MAIN EXPORT
// ============================================

export default function Scene4({ className = '' }: { className?: string }) {
  const isMobile = useIsMobile()
  useImagePreloader(ALL_IMAGES)

  // OPTIMIZATION: Lenis Scroll (Desktop Only)
  useEffect(() => {
    if (isMobile) return 
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [isMobile])

  const bgGradient = useMemo(() => isMobile 
    ? `radial-gradient(ellipse at 50% 50%, ${COLORS.red}08 0%, transparent 60%), ${COLORS.bg}`
    : `radial-gradient(ellipse at 30% 20%, ${COLORS.red}08 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${COLORS.redDark}05 0%, transparent 50%), ${COLORS.bg}`
  , [isMobile])

  if (isMobile) {
    return (
      <div id="gallery" className={className} style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '700px', background: COLORS.bg, overflow: 'hidden' }}>
        <style jsx>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@400;500&display=swap');`}</style>
        <div style={{ position: 'absolute', inset: 0, background: bgGradient, pointerEvents: 'none' }} />
        <BoundaryFrame />

        <div style={{ position: 'absolute', top: '90px', left: '24px', right: '24px', zIndex: 1 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.textMuted, letterSpacing: '0.05em', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
             <span style={{ color: COLORS.red, fontSize: '8px' }}>●</span>
             <span>004</span>
          </div>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: '32px', fontWeight: 900, lineHeight: 0.95, color: COLORS.text, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
            MEMORIES<br />OF <span style={{ color: COLORS.red }}>ADVAY</span>.
          </h2>
        </div>

        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' }}>
          <MobileCarouselGSAP />
        </div>

        <div style={{ position: 'absolute', bottom: '40px', left: '24px', right: '24px', zIndex: 1 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: '9px', letterSpacing: '0.15em', color: COLORS.textMuted, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            <span style={{ color: COLORS.red, fontSize: '5px' }}>■</span> GALLERY COLLECTION
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: '12px', lineHeight: 1.6, color: COLORS.textMuted, margin: 0 }}>
            Every moment captured, every memory preserved. Relive the energy, creativity, and celebration that defines ADVAY.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div id="gallery" className={className} style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '650px', maxHeight: '900px', background: COLORS.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@400;500&display=swap');
        @keyframes bounceUp { 0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; } 50% { transform: translateX(-50%) translateY(-6px); opacity: 0.8; } }
        @keyframes bounceDown { 0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; } 50% { transform: translateX(-50%) translateY(6px); opacity: 0.8; } }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, background: bgGradient, pointerEvents: 'none' }} />
      <BoundaryFrame />
      <div style={{ position: 'absolute', left: '44px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '1px', height: '24px', background: COLORS.textMuted, opacity: 0.6 }} />
        <div style={{ position: 'absolute', width: '24px', height: '1px', background: COLORS.textMuted, opacity: 0.6 }} />
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.textMuted, letterSpacing: '0.05em', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px', position: 'absolute', top: '100px', left: '120px' }}>
        <span style={{ color: COLORS.red, fontSize: '8px' }}>●</span>
        <span>004</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '90px 120px 20px', flex: '0 0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ paddingTop: '30px' }}>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 900, lineHeight: 0.92, color: COLORS.text, letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase' }}>
            MEMORIES<br />OF <span style={{ color: COLORS.red }}>ADVAY</span>.
          </h2>
        </div>
        <div style={{ paddingTop: '30px', maxWidth: '400px' }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: '10px', letterSpacing: '0.18em', color: COLORS.textMuted, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
            <span style={{ color: COLORS.red, fontSize: '6px' }}>■</span> GALLERY COLLECTION
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: '14px', lineHeight: 1.7, color: COLORS.textMuted, margin: 0 }}>
            Every moment captured, every memory preserved. Relive the energy, creativity, and celebration that defines ADVAY. Cards emerge from the center, carrying memories to the edges of time.
          </p>
        </div>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
        <DesktopCarouselGSAP />
      </div>
      <div style={{ position: 'absolute', bottom: '24px', left: '44px', fontFamily: FONTS.mono, fontSize: '10px', color: COLORS.textMuted, opacity: 0.4, letterSpacing: '0.15em' }}>////</div>
      <div style={{ position: 'absolute', bottom: '24px', right: '44px', fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.textMuted, opacity: 0.7 }}>
        <span style={{ color: COLORS.red }}>20</span><span style={{ opacity: 0.4 }}> MEMORIES</span>
      </div>
    </div>
  )
}