'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { COLORS, MENU_ITEMS } from '@/lib/constants'

// ============================================
// MOBILE SLIDE-OUT MENU (KPR Verse Style)
// ============================================
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (isOpen) {
      // Animate in
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(menuRef.current, {
        x: 0,
        duration: 0.4,
        ease: 'power3.out',
      })
      // Stagger menu items - with null check for TypeScript
      const menuItems = contentRef.current?.querySelectorAll('.menu-item')
      if (menuItems && menuItems.length > 0) {
        gsap.fromTo(
          menuItems,
          { opacity: 0, x: -30 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.4, 
            stagger: 0.08,
            delay: 0.2,
            ease: 'power2.out' 
          }
        )
      }
    } else {
      // Animate out
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
      gsap.to(menuRef.current, {
        x: '-100%',
        duration: 0.3,
        ease: 'power3.in',
      })
    }
  }, [isOpen])
  
  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          opacity: 0,
          zIndex: 998,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />
      
      {/* Menu Panel */}
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '400px',
          background: COLORS.bg,
          zIndex: 999,
          transform: 'translateX(-100%)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${COLORS.textMuted}30`,
        }}
      >
        {/* Header with close button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          borderBottom: `1px solid ${COLORS.textMuted}20`,
        }}>
          {/* Close Button (X with circle like KPR) */}
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: `1px solid ${COLORS.textMuted}50`,
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.text,
              fontSize: '18px',
            }}
          >
            ✕
          </button>
          
          {/* Register Button */}
          <button
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: `1px solid ${COLORS.red}`,
              color: COLORS.text,
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.red
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            REGISTER
          </button>
        </div>
        
        {/* Menu Content */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            padding: '48px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          {/* Section Label (like KPR's "DISCOVER") */}
          <div
            className="menu-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            <span style={{
              width: '4px',
              height: '4px',
              background: COLORS.red,
              borderRadius: '50%',
            }} />
            <span style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: COLORS.textMuted,
            }}>
              DISCOVER
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: `${COLORS.textMuted}30`,
              marginLeft: '12px',
            }} />
          </div>
          
          {/* Main Menu Items (Large Typography like KPR) */}
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="menu-item"
              onClick={onClose}
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 'clamp(32px, 8vw, 48px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: item.highlight ? COLORS.red : COLORS.text,
                textDecoration: 'none',
                marginBottom: '8px',
                display: 'block',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!item.highlight) e.currentTarget.style.color = COLORS.red
              }}
              onMouseLeave={(e) => {
                if (!item.highlight) e.currentTarget.style.color = COLORS.text
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
        
        {/* Bottom Section (Social Links like KPR) */}
        <div style={{
          padding: '24px 32px',
          borderTop: `1px solid ${COLORS.textMuted}20`,
        }}>
          {/* Connect Section */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: '20px',
          }}>
            <span style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: COLORS.textMuted,
              paddingTop: '4px',
            }}>
              ■ CONNECT
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <a href="#" style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                color: COLORS.text,
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}>
                INSTAGRAM
              </a>
              <a href="#" style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                color: COLORS.text,
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}>
                LINKEDIN
              </a>
            </div>
          </div>
          
          {/* Year */}
          <div style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: COLORS.textMuted,
            letterSpacing: '0.1em',
          }}>
            © 2026
          </div>
        </div>
      </div>
    </>
  )
}