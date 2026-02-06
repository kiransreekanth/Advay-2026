'use client'

import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'
import BoundaryFrame from '@/components/ui/BoundaryFrame'
import { COLORS } from '@/lib/constants'

// ============================================
// CONFIGURATION
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

const DESKTOP_WIDTH = 200
const DESKTOP_HEIGHT = 300
const DESKTOP_SPACING = 160
const VISIBLE_CARDS_DESKTOP = 6

const MOBILE_CARD_W = 220
const MOBILE_CARD_H = 320

// MOBILE OPTIMIZATION: Simplified timing
const PAUSE_DURATION = 1.0 
const FLY_DURATION = 0.5 // Faster = smoother on mobile
const SHIFT_DURATION = 0.5

const CARD_OVERLAYS = [
  'rgba(229, 9, 20, 0.12)', 'rgba(178, 7, 16, 0.15)', 'rgba(113, 121, 126, 0.12)',
  'rgba(229, 9, 20, 0.08)', 'rgba(13, 13, 13, 0.2)', 'rgba(229, 228, 226, 0.08)',
]

// ============================================
// HOOKS
// ============================================

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useLayoutEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 150)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])
  return isMobile
}

// Aggressive preloading
function useImagePreloader(images: string[]) {
  useEffect(() => {
    const fragment = document.createDocumentFragment()
    images.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      fragment.appendChild(link)
    })
    document.head.appendChild(fragment)
  }, [images])
}

// ============================================
// CARD COMPONENT (MOBILE OPTIMIZED)
// ============================================

const CardImageContent = React.memo(({ 
  imageUrl, 
  overlayColor, 
  isMobile = false 
}: { 
  imageUrl?: string
  overlayColor?: string
  isMobile?: boolean 
}) => {
  const safeSrc = imageUrl && imageUrl.length > 0 ? imageUrl : ALL_IMAGES[0]

  // MOBILE: Simplified shadow (no multiple layers)
  const shadowStyle: React.CSSProperties = {
    position: 'absolute',
    inset: isMobile ? '4px' : '0',
    borderRadius: '12px',
    backgroundColor: '#000',
    boxShadow: isMobile ? '0 8px 16px rgba(0,0,0,0.5)' : '0 8px 16px rgba(0,0,0,0.4)',
    opacity: 1,
    // CRITICAL: Use transform3d for GPU acceleration
    transform: 'translate3d(0,0,-1px)',
  }

  const imageContainerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    // CRITICAL: Force GPU layer
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={shadowStyle} />
      <div style={imageContainerStyle}>
        <img
          src={safeSrc}
          alt=""
          loading="eager"
          decoding="async"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            display: 'block', 
            pointerEvents: 'none',
            // CRITICAL: GPU acceleration
            transform: 'translate3d(0,0,0)',
          }}
          draggable={false}
        />
        {!isMobile && overlayColor && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: overlayColor, 
            mixBlendMode: 'multiply', 
            pointerEvents: 'none' 
          }} />
        )}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)', 
          pointerEvents: 'none' 
        }} />
      </div>
    </div>
  )
})
CardImageContent.displayName = 'CardImageContent'

// ============================================
// MOBILE CAROUSEL (ULTRA OPTIMIZED)
// ============================================

