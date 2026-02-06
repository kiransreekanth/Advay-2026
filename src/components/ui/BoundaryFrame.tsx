'use client'

import { COLORS } from '@/lib/constants'

// ============================================
// KPR VERSE STYLE BOUNDARY FRAME
// ============================================
export default function BoundaryFrame() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* Main Border Frame - All 4 sides */}
      <div
        style={{
          position: 'absolute',
          inset: '20px',
          border: `1px solid ${COLORS.textMuted}30`,
          pointerEvents: 'none',
        }}
      />
      
      {/* Corner Brackets - Top Left */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '24px',
        height: '24px',
        borderTop: `2px solid ${COLORS.textMuted}`,
        borderLeft: `2px solid ${COLORS.textMuted}`,
      }} />
      
      {/* Corner Brackets - Top Right */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '24px',
        height: '24px',
        borderTop: `2px solid ${COLORS.textMuted}`,
        borderRight: `2px solid ${COLORS.textMuted}`,
      }} />
      
      {/* Corner Brackets - Bottom Left */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '24px',
        height: '24px',
        borderBottom: `2px solid ${COLORS.textMuted}`,
        borderLeft: `2px solid ${COLORS.textMuted}`,
      }} />
      
      {/* Corner Brackets - Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '24px',
        height: '24px',
        borderBottom: `2px solid ${COLORS.textMuted}`,
        borderRight: `2px solid ${COLORS.textMuted}`,
      }} />
      
      {/* Crosshair Element - Left Side (KPR Verse style) */}
      <div
        style={{
          position: 'absolute',
          left: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px',
        }}
      >
        {/* Vertical line top */}
        <div style={{
          width: '1px',
          height: '20px',
          background: COLORS.textMuted,
        }} />
        {/* Horizontal line */}
        <div style={{
          width: '20px',
          height: '1px',
          background: COLORS.textMuted,
          position: 'relative',
        }}>
          {/* Center dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '6px',
            height: '6px',
            border: `1px solid ${COLORS.textMuted}`,
            background: 'transparent',
          }} />
        </div>
        {/* Vertical line bottom */}
        <div style={{
          width: '1px',
          height: '20px',
          background: COLORS.textMuted,
        }} />
      </div>
    </div>
  )
}