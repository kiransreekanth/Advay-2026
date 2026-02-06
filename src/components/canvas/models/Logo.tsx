'use client';
import { memo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber'; // Added useFrame
import * as THREE from 'three';
import gsap from 'gsap';

export const Logo = memo(function Logo({ canPlay = false, ...props }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const movingGroupRef = useRef<THREE.Group>(null!); // Ref for interactivity
  const { nodes } = useGLTF('/models/logo-transformed.glb') as any;
  const { width } = useThree((state) => state.viewport);

  // --- INTERACTIVITY CODE START ---
  // Store smoothed mouse/gyro values to prevent "jitter" on mobile
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Mouse Move Handler
    const handleMouseMove = (e: MouseEvent) => {
      targetRotation.current.y = (e.clientX / window.innerWidth - 0.5) * 0.4;
      targetRotation.current.x = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };

    // 2. Gyroscope Handler for Mobile-First Policy
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        // Normalizing gyro values to a reasonable tilt range
        targetRotation.current.y = (e.gamma / 45) * 0.4;
        targetRotation.current.x = ((e.beta - 45) / 45) * 0.4;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  useFrame((state, delta) => {
    if (!movingGroupRef.current) return;
    
    // Smooth Lerping: creates a "weighted" feel so the movement isn't robotic
    movingGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      movingGroupRef.current.rotation.y,
      targetRotation.current.y,
      0.05
    );
    movingGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      movingGroupRef.current.rotation.x,
      targetRotation.current.x,
      0.05
    );
  });
  // --- INTERACTIVITY CODE END ---

  const isMobile = width < 2.5;
  const isTablet = width >= 2.5 && width < 6;

  let responsiveScale = 20; 
  let responsivePosition: [number, number, number] = [0, 0, 0];

  if (isMobile) {
    responsiveScale = 9; 
    responsivePosition = [0, 0, -2]; 
  } else if (isTablet) {
    responsiveScale = 12;
    responsivePosition = [0, 0, -1];
  } 

  useEffect(() => {
    if (!canPlay || !meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.transparent = true;
    mat.opacity = 0;
    mat.emissiveIntensity = 0;

    const tl = gsap.timeline({ delay: 3 });
    tl.to(mat, { opacity: 1, duration: 2.5, ease: "power2.inOut" })
      .to(mat, { emissiveIntensity: 3, duration: 1.5, ease: "expo.out" }, "-=2") 
      .to(mat, { emissiveIntensity: 1, duration: 2, ease: "power2.in" });

    return () => { tl.kill(); };
  }, [nodes, canPlay]);

  if (!nodes || !nodes.Cube003) return null;

  return (
    <group {...props} dispose={null} scale={responsiveScale} position={responsivePosition}>
      {/* Interactivity Group: Wraps the mesh to apply tilt without breaking the responsive position */}
      <group ref={movingGroupRef}>
        <mesh 
          ref={meshRef} 
          geometry={nodes.Cube003.geometry} 
          position={[0, 0, 0.024]} 
          rotation={[0, 0, 0.937]} 
          scale={[0.034, 0.007, 0.008]}
        >
          <meshStandardMaterial 
            color="#d30707" 
            emissive="#ffffff" 
            emissiveIntensity={0} 
            toneMapped={false} 
            transparent
            depthTest={true}
            depthWrite={true}
          />
        </mesh>
      </group>
    </group>
  );
});

useGLTF.preload('/models/logo-transformed.glb');