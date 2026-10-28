'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ELEMENT_COLORS, layoutMolecule, type Visual } from '@/lib/visual-lesson';

/**
 * 3D renderers for visual lessons (lazy-loaded; one Canvas per visible visual, so at most one WebGL context).
 * Geometry is built only from validated numbers; labels are plain text in <Html>. React Three Fiber disposes
 * geometries and materials it created when the scene unmounts. With reduced motion, nothing animates
 * (frameloop "demand": a frame is drawn only when the learner rotates or zooms).
 */
type Props = { visual: Extract<Visual, { type: 'shape3d' | 'molecule' | 'vectors' | 'orbit' | 'wave' }>; reducedMotion: boolean };

const Label = ({ position, children }: { position: [number, number, number]; children: React.ReactNode }) => (
  <Html position={position} center distanceFactor={8} zIndexRange={[10, 0]}>
    <span className="pointer-events-none select-none whitespace-nowrap rounded-md bg-white/90 dark:bg-gray-900/90 px-1.5 py-0.5 text-[11px] font-semibold text-gray-900 dark:text-white shadow-sm">{children}</span>
  </Html>
);

function Spin({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!reducedMotion && ref.current) ref.current.rotation.y += dt * 0.25;
  });
  return <group ref={ref}>{children}</group>;
}

function Shape({ v }: { v: Extract<Visual, { type: 'shape3d' }> }) {
  const d = Object.values(v.dimensions);
  const k = (i: number, dflt: number) => Math.min(3, Math.max(0.3, d[i] ? d[i] / Math.max(...d, 1) * 2.4 : dflt));
  const geometry = (() => {
    switch (v.shape) {
      case 'cube':
        return <boxGeometry args={[2, 2, 2]} />;
      case 'cuboid':
        return <boxGeometry args={[k(0, 2.6), k(1, 1.6), k(2, 1.2)]} />;
      case 'sphere':
        return <sphereGeometry args={[1.4, 48, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[k(0, 1), k(0, 1), k(1, 2.4), 48]} />;
      case 'cone':
        return <coneGeometry args={[k(0, 1.2), k(1, 2.4), 48]} />;
      case 'pyramid':
        return <coneGeometry args={[1.5, 2.4, 4]} />;
      case 'torus':
        return <torusGeometry args={[1.2, 0.45, 32, 96]} />;
      case 'prism':
        return <cylinderGeometry args={[1.3, 1.3, 2.2, 3]} />;
    }
  })();
  return (
    <>
      <mesh>
        {geometry}
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.85} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh>
        {geometry}
        <meshBasicMaterial color="#c4b5fd" wireframe />
      </mesh>
      {v.labels.map((l, i) => {
        const a = (i / Math.max(1, v.labels.length)) * Math.PI * 2;
        return <Label key={i} position={[Math.cos(a) * 2.2, 1.6 - i * 0.5, Math.sin(a) * 2.2]}>{l}</Label>;
      })}
    </>
  );
}

function Molecule({ v }: { v: Extract<Visual, { type: 'molecule' }> }) {
  const pos = useMemo(() => layoutMolecule(v), [v]);
  return (
    <>
      {v.bonds.map((b, i) => {
        const a = new THREE.Vector3(...pos[b.a]);
        const c = new THREE.Vector3(...pos[b.b]);
        const mid = a.clone().add(c).multiplyScalar(0.5);
        const dir = c.clone().sub(a);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.06 * b.order, 0.06 * b.order, dir.length(), 12]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
        );
      })}
      {v.atoms.map((a) => (
        <group key={a.id} position={pos[a.id]}>
          <mesh>
            <sphereGeometry args={[a.element === 'H' ? 0.25 : 0.38, 32, 24]} />
            <meshStandardMaterial color={ELEMENT_COLORS[a.element]} roughness={0.4} />
          </mesh>
          <Label position={[0, 0.55, 0]}>{a.element}</Label>
        </group>
      ))}
    </>
  );
}

