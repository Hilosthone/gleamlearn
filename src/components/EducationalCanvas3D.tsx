// "use client";

// import React, { useRef, useState, useEffect } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { Float, MeshDistortMaterial } from "@react-three/drei";
// import * as THREE from "three";

// // Autonomous Scene that automatically cycles through disciplines
// function AutonomousAcademicScene() {
//   const groupRef = useRef<THREE.Group>(null);
//   const ringRef = useRef<THREE.Mesh>(null);
//   const [activeDiscipline, setActiveDiscipline] = useState(0);

//   // Disciplines data array
//   const disciplines = [
//     { name: "Engineering & Mechanics", color: "#3b82f6", subtitle: "CAD, Physics & Circuit Architecture" },
//     { name: "Medical & Health Sciences", color: "#10b981", subtitle: "Anatomy, Pharmacology & Diagnostics" },
//     { name: "Commercial & FinTech", color: "#f97316", subtitle: "Economics, Accounting & Trade Models" },
//     { name: "Arts & Humanities", color: "#a855f7", subtitle: "Literature, Philosophy & History" }
//   ];

//   // Automatically switch discipline every 4 seconds to keep it lively
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setActiveDiscipline((prev) => (prev + 1) % disciplines.length);
//     }, 2000);
//     return () => clearInterval(timer);
//   }, [disciplines.length]);

//   useFrame((state) => {
//     const time = state.clock.getElapsedTime();
//     if (groupRef.current) {
//       groupRef.current.rotation.y = time * 0.4;
//       groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
//     }
//     if (ringRef.current) {
//       ringRef.current.rotation.z = time * 0.6;
//     }
//   });

//   return (
//     <>
//       <ambientLight intensity={1.5} />
//       <directionalLight position={[10, 10, 5]} intensity={3} />
//       <pointLight position={[-10, -10, -5]} intensity={1.5} />

//       <group ref={groupRef}>
//         {/* --- 0. ENGINEERING (Rotating Gears & Core) --- */}
//         {activeDiscipline === 0 && (
//           <Float speed={3} rotationIntensity={1} floatIntensity={1.5}>
//             <mesh>
//               <torusKnotGeometry args={[1, 0.3, 128, 32]} />
//               <MeshDistortMaterial color="#3b82f6" roughness={0.2} metalness={0.8} distort={0.3} speed={3} />
//             </mesh>
//           </Float>
//         )}

//         {/* --- 1. MEDICAL (DNA Double Helix / Cell Structure) --- */}
//         {activeDiscipline === 1 && (
//           <group>
//             <mesh position={[0, 0, 0]}>
//               <icosahedronGeometry args={[1.2, 1]} />
//               <MeshDistortMaterial color="#10b981" roughness={0.1} metalness={0.9} distort={0.5} speed={4} />
//             </mesh>
//             <mesh ref={ringRef} rotation={[1, 1, 0]}>
//               <torusGeometry args={[1.7, 0.05, 16, 100]} />
//               <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={1} />
//             </mesh>
//           </group>
//         )}

//         {/* --- 2. COMMERCIAL / FINTECH (Growth Pyramid / Ledger Nodes) --- */}
//         {activeDiscipline === 2 && (
//           <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1}>
//             <mesh rotation={[0, 0, 0]}>
//               <octahedronGeometry args={[1.4, 0]} />
//               <MeshDistortMaterial color="#f97316" roughness={0.3} metalness={0.7} distort={0.2} speed={2} />
//             </mesh>
//           </Float>
//         )}

//         {/* --- 3. ARTS & HUMANITIES (Abstract Fluid Knowledge Core) --- */}
//         {activeDiscipline === 3 && (
//           <Float speed={3.5} rotationIntensity={1.2} floatIntensity={2}>
//             <mesh>
//               <dodecahedronGeometry args={[1.2, 0]} />
//               <MeshDistortMaterial color="#a855f7" roughness={0.2} metalness={0.5} distort={0.6} speed={5} />
//             </mesh>
//           </Float>
//         )}
//       </group>
//     </>
//   );
// }

// export default function EducationalCanvas3D() {
//   return (
//     <div className="w-full h-full min-h-[380px] relative flex flex-col items-center justify-center">
//       <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
//         <AutonomousAcademicScene />
//       </Canvas>
//     </div>
//   );
// }



"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Text, Html } from "@react-three/drei";
import * as THREE from "three";

