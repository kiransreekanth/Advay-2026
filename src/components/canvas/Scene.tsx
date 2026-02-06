// src/components/canvas/Scene.tsx
'use client';
import { Suspense } from 'react'; // Removed unused 'use' and 'useState'
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Hands, ResponsiveFog } from './models/Hands';
import {Logo} from './models/Logo';

interface SceneProps {
  canPlayAnimations?: boolean;
}

export default function Scene({ canPlayAnimations = false }: SceneProps) {
  return (
    <Canvas 
      camera={{ position: [0, 0, 8], fov: 30 }} 
      shadows 
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ResponsiveFog />
      
      <Suspense fallback={null}>
        <Environment preset="lobby" />
        {/* Pass the prop directly here */}
        <Logo canPlay={canPlayAnimations}/>
        <Hands canPlay={canPlayAnimations} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Suspense>
    </Canvas>
  );
}