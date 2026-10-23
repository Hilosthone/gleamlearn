'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import type { LearnerPath } from '@/lib/registration/wizard';
import { Fallback } from './Scene3DFallback';

/**
 * Decorative 3D accent for the registration screen (loaded lazily, large screens only — see RegistrationVisual).
 * - One primitive per learner path (no textures, models, fonts or Html overlays): tiny GPU and network cost.
 * - pointer-events: none on the wrapper, so it can never intercept clicks meant for the form.
 * - frameloop: 'never' while the tab is hidden; 'demand' (a single static frame) when reduced motion is requested.
 * - Purely decorative (aria-hidden); every instruction lives in the form itself.
 */
const PALETTE: Record<LearnerPath | 'none', { color: string; emissive: string }> = {
  none: { color: '#2563EB', emissive: '#1d4ed8' },
  secondary: { color: '#2563EB', emissive: '#1d4ed8' },
  university: { color: '#7C3AED', emissive: '#6d28d9' },
  exam: { color: '#D4A72C', emissive: '#b7891c' },
};

function Shape({ path, animate }: { path: LearnerPath | null; animate: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.y += delta * 0.35;
    ref.current.rotation.x += delta * 0.12;
  });
  const { color, emissive } = PALETTE[path ?? 'none'];
  return (
    <mesh ref={ref} rotation={[0.4, 0.6, 0]}>
      {path === 'university' ? (
        <torusKnotGeometry args={[0.85, 0.26, 96, 16]} />
      ) : path === 'exam' ? (
        <octahedronGeometry args={[1.25, 0]} />
      ) : (
        <icosahedronGeometry args={[1.15, 0]} />
      )}
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.25} roughness={0.35} metalness={0.4} flatShading />
    </mesh>
  );
}

export default function RegistrationScene3D({ path, reducedMotion }: { path: LearnerPath | null; reducedMotion: boolean }) {
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  if (failed) return <Fallback />;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <Canvas
        frameloop={!visible ? 'never' : reducedMotion ? 'demand' : 'always'}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true }}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setFailed(true);
          });
        }}
        fallback={<Fallback />}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <pointLight position={[-4, -2, -3]} intensity={0.8} color="#D4A72C" />
        <Shape path={path} animate={!reducedMotion} />
      </Canvas>
    </div>
  );
}
