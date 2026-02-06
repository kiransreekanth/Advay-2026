'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { COLORS, NAV_ITEMS } from '@/lib/constants';
import MobileMenu from './MobileMenu';
import CipherText from './CipherText'; // Import the new component
import { GooeyText } from './GooeyText';

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useGSAP(() => {
    gsap.fromTo(
      navRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
    );
  }, { scope: navRef });

  return (
    <>
      <nav
        ref={navRef}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '16px 16px' : '16px 24px',
        }}
      >
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '4px',
              }}
            >
              <div style={{ width: '24px', height: '2px', background: COLORS.text }} />
              <div style={{ width: '24px', height: '2px', background: COLORS.text }} />
            </button>
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'system-ui, sans-serif',
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: COLORS.text,
            height: isMobile ? '28px' : '28px',
            minWidth: isMobile ? '60px' : '80px',
            marginTop: isMobile ? '1.5em' : '0',
            marginLeft: isMobile ? '2.5em' : '1.5em'
          }}>
            <GooeyText
              texts={["ADVAY", "അധ്വയ്", "अधवे"]}
              morphTime={1.5}
              cooldownTime={2}
              className="h-full"
              textClassName="text-white font-bold"
            />
          </div>
        </div>

        {/* Center Navigation Links (Desktop Only) */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  color: item.active ? COLORS.red : COLORS.textMuted,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 50,
                }}
                onMouseEnter={(e) => {
                  if (!item.active) e.currentTarget.style.color = COLORS.text;
                }}
                onMouseLeave={(e) => {
                  if (!item.active) e.currentTarget.style.color = COLORS.textMuted;
                }}
              >
                {item.active && (
                  <span style={{ width: '4px', height: '4px', background: COLORS.red, borderRadius: '50%' }} />
                )}
                <CipherText text={item.label} />
              </a>
            ))}
          </div>
        )}

        {/* Register Button */}
        <button
          style={{
            padding: isMobile ? '10px 16px' : '12px 24px',
            background: 'transparent',
            border: `1px solid ${COLORS.red}`,
            color: COLORS.text,
            fontSize: isMobile ? '10px' : '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.red;
            e.currentTarget.style.color = COLORS.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = COLORS.text;
          }}
        >
          {isMobile ? 'REGISTER' : 'REGISTER NOW'}
          {/* <CipherText text={isMobile ? 'REGISTER' : 'REGISTER NOW'} /> */}
        </button>
      </nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