function Arrow({ to, color, label, dashed }: { to: THREE.Vector3; color: string; label: string; dashed?: boolean }) {
  const len = to.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().normalize());
  return (
    <group quaternion={q}>
      <mesh position={[0, (len - 0.3) / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, Math.max(0.01, len - 0.3), 12]} />
        <meshStandardMaterial color={color} transparent={dashed} opacity={dashed ? 0.7 : 1} />
      </mesh>
      <mesh position={[0, len - 0.15, 0]}>
        <coneGeometry args={[0.14, 0.3, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {label && <Label position={[0, len + 0.3, 0]}>{label}</Label>}
    </group>
  );
}

function Vectors({ v }: { v: Extract<Visual, { type: 'vectors' }> }) {
  const m = Math.max(1, ...v.vectors.flatMap((a) => [Math.abs(a.x), Math.abs(a.y), Math.abs(a.z)]));
  const s = 2.5 / m;
  const resultant = v.vectors.reduce((acc, a) => acc.add(new THREE.Vector3(a.x, a.y, a.z)), new THREE.Vector3());
  return (
    <>
      <axesHelper args={[3]} />
      {v.vectors.map((a, i) => (
        <Arrow key={i} to={new THREE.Vector3(a.x * s, a.y * s, a.z * s)} color="#7c3aed" label={a.label} />
      ))}
      {v.showResultant && resultant.length() > 0 && <Arrow to={resultant.multiplyScalar(s)} color="#f97316" label="Resultant" dashed />}
    </>
  );
}

function Orbit({ v, reducedMotion }: { v: Extract<Visual, { type: 'orbit' }>; reducedMotion: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const max = Math.max(...v.bodies.map((b) => b.radius));
  useFrame((state) => {
    if (reducedMotion) return;
    v.bodies.forEach((b, i) => {
      const g = refs.current[i];
      if (g) g.rotation.y = (state.clock.elapsedTime * 2 * Math.PI) / (b.period * 2) + i;
    });
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.45, 32, 24]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
      </mesh>
      <Label position={[0, 0.8, 0]}>{v.center}</Label>
      {v.bodies.map((b, i) => {
        const r = (b.radius / max) * 3;
        return (
          <group key={i}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.01, 8, 128]} />
              <meshBasicMaterial color="#9ca3af" />
            </mesh>
            <group ref={(el) => { refs.current[i] = el; }} rotation={[0, i * 2.4, 0]}>
              <mesh position={[r, 0, 0]}>
                <sphereGeometry args={[0.16, 24, 16]} />
                <meshStandardMaterial color="#7c3aed" />
              </mesh>
              <Label position={[r, 0.35, 0]}>{b.label}</Label>
            </group>
          </group>
        );
      })}
    </>
  );
}

function Wave({ v, reducedMotion }: { v: Extract<Visual, { type: 'wave' }>; reducedMotion: boolean }) {
  // a particle wave: N small spheres in one instanced mesh, moved through its ref (one draw call)
  const N = 120;
  const amp = (v.amplitude / 5) * 1.6;
  const ref = useRef<THREE.InstancedMesh>(null);
  const place = React.useCallback(
    (t: number) => {
      const mesh = ref.current;
      if (!mesh) return;
      const m = new THREE.Matrix4();
      for (let i = 0; i < N; i++) {
        m.makeTranslation(-4 + (8 * i) / (N - 1), amp * Math.sin((2 * Math.PI * v.waves * i) / (N - 1) - t * 2), 0);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    [amp, v.waves],
  );
  React.useEffect(() => place(0), [place]);
  useFrame((state) => {
    if (!reducedMotion) place(state.clock.elapsedTime);
  });
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, N]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial color="#7c3aed" />
      </instancedMesh>
      {v.label && <Label position={[0, amp + 0.6, 0]}>{v.label}</Label>}
    </>
  );
}

export default function Scene3D({ visual, reducedMotion }: Props) {
  const spin = visual.type === 'shape3d' || visual.type === 'molecule';
  const body = (() => {
    switch (visual.type) {
      case 'shape3d':
        return <Shape v={visual} />;
      case 'molecule':
        return <Molecule v={visual} />;
      case 'vectors':
        return <Vectors v={visual} />;
      case 'orbit':
        return <Orbit v={visual} reducedMotion={reducedMotion} />;
      case 'wave':
        return <Wave v={visual} reducedMotion={reducedMotion} />;
    }
  })();
  return (
    <Canvas
      frameloop={reducedMotion ? 'demand' : 'always'}
      camera={{ position: [0, 1.5, 6.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      {spin ? <Spin reducedMotion={reducedMotion}>{body}</Spin> : body}
      <OrbitControls enablePan={false} minDistance={3} maxDistance={14} />
    </Canvas>
  );
}
