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

// Mobile settings - optimized for performance
const MOBILE_CARD_W = 220
const MOBILE_CARD_H = 320
const MOBILE_GAP = 55

// Timing - perfectly synchronized
const ANIMATION_DURATION = 0.5  // Card fly-in duration
const PAUSE_BETWEEN = 1.0       // Pause between animations
const SHIFT_DURATION = 0.5      // Desktop compatibility

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
// OPTIMIZED CARD COMPONENT
// ============================================

const MobileCard = React.memo(({ imageUrl }: { imageUrl: string }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Simplified shadow for mobile */}
      <div style={{
        position: 'absolute',
        inset: '4px',
        borderRadius: '12px',
        backgroundColor: '#000',
        boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
        transform: 'translate3d(0,0,-1px)',
      }} />
      
      {/* Image container */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.1)',
        transform: 'translate3d(0,0,0)',
      }}>
        <img
          src={imageUrl}
          alt=""
          loading="eager"
          decoding="async"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            display: 'block',
            transform: 'translate3d(0,0,0)',
          }}
          draggable={false}
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }} />
      </div>
    </div>
  )
})
MobileCard.displayName = 'MobileCard'

// ============================================
// MOBILE CAROUSEL - COMPLETELY REWRITTEN
// ============================================

const MobileCarouselGSAP = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 5 visible cards: positions -2, -1, 0, 1, 2
  const VISIBLE_POSITIONS = [-2, -1, 0, 1, 2]
  
  // Card pools - one for each visible position
  const cardRefs = useRef<{
    [key: number]: HTMLDivElement[]
  }>({
    '-2': [],
    '-1': [],
    '0': [],
    '1': [],
    '2': []
  })
  
  // Current state
  const stateRef = useRef({
    currentImageIndex: 0,
    comingFromLeft: true,
    isAnimating: false,
  })

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // Position calculator
      const getPositionStyle = (pos: number) => {
        const x = pos * MOBILE_GAP
        const rotation = pos === 0 ? 0 : pos * 3
        const scale = pos === 0 ? 1 : 0.88
        const zIndex = 100 - Math.abs(pos) * 10
        const opacity = 0.9
        
        return { x, rotation, scale, zIndex, opacity }
      }
      
      // Initialize all 5 visible cards (one at each position)
      VISIBLE_POSITIONS.forEach((pos, idx) => {
        const pool = cardRefs.current[pos]
        const activeCard = pool[0] // Use first card in each pool
        
        if (activeCard) {
          const imgEl = activeCard.querySelector('img')
          if (imgEl) {
            imgEl.src = ALL_IMAGES[idx % ALL_IMAGES.length]
          }
          
          const style = getPositionStyle(pos)
          gsap.set(activeCard, {
            display: 'block',
            x: style.x,
            rotation: style.rotation,
            scale: style.scale,
            zIndex: style.zIndex,
            opacity: style.opacity,
          })
        }
      })
      
      stateRef.current.currentImageIndex = 5
      
      // Main animation function - PERFECTLY SYNCHRONIZED
      const animateNext = () => {
        if (stateRef.current.isAnimating) return
        stateRef.current.isAnimating = true
        
        const { currentImageIndex, comingFromLeft } = stateRef.current
        const nextImageUrl = ALL_IMAGES[currentImageIndex % ALL_IMAGES.length]
        
        // Create timeline for perfect synchronization
        const tl = gsap.timeline({
          onComplete: () => {
            stateRef.current.currentImageIndex++
            stateRef.current.comingFromLeft = !comingFromLeft
            stateRef.current.isAnimating = false
            
            // Schedule next animation
            gsap.delayedCall(PAUSE_BETWEEN, animateNext)
          }
        })
        
        // Get the card that will enter from the side
        const enterPosition = comingFromLeft ? -2 : 2
        const pool = cardRefs.current[enterPosition]
        
        // Find unused card in the pool (or recycle oldest)
        let enterCard: HTMLDivElement | null = null
        for (let i = 0; i < pool.length; i++) {
          const card = pool[i]
          const currentDisplay = gsap.getProperty(card, 'display')
          if (currentDisplay === 'none') {
            enterCard = card
            break
          }
        }
        
        // If all cards are in use, recycle the last one
        if (!enterCard && pool.length > 0) {
          enterCard = pool[pool.length - 1]
        }
        
        if (enterCard) {
          // Update image
          const imgEl = enterCard.querySelector('img')
          if (imgEl) imgEl.src = nextImageUrl
          
          // Set initial position (far off-screen)
          const startX = comingFromLeft ? -3 * MOBILE_GAP : 3 * MOBILE_GAP
          const startRotation = comingFromLeft ? -9 : 9
          
          gsap.set(enterCard, {
            display: 'block',
            x: startX,
            rotation: startRotation,
            scale: 0.8,
            zIndex: 150, // Highest z-index during animation
            opacity: 1,
          })
          
          // ALL ANIMATIONS HAPPEN IN THE SAME TIMELINE AT THE SAME TIME
          // This ensures perfect synchronization
          
          // Animate the entering card to center (position 0)
          tl.to(enterCard, {
            x: 0,
            rotation: 0,
            scale: 1,
            zIndex: 100,
            duration: ANIMATION_DURATION,
            ease: 'power2.out',
          }, 0) // Start at time 0
          
          // Animate all existing visible cards
          VISIBLE_POSITIONS.forEach((pos) => {
            const pool = cardRefs.current[pos]
            
            pool.forEach((card) => {
              const currentDisplay = gsap.getProperty(card, 'display')
              if (currentDisplay === 'none' || card === enterCard) return
              
              // Calculate new position
              const shift = comingFromLeft ? 1 : -1
              const newPos = pos + shift
              
              // If card moves off-screen, fade out
              if (Math.abs(newPos) > 2) {
                tl.to(card, {
                  opacity: 0,
                  scale: 0.7,
                  duration: ANIMATION_DURATION,
                  ease: 'power2.in',
                  onComplete: () => {
                    gsap.set(card, { display: 'none' })
                  }
                }, 0) // Start at time 0
              } else {
                // Move to new position
                const newStyle = getPositionStyle(newPos)
                tl.to(card, {
                  x: newStyle.x,
                  rotation: newStyle.rotation,
                  scale: newStyle.scale,
                  zIndex: newStyle.zIndex,
                  opacity: newStyle.opacity,
                  duration: ANIMATION_DURATION,
                  ease: 'power2.out',
                }, 0) // Start at time 0
              }
            })
          })
        }
      }
      
      // Start animation loop
      gsap.delayedCall(PAUSE_BETWEEN, animateNext)
      
    }, containerRef)
    
    return () => ctx.revert()
  }, [])

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
    display: 'none',
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: 350, 
        overflow: 'hidden',
      }}
    >
      {/* Create 2 cards for each position (double buffering) */}
      {VISIBLE_POSITIONS.map((pos) => (
        <React.Fragment key={pos}>
          <div 
            ref={el => { if (el) cardRefs.current[pos][0] = el }}
            style={cardBaseStyle}
          >
            <MobileCard imageUrl={ALL_IMAGES[0]} />
          </div>
          <div 
            ref={el => { if (el) cardRefs.current[pos][1] = el }}
            style={cardBaseStyle}
          >
            <MobileCard imageUrl={ALL_IMAGES[0]} />
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

// ============================================
// DESKTOP CAROUSEL
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
                gsap.delayedCall(PAUSE_BETWEEN + (SHIFT_DURATION * 0.5), loop)
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

    const CardImageContent = React.memo(({ imageUrl, overlayColor }: { imageUrl: string, overlayColor?: string }) => (
      <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          backgroundColor: '#000',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          transform: 'translateZ(-1px)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
          transform: 'translateZ(0)',
        }}>
          <img
            src={imageUrl}
            alt=""
            loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {overlayColor && <div style={{ position: 'absolute', inset: 0, background: overlayColor, mixBlendMode: 'multiply' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
        </div>
      </div>
    ))
    CardImageContent.displayName = 'CardImageContent'

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
// MAIN COMPONENT
// ============================================

export default function Scene4({ className = '' }: { className?: string }) {
  const isMobile = useIsMobile()
  useImagePreloader(ALL_IMAGES)

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