// Autonomous Scene with Real Formulas, Blueprint Grids, and Academic Labeling
function AutonomousAcademicScene() {
  const groupRef = useRef<THREE.Group>(null);
  const [activeDiscipline, setActiveDiscipline] = useState(0);

  const disciplines = [
    { 
      name: "Engineering & Mechanics", 
      color: "#3b82f6", 
      formula: "σ = F / A (Stress & Strain)",
      label: "CAD Blueprint & Vector Force" 
    },
    { 
      name: "Medical & Health Sciences", 
      color: "#10b981", 
      formula: "pH = -log[H⁺] (Biochemical Equilibrium)",
      label: "Cellular Structure & Diagnostics" 
    },
    { 
      name: "Commercial & FinTech", 
      color: "#f97316", 
      formula: "A = P(1 + r/n)^(nt) (Compound Interest)",
      label: "Macroeconomic Ledger Node" 
    },
    { 
      name: "Arts & Humanities", 
      color: "#a855f7", 
      formula: "H₀: Synthesis & Hermeneutics",
      label: "Philosophical Text Architecture" 
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDiscipline((prev) => (prev + 1) % disciplines.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [disciplines.length]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.3;
      groupRef.current.rotation.x = Math.sin(time * 0.4) * 0.15;
    }
  });

  const currentDisc = disciplines[activeDiscipline];

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={3} />
      <pointLight position={[-10, -10, -5]} intensity={1.5} />

      {/* --- FLOATING 3D ACADEMIC FORMULA & LABEL OVERLAY --- */}
      <group position={[0, 1.6, 0]}>
        <Html center distanceFactor={6} className="pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white text-center shadow-xl whitespace-nowrap">
            <p className="text-[11px] font-mono font-bold tracking-wider text-cyan-400">{currentDisc.formula}</p>
            <p className="text-[9px] text-gray-300 font-sans">{currentDisc.label}</p>
          </div>
        </Html>
      </group>

      {/* --- 3D MODELS WITH BLUEPRINT/WIREFRAME STYLING --- */}
      <group ref={groupRef} position={[0, -0.2, 0]}>
        
        {/* --- 0. ENGINEERING: Mechanical Stress / Torus Knot Blueprint --- */}
        {activeDiscipline === 0 && (
          <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1}>
            <mesh>
              <torusKnotGeometry args={[0.9, 0.28, 128, 32]} />
              <meshStandardMaterial color="#3b82f6" wireframe={true} emissive="#3b82f6" emissiveIntensity={0.5} />
            </mesh>
            {/* Inner Solid Core */}
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="#60a5fa" roughness={0.2} metalness={0.9} />
            </mesh>
          </Float>
        )}

        {/* --- 1. MEDICAL: Cellular / Molecular Dodecahedron --- */}
        {activeDiscipline === 1 && (
          <Float speed={3} rotationIntensity={1} floatIntensity={1.2}>
            <mesh>
              <dodecahedronGeometry args={[1.1, 0]} />
              <MeshDistortMaterial color="#10b981" roughness={0.1} metalness={0.8} distort={0.4} speed={3} />
            </mesh>
            {/* Outer Grid Ring */}
            <mesh rotation={[1, 0.5, 0]}>
              <torusGeometry args={[1.5, 0.03, 16, 64]} />
              <meshStandardMaterial color="#34d399" wireframe />
            </mesh>
          </Float>
        )}

        {/* --- 2. COMMERCIAL: Growth Pyramid / Octahedron Ledger --- */}
        {activeDiscipline === 2 && (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh>
              <octahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial color="#f97316" wireframe={true} emissive="#f97316" emissiveIntensity={0.6} />
            </mesh>
            <mesh scale={0.7}>
              <boxGeometry args={[1, 1, 1]} />
              <MeshDistortMaterial color="#fb923c" roughness={0.3} metalness={0.5} distort={0.2} />
            </mesh>
          </Float>
        )}

        {/* --- 3. ARTS & HUMANITIES: Icosahedron Knowledge Matrix --- */}
        {activeDiscipline === 3 && (
          <Float speed={3.5} rotationIntensity={1.2} floatIntensity={1.5}>
            <mesh>
              <icosahedronGeometry args={[1.2, 0]} />
              <MeshDistortMaterial color="#a855f7" roughness={0.2} metalness={0.6} distort={0.5} speed={4} />
            </mesh>
          </Float>
        )}
      </group>
    </>
  );
}

export default function EducationalCanvas3D() {
  return (
    <div className="w-full h-full min-h-[380px] relative flex flex-col items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <AutonomousAcademicScene />
      </Canvas>
    </div>
  );
}