const MobileCarouselGSAP = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Pool of cards
  const POOL_SIZE = 20
  const poolRef = useRef<HTMLDivElement[]>([])
  
  // Cache img elements to avoid querySelector
  const poolImgRef = useRef<HTMLImageElement[]>([])
  
  // Static background cards
  const staticCardsRef = useRef<{
    leftFar: HTMLDivElement | null
    leftNear: HTMLDivElement | null
    rightNear: HTMLDivElement | null
    rightFar: HTMLDivElement | null
  }>({
    leftFar: null,
    leftNear: null,
    rightNear: null,
    rightFar: null,
  })
  
  // Cache static card images
  const staticImgRef = useRef<{
    leftFar: HTMLImageElement | null
    leftNear: HTMLImageElement | null
    rightNear: HTMLImageElement | null
    rightFar: HTMLImageElement | null
  }>({
    leftFar: null,
    leftNear: null,
    rightNear: null,
    rightFar: null,
  })
  
  const stateRef = useRef({
    centerPileIndices: [] as number[],
    globalImageIndex: 0,
    comingFromLeft: true,
    zIndexCounter: 100,
  })

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // Cache all image elements
      poolRef.current.forEach((el, i) => {
        const img = el?.querySelector('img')
        if (img) poolImgRef.current[i] = img
      })
      
      // Cache static card images
      if (staticCardsRef.current.leftFar) {
        staticImgRef.current.leftFar = staticCardsRef.current.leftFar.querySelector('img')
      }
      if (staticCardsRef.current.leftNear) {
        staticImgRef.current.leftNear = staticCardsRef.current.leftNear.querySelector('img')
      }
      if (staticCardsRef.current.rightNear) {
        staticImgRef.current.rightNear = staticCardsRef.current.rightNear.querySelector('img')
      }
      if (staticCardsRef.current.rightFar) {
        staticImgRef.current.rightFar = staticCardsRef.current.rightFar.querySelector('img')
      }
      
      // Initialize static background images
      if (staticImgRef.current.leftFar) staticImgRef.current.leftFar.src = ALL_IMAGES[2]
      if (staticImgRef.current.leftNear) staticImgRef.current.leftNear.src = ALL_IMAGES[1]
      if (staticImgRef.current.rightNear) staticImgRef.current.rightNear.src = ALL_IMAGES[3]
      if (staticImgRef.current.rightFar) staticImgRef.current.rightFar.src = ALL_IMAGES[4]
      
      // Position static cards with GSAP (GPU accelerated)
      const staticPositions = [
        { ref: staticCardsRef.current.leftFar, x: -90, rot: -6 },
        { ref: staticCardsRef.current.leftNear, x: -45, rot: -3 },
        { ref: staticCardsRef.current.rightNear, x: 45, rot: 3 },
        { ref: staticCardsRef.current.rightFar, x: 90, rot: 6 },
      ]
      
      staticPositions.forEach(({ ref, x, rot }) => {
        if (ref) {
          gsap.set(ref, {
            x,
            rotation: rot,
            scale: 0.88,
            zIndex: 5,
            opacity: 0.85, // Slightly transparent instead of brightness filter
          })
        }
      })
      
      // Hide all pool nodes
      poolRef.current.forEach(el => {
        if (el) gsap.set(el, { display: 'none' })
      })
      
      // Initialize first center card
      const firstEl = poolRef.current[0]
      if (firstEl && poolImgRef.current[0]) {
        poolImgRef.current[0].src = ALL_IMAGES[0]
        gsap.set(firstEl, { 
          display: 'block', 
          x: 0, 
          rotation: 0, 
          scale: 1, 
          zIndex: 100,
          opacity: 1,
        })
        stateRef.current.centerPileIndices.push(0)
        stateRef.current.globalImageIndex = 5
        stateRef.current.zIndexCounter = 101
      }
      
      // Animation cycle
      const dealCard = () => {
        const { centerPileIndices, globalImageIndex, comingFromLeft, zIndexCounter } = stateRef.current
        
        // Find free pool node
        let nodeToUseIdx = -1
        for (let i = 0; i < POOL_SIZE; i++) {
          if (!centerPileIndices.includes(i)) {
            nodeToUseIdx = i
            break
          }
        }
        
        // Recycle if pile too high
        if (nodeToUseIdx === -1 || centerPileIndices.length > 6) {
          const bottomIdx = centerPileIndices.shift()
          if (bottomIdx !== undefined) {
            const bottomEl = poolRef.current[bottomIdx]
            if (bottomEl) gsap.set(bottomEl, { display: 'none' })
            if (nodeToUseIdx === -1) nodeToUseIdx = bottomIdx
          }
        }
        
        if (nodeToUseIdx !== -1) {
          const el = poolRef.current[nodeToUseIdx]
          const imgEl = poolImgRef.current[nodeToUseIdx]
          
          // Determine source
          const activeSourceImg = comingFromLeft 
            ? staticImgRef.current.leftFar 
            : staticImgRef.current.rightFar
          
          const activeSourceCard = comingFromLeft
            ? staticCardsRef.current.leftFar
            : staticCardsRef.current.rightFar
          
          // Get images
          const movingImgUrl = activeSourceImg?.src || ALL_IMAGES[0]
          const nextSourceImgUrl = ALL_IMAGES[globalImageIndex % ALL_IMAGES.length]
          
          // Setup moving card
          if (imgEl) imgEl.src = movingImgUrl
          
          const startX = comingFromLeft ? -90 : 90
          const startRot = comingFromLeft ? -6 : 6
          
          if (el) {
            // Set start position
            gsap.set(el, {
              display: 'block',
              x: startX,
              rotation: startRot,
              scale: 0.88,
              zIndex: zIndexCounter,
              opacity: 1,
            })
            
            // Animate to center with optimized settings
            gsap.to(el, {
              x: 0,
              rotation: 0, // FIXED: No random rotation for consistent performance
              scale: 1,
              duration: FLY_DURATION,
              ease: "power2.out", // Simpler easing for mobile
            })
          }
          
          // Update source stack image (happens during animation, not before)
          if (activeSourceImg) {
            // Use requestAnimationFrame to batch DOM update
            requestAnimationFrame(() => {
              if (activeSourceImg) activeSourceImg.src = nextSourceImgUrl
            })
          }
          
          // Subtle pop on source card
          if (activeSourceCard) {
            gsap.fromTo(activeSourceCard,
              { scale: 0.82 },
              { scale: 0.88, duration: 0.2, ease: "power1.out" }
            )
          }
          
          // Update state
          centerPileIndices.push(nodeToUseIdx)
          stateRef.current.globalImageIndex++
          stateRef.current.comingFromLeft = !comingFromLeft
          stateRef.current.zIndexCounter++
        }
        
        // Loop
        gsap.delayedCall(PAUSE_DURATION, dealCard)
      }
      
      // Start
      gsap.delayedCall(0.5, dealCard)
      
    }, containerRef)
    
    return () => ctx.revert()
  }, [])

  // Base card style (optimized for GPU)
  const cardBaseStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: MOBILE_CARD_W,
    height: MOBILE_CARD_H,
    marginLeft: -MOBILE_CARD_W / 2,
    marginTop: -MOBILE_CARD_H / 2,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    pointerEvents: 'none',
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: 350, 
        overflow: 'hidden',
        // CRITICAL: Isolate this section
        isolation: 'isolate',
      }}
    >
      {/* Static background cards (4 cards on sides) */}
      <div 
        ref={el => { staticCardsRef.current.leftFar = el }} 
        style={cardBaseStyle}
      >
        <CardImageContent imageUrl={ALL_IMAGES[2]} isMobile={true} />
      </div>
      <div 
        ref={el => { staticCardsRef.current.leftNear = el }} 
        style={cardBaseStyle}
      >
        <CardImageContent imageUrl={ALL_IMAGES[1]} isMobile={true} />
      </div>
      <div 
        ref={el => { staticCardsRef.current.rightNear = el }} 
        style={cardBaseStyle}
      >
        <CardImageContent imageUrl={ALL_IMAGES[3]} isMobile={true} />
      </div>
      <div 
        ref={el => { staticCardsRef.current.rightFar = el }} 
        style={cardBaseStyle}
      >
        <CardImageContent imageUrl={ALL_IMAGES[4]} isMobile={true} />
      </div>
      
      {/* Animated pool cards */}
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <div 
          key={i}
          ref={el => { if (el) poolRef.current[i] = el }}
          style={cardBaseStyle}
        >
          <CardImageContent imageUrl={ALL_IMAGES[i]} isMobile={true} />
        </div>
      ))}
    </div>
  )
}

// ============================================
// DESKTOP CAROUSEL (Unchanged)
// ============================================

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
                            gsap.to(node, { 
                              x: target.x, 
                              z: target.z, 
                              scale: target.scale, 
                              zIndex: target.zIndex, 
                              opacity: target.opacity, 
                              duration: SHIFT_DURATION, 
                              ease: "power2.out" 
                            })
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
// MAIN EXPORT
// ============================================

export default function Scene4({ className = '' }: { className?: string }) {
  const isMobile = useIsMobile()
  useImagePreloader(ALL_IMAGES)

  // Lenis only on desktop
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
      <div 
        id="gallery" 
        className={className} 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100vh', 
          minHeight: '700px', 
          background: COLORS.bg, 
          overflow: 'hidden',
          // CRITICAL: Hardware acceleration hint
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}
      >
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