'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { COLORS, HERO_WORDS } from '@/lib/constants'
import { GooeyText } from './GooeyText'

// ============================================
// HERO CONTENT COMPONENT
// ============================================
export default function HeroContent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    // Description
    tl.fromTo(descRef.current,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }
    )

    // Index numbers (like KPR Verse 01K, 02P, 03R)
    const wordIndexElements = indexRef.current?.querySelectorAll('.word-index')
    if (wordIndexElements && wordIndexElements.length > 0) {
      tl.fromTo(wordIndexElements,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.15 },
        '-=0.4'
      )
    }

    // Title letters
    const letters = titleRef.current?.querySelectorAll('.hero-letter')
    if (letters) {
      tl.fromTo(letters,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.02,
          ease: 'power3.out'
        },
        '-=0.5'
      )
    }

    // Scroll indicator
    tl.fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      '-=0.2'
    )
  }, { scope: containerRef })

  // Animated scroll indicator
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    gsap.to(el, {
      y: 6,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        // position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '80px 24px 24px 24px' : '80px 48px 32px 48px',
        overflow: 'hidden',
        height: '100vh',
      }}
    >
      {/* Top Section - Description on RIGHT (under Register button) */}
      <div
        ref={descRef}
        style={{
          alignSelf: 'flex-end',
          maxWidth: isMobile ? '200px' : '280px',
          textAlign: 'right',
          fontFamily: 'system-ui, sans-serif',
          fontSize: isMobile ? '10px' : '12px',
          lineHeight: 1.6,
          color: COLORS.textMuted,
          marginTop: isMobile ? '8px' : '16px',
        }}
      >
        <span style={{ color: COLORS.text, fontWeight: 500 }}>ADVAY</span> is the National-level Techno-Cultural fest
        that's a celebration of creativity and innovation. It offers students from all over the country an exciting
        platform to showcase their talents and abilities. With a diverse range of events and exciting cash prizes.
      </div>

      {/* Main Content - Vertically Centered */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: isMobile ? '-20px' : '-40px', // Offset to visually center with 3D model
      }}>
        {/* Hero Title with Index Numbers */}
        <div
          ref={titleRef}
        >
          {/* <div ref={indexRef}>
            {HERO_WORDS.map((word, wordIndex) => (
              <div
                key={word.text}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: isMobile ? 'center' : 'left',
                  marginLeft: isMobile 
                    ? '0'
                    : (word.align === 'center' ? '12%' : 0),
                  marginBottom: wordIndex < HERO_WORDS.length - 1 ? (isMobile ? '-6px' : '-8px') : 0,
                }}
              >
                {/* Index code (like KPR Verse 01K, 02P, 03R) - Hide on mobile */}
          {/* {!isMobile && (
                  <span
                    className="word-index"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: word.align === 'center' ? '-50px' : '-45px',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      color: COLORS.textMuted,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {word.index}
                  </span>
                )}
                
                <div style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: isMobile ? 'clamp(28px, 9vw, 40px)' : 'clamp(42px, 10vw, 120px)',
                  fontWeight: 700,
                  lineHeight: isMobile ? 1.15 : 1,
                  letterSpacing: '-0.02em',
                  color: COLORS.text,
                  display: 'inline-block',
                  marginLeft: isMobile && wordIndex === 1 ? '8%' : '0',
                }}>
                  {word.text.split('').map((letter, i) => (
                    <span
                      key={`${word.text}-${i}`}
                      className="hero-letter"
                      style={{ display: 'inline-block' }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Bottom Footer - Always visible */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: '16px',
        paddingBottom: isMobile ? '40px' : '0', // Lift text on mobile
        flexShrink: 0,
      }}>
        {/* Left - Event details */}
        <div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: `${COLORS.textMuted}80`,
            letterSpacing: '0.1em',
            marginBottom: '4px',
          }}>
            ////
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: isMobile ? '10px' : '11px',
            color: COLORS.textMuted,
            letterSpacing: '0.08em',
          }}>
            FEB 16-17, 2026
          </div>
          <div style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: isMobile ? '10px' : '11px',
            color: COLORS.textMuted,
            letterSpacing: '0.06em',
            marginTop: '2px',
          }}>
            TIST, ARAKKUNNAM
          </div>
        </div>

        {/* Right - Scroll indicator */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            color: COLORS.textMuted,
            letterSpacing: '0.15em',
          }}
        >
          SCROLL
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 5L6 9L10 5" stroke={COLORS.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}