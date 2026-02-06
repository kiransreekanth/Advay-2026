'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================
// DEVICE DETECTION HOOK
// ============================================

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  hasGyroscope: boolean
  hasTouchScreen: boolean
  isLowEnd: boolean
  screenWidth: number
  screenHeight: number
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasGyroscope: false,
    hasTouchScreen: false,
    isLowEnd: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  })

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Check user agent for mobile
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      
      // Screen size based detection
      const isMobile = isMobileUA || width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      
      // Touch screen detection
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Gyroscope detection
      const hasGyroscope = 'DeviceOrientationEvent' in window
      
      // Low-end device detection (rough heuristic)
      const hardwareConcurrency = navigator.hardwareConcurrency || 4
      const deviceMemory = (navigator as any).deviceMemory
      const isLowEnd = hardwareConcurrency <= 2 || 
                       (deviceMemory !== undefined && deviceMemory <= 2)

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        hasGyroscope,
        hasTouchScreen,
        isLowEnd,
        screenWidth: width,
        screenHeight: height,
      })
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return deviceInfo
}

// ============================================
// MOUSE PARALLAX HOOK
// ============================================

interface MousePosition {
  x: number
  y: number
  normalizedX: number
  normalizedY: number
}

export function useMouseParallax(sensitivity: number = 1): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window
      
      // Normalize to -1 to 1 range
      const normalizedX = ((clientX / innerWidth) - 0.5) * 2 * sensitivity
      const normalizedY = ((clientY / innerHeight) - 0.5) * 2 * sensitivity

      setMousePosition({
        x: clientX,
        y: clientY,
        normalizedX,
        normalizedY,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [sensitivity])

  return mousePosition
}

// ============================================
// GYROSCOPE HOOK (with iOS permission handling)
// ============================================

interface GyroscopeData {
  alpha: number  // Z-axis rotation (0-360)
  beta: number   // X-axis rotation (-180 to 180)
  gamma: number  // Y-axis rotation (-90 to 90)
  permission: 'pending' | 'granted' | 'denied' | 'not-supported'
  requestPermission: () => Promise<void>
}

export function useGyroscope(): GyroscopeData {
  const [gyroData, setGyroData] = useState<Omit<GyroscopeData, 'requestPermission'>>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    permission: 'pending',
  })
  
  const listenerAddedRef = useRef(false)

  // Handle device orientation event
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setGyroData(prev => ({
      ...prev,
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0,
      permission: 'granted',
    }))
  }, [])

  // Request permission (required for iOS 13+)
  const requestPermission = useCallback(async () => {
    // Check if DeviceOrientationEvent exists
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      setGyroData(prev => ({ ...prev, permission: 'not-supported' }))
      return
    }

    // Check if requestPermission method exists (iOS 13+)
    const DeviceOrientationEventTyped = DeviceOrientationEvent as any
    
    if (typeof DeviceOrientationEventTyped.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEventTyped.requestPermission()
        
        if (permission === 'granted') {
          setGyroData(prev => ({ ...prev, permission: 'granted' }))
          
          if (!listenerAddedRef.current) {
            window.addEventListener('deviceorientation', handleOrientation, true)
            listenerAddedRef.current = true
          }
        } else {
          setGyroData(prev => ({ ...prev, permission: 'denied' }))
        }
      } catch (error) {
        console.error('Error requesting gyroscope permission:', error)
        setGyroData(prev => ({ ...prev, permission: 'denied' }))
      }
    } else {
      // Non-iOS devices - just add listener directly
      setGyroData(prev => ({ ...prev, permission: 'granted' }))
      
      if (!listenerAddedRef.current) {
        window.addEventListener('deviceorientation', handleOrientation, true)
        listenerAddedRef.current = true
      }
    }
  }, [handleOrientation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerAddedRef.current) {
        window.removeEventListener('deviceorientation', handleOrientation, true)
        listenerAddedRef.current = false
      }
    }
  }, [handleOrientation])

  return {
    ...gyroData,
    requestPermission,
  }
}