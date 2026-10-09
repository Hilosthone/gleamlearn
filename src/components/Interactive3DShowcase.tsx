// "use client";

// import React, { useRef, useState, useEffect } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, Html, MeshDistortMaterial } from "@react-three/drei";
// import * as THREE from "three";
// import { 
//   Building2, 
//   Zap, 
//   HeartPulse, 
//   ChevronLeft, 
//   ChevronRight, 
//   Check, 
//   Lightbulb, 
//   Activity,
//   Calculator,
//   Palette,
//   TrendingUp
// } from "lucide-react";

// /**
//  * ArchitecturalModel Component
//  * Renders a multi-tiered structural wireframe / architectural massing model.
//  */
// function ArchitecturalModel({ isSelected }: { isSelected: boolean }) {
//   const groupRef = useRef<THREE.Group>(null);

//   useFrame((state) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
//     }
//   });

//   return (
//     <group ref={groupRef}>
//       <mesh position={[0, -1.5, 0]}>
//         <boxGeometry args={[3, 0.2, 3]} />
//         <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} wireframe={isSelected} />
//       </mesh>
//       <mesh position={[0, 0, 0]}>
//         <boxGeometry args={[1.8, 2.5, 1.8]} />
//         <meshStandardMaterial color="#3B82F6" metalness={0.8} roughness={0.1} transparent opacity={0.85} />
//       </mesh>
//       <mesh position={[0, 1.5, 0]}>
//         <coneGeometry args={[1.3, 1, 4]} />
//         <meshStandardMaterial color="#8B5CF6" metalness={0.7} roughness={0.3} />
//       </mesh>

//       <Html position={[0, 1.8, 0]} center distanceFactor={8}>
//         <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-purple-500/50 text-[10px] text-purple-800 dark:text-purple-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap animate-pulse flex items-center gap-1.5">
//           <Building2 className="w-3 h-3 text-purple-500" />
//           <span>Structural Core & Cantilever Beam</span>
//         </div>
//       </Html>
//     </group>
//   );
// }

// /**
//  * EngineeringTrussModel Component
//  * Renders a stress-tested civil engineering bridge or truss frame structure.
//  */
// function EngineeringTrussModel() {
//   const trussRef = useRef<THREE.Group>(null);

//   useFrame((state) => {
//     if (trussRef.current) {
//       trussRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
//     }
//   });

//   return (
//     <group ref={trussRef}>
//       <mesh position={[0, 0, 0]}>
//         <torusKnotGeometry args={[1.2, 0.35, 128, 32]} />
//         <MeshDistortMaterial color="#10B981" roughness={0.2} metalness={0.9} distort={0.2} speed={2} />
//       </mesh>

//       <Html position={[1.5, 1, 0]} center distanceFactor={8}>
//         <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-emerald-500/50 text-[10px] text-emerald-800 dark:text-emerald-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
//           <Zap className="w-3 h-3 text-emerald-500" />
//           <span>Maximum Load Stress Node (42MPa)</span>
//         </div>
//       </Html>
//     </group>
//   );
// }

// /**
//  * HumanAnatomyHeartModel Component
//  * Renders an anatomical cardiac heart model with pulsing contraction simulation.
//  */
// function HumanAnatomyHeartModel() {
//   const heartRef = useRef<THREE.Mesh>(null);

//   useFrame((state) => {
//     if (heartRef.current) {
//       const beat = Math.sin(state.clock.getElapsedTime() * 5) * 0.08 + 1;
//       heartRef.current.scale.set(beat, beat, beat);
//       heartRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
//     }
//   });

//   return (
//     <group>
//       <mesh ref={heartRef} position={[0, 0, 0]}>
//         <icosahedronGeometry args={[1.4, 2]} />
//         <MeshDistortMaterial color="#EF4444" roughness={0.1} metalness={0.6} distort={0.3} speed={4} />
//       </mesh>

//       <mesh position={[0.2, 1.4, 0]}>
//         <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
//         <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.5} />
//       </mesh>

//       <Html position={[0.4, 1.6, 0]} center distanceFactor={8}>
//         <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-red-500/50 text-[10px] text-red-800 dark:text-red-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
//           <HeartPulse className="w-3 h-3 text-red-500" />
//           <span>Aortic Arch (Oxygenated Blood Flow)</span>
//         </div>
//       </Html>

//       <Html position={[-0.8, -0.2, 0]} center distanceFactor={8}>
//         <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-red-500/50 text-[10px] text-red-800 dark:text-red-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
//           <Activity className="w-3 h-3 text-red-500" />
//           <span>Left Ventricle Chamber</span>
//         </div>
//       </Html>
//     </group>
//   );
// }

// /**
//  * MathematicsModel Component
//  * Renders an abstract mathematical vector space object (octahedron matrix).
//  */
// function MathematicsModel() {
//   const mathRef = useRef<THREE.Group>(null);

//   useFrame((state) => {
//     if (mathRef.current) {
//       mathRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
//       mathRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
//     }
//   });

//   return (
//     <group ref={mathRef}>
//       <mesh>
//         <octahedronGeometry args={[1.6, 0]} />
//         <MeshDistortMaterial color="#3B82F6" roughness={0.1} metalness={0.8} distort={0.2} speed={3} wireframe={false} />
//       </mesh>

//       <Html position={[0, 1.8, 0]} center distanceFactor={8}>
//         <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-blue-500/50 text-[10px] text-blue-800 dark:text-blue-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
//           <Calculator className="w-3 h-3 text-blue-500" />
//           <span>Vector Space Matrix (f(x,y,z))</span>
//         </div>
//       </Html>
//     </group>
//   );
// }

// /**
//  * ArtModel Component
//  * Renders an expressive generative distortion sculpture.
//  */
// function ArtModel() {
//   const artRef = useRef<THREE.Mesh>(null);

//   useFrame((state) => {
//     if (artRef.current) {
//       artRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
//       artRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
//     }
//   });

//   return (
//     <group>
//       <mesh ref={artRef}>
//         <dodecahedronGeometry args={[1.4, 0]} />
//         <MeshDistortMaterial color="#EC4899" roughness={0.15} metalness={0.5} distort={0.5} speed={5} />
//       </mesh>

//       <Html position={[0, 1.8, 0]} center distanceFactor={8}>
//         <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-pink-500/50 text-[10px] text-pink-800 dark:text-pink-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
//           <Palette className="w-3 h-3 text-pink-500" />
//           <span>Generative Form & Color Theory</span>
//         </div>
//       </Html>
//     </group>
//   );
// }

// /**
//  * EconomicsModel Component
//  * Renders a dynamic financial growth trajectory / stock progression model.
//  */
// function EconomicsModel() {
//   const ecoRef = useRef<THREE.Group>(null);

//   useFrame((state) => {
//     if (ecoRef.current) {
//       ecoRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
//     }
//   });

//   return (
//     <group ref={ecoRef}>
//       <mesh position={[0, 0, 0]}>
//         <cylinderGeometry args={[1.2, 1.6, 0.4, 32]} />
//         <MeshDistortMaterial color="#F59E0B" roughness={0.3} metalness={0.7} distort={0.1} speed={2} />
//       </mesh>
//       <mesh position={[0, 1, 0]}>
//         <coneGeometry args={[0.8, 1.5, 16]} />
//         <meshStandardMaterial color="#10B981" roughness={0.2} metalness={0.8} />
//       </mesh>

//       <Html position={[0, 2, 0]} center distanceFactor={8}>
//         <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-amber-500/50 text-[10px] text-amber-800 dark:text-amber-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
//           <TrendingUp className="w-3 h-3 text-amber-500" />
//           <span>Macroeconomic Yield & Growth Index</span>
//         </div>
//       </Html>
//     </group>
//   );
// }

// type ModuleKey = "anatomy" | "engineering" | "architecture" | "mathematics" | "art" | "economics";

// /**
//  * InvestorShowcaseEngine Component
//  * Fully adaptive light & dark mode 3D interactive showcase supporting 6 core subjects with 2-second idle auto-rotation.
//  */
// export default function InvestorShowcaseEngine() {
//   const [activeModule, setActiveModule] = useState<ModuleKey>("anatomy");
//   const [isPaused, setIsPaused] = useState(false);
  
//   const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const modulesList: ModuleKey[] = ["anatomy", "engineering", "architecture", "mathematics", "art", "economics"];

//   // Autonomous cycling effect every 2 seconds when user is idle
//   useEffect(() => {
//     if (isPaused) return;

//     const interval = setInterval(() => {
//       setActiveModule((prev) => {
//         const currentIndex = modulesList.indexOf(prev);
//         const nextIndex = (currentIndex + 1) % modulesList.length;
//         return modulesList[nextIndex];
//       });
//     }, 2000);

//     return () => clearInterval(interval);
//   }, [isPaused]);

//   const handleUserInteraction = () => {
//     setIsPaused(true);
//     if (interactionTimeoutRef.current) {
//       clearTimeout(interactionTimeoutRef.current);
//     }
//     interactionTimeoutRef.current = setTimeout(() => {
//       setIsPaused(false);
//     }, 2000);
//   };

//   const handlePrev = () => {
//     handleUserInteraction();
//     setActiveModule((prev) => {
//       const idx = modulesList.indexOf(prev);
//       const prevIdx = (idx - 1 + modulesList.length) % modulesList.length;
//       return modulesList[prevIdx];
//     });
//   };

//   const handleNext = () => {
//     handleUserInteraction();
//     setActiveModule((prev) => {
//       const idx = modulesList.indexOf(prev);
//       const nextIdx = (idx + 1) % modulesList.length;
//       return modulesList[nextIdx];
//     });
//   };

//   const moduleData = {
//     anatomy: {
//       title: "Interactive Human Anatomy & Physiology",
//       badge: "Medical Science Studio",
//       desc: "Explore real-time biomechanical organ systems. Inspect chamber contractions, trace blood flow pathways, and toggle clinical layer notes directly in browser WebGL.",
//       tags: ["Cardiovascular System", "Systole Simulation", "Clinical Annotations"],
//     },
//     engineering: {
//       title: "Civil & Structural Engineering Stress Testing",
//       badge: "Mechanical & Structural CAD",
//       desc: "Analyze load distribution, tension nodes, and material resilience under simulated environmental stress parameters before physical prototyping.",
//       tags: ["Finite Element Analysis", "Truss Load Vectors", "Material Yield Limits"],
//     },
//     architecture: {
//       title: "Architectural Massing & BIM Visualization",
//       badge: "Spatial Design & BIM",
//       desc: "Inspect complex multi-story spatial configurations, structural wireframes, and environmental sun-path shadows with millimeter-level precision.",
//       tags: ["BIM Integration", "Spatial Massing", "Structural Wireframe"],
//     },
//     mathematics: {
//       title: "Advanced Mathematics & Vector Matrices",
//       badge: "STEM & Abstract Logic",
//       desc: "Visualize multi-dimensional equations, matrix transformations, and topological geometries interactively in 3D coordinate space.",
//       tags: ["Vector Calculus", "Topological Mapping", "Matrix Equations"],
//     },
//     art: {
//       title: "Generative Art & Computational Design",
//       badge: "Digital Media & Aesthetics",
//       desc: "Examine algorithmic vertex distortions, color theory models, and real-time procedural aesthetics crafted through code.",
//       tags: ["Algorithmic Shaders", "Procedural Geometry", "Color Harmonics"],
//     },
//     economics: {
//       title: "Macroeconomic Modeling & Yield Growth",
//       badge: "Financial Engineering",
//       desc: "Simulate market equilibria, capital allocation trajectories, and risk-adjusted growth matrices across dynamic parameters.",
//       tags: ["Market Equilibria", "Yield Curves", "Capital Asset Pricing"],
//     },
//   }[activeModule];

//   return (
//     <section className="py-24 bg-white dark:bg-dark-bg text-gray-950 dark:text-[#F3F4F6] relative overflow-hidden border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
//         {/* Left Side: Context, Manual Controls & Editorial Copy */}
//         <div className="lg:col-span-5 space-y-6">
//           <div className="flex items-center justify-between">
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold">
//               <span>{moduleData.badge}</span>
//             </div>
//             {/* Manual Navigation Controls */}
//             <div className="flex items-center gap-1.5">
//               <button
//                 type="button"
//                 onClick={handlePrev}
//                 className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
//                 title="Previous Module"
//               >
//                 <ChevronLeft className="w-3.5 h-3.5" />
//                 <span>Prev</span>
//               </button>
//               <button
//                 type="button"
//                 onClick={handleNext}
//                 className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
//                 title="Next Module"
//               >
//                 <span>Next</span>
//                 <ChevronRight className="w-3.5 h-3.5" />
//               </button>
//             </div>
//           </div>
          
//           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
//             {moduleData.title}
//           </h2>
          
//           <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
//             {moduleData.desc}
//           </p>

//           {/* Discipline Selector Buttons */}
//           <div className="space-y-3 pt-2">
//             <div className="flex items-center justify-between">
//               <p className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Simulation Suite:</p>
//               <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isPaused ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
//                 {isPaused ? "Paused (User Active)" : "Auto-cycling..."}
//               </span>
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {modulesList.map((mod) => (
//                 <button
//                   key={mod}
//                   type="button"
//                   onClick={() => {
//                     handleUserInteraction();
//                     setActiveModule(mod);
//                   }}
//                   className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
//                     activeModule === mod 
//                       ? "bg-gray-900 text-white dark:bg-white dark:text-gray-950 font-bold shadow-lg" 
//                       : "bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white"
//                   }`}
//                 >
//                   {mod === "anatomy" && <HeartPulse className="w-3.5 h-3.5 text-red-500 shrink-0" />}
//                   {mod === "engineering" && <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
//                   {mod === "architecture" && <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
//                   {mod === "mathematics" && <Calculator className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
//                   {mod === "art" && <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
//                   {mod === "economics" && <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
//                   <span className="capitalize truncate">{mod}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Feature Tag pills */}
//           <div className="flex flex-wrap gap-2 pt-2">
//             {moduleData.tags.map((tag, idx) => (
//               <span key={idx} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-[11px] text-gray-700 dark:text-gray-300 font-mono flex items-center gap-1.5">
//                 <Check className="w-3 h-3 text-brand-green" />
//                 <span>{tag}</span>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Right Side: The Enterprise 3D Viewport Canvas */}
//         <div 
//           className="lg:col-span-7 h-[480px] bg-gray-50 dark:bg-dark-card/50 rounded-3xl border border-gray-200 dark:border-dark-border relative overflow-hidden shadow-2xl transition-colors duration-300"
//           onPointerDown={handleUserInteraction}
//           onWheel={handleUserInteraction}
//         >
//           {/* Telemetry Status HUD */}
//           <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200 dark:border-white/10 text-[11px] font-mono text-gray-700 dark:text-gray-300 flex items-center gap-2 shadow-xl">
//             <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-400 animate-ping'}`} />
//             <span>WebGL Engine 60 FPS</span>
//           </div>

//           <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
//             <ambientLight intensity={1.8} />
//             <directionalLight position={[10, 15, 10]} intensity={2.5} />
//             <pointLight position={[-10, -10, -5]} color="#3B82F6" intensity={4} />

//             {activeModule === "anatomy" && <HumanAnatomyHeartModel />}
//             {activeModule === "engineering" && <EngineeringTrussModel />}
//             {activeModule === "architecture" && <ArchitecturalModel isSelected={false} />}
//             {activeModule === "mathematics" && <MathematicsModel />}
//             {activeModule === "art" && <ArtModel />}
//             {activeModule === "economics" && <EconomicsModel />}

//             <OrbitControls enableZoom={true} enablePan={false} maxDistance={8} minDistance={2} />
//           </Canvas>

//           {/* Interactive Navigation Footer Overlay */}
//           <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 shadow-2xl">
//             <div className="flex items-center gap-1.5">
//               <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
//               <span><strong>Demo Note:</strong> Interacting pauses auto-rotation for 2 seconds.</span>
//             </div>
//             <span className="font-mono text-brand-purple">gleamLearn Enterprise 3D</span>
//           </div>
//         </div>

//       </div>
//     </section>
//   );
// }













"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import {
  Building2,
  Zap,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  Lightbulb,
  Activity,
  Calculator,
  Palette,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

/**
 * ArchitecturalModel Component
 * Renders a multi-tiered structural wireframe / architectural massing model.
 */
function ArchitecturalModel({ isSelected }: { isSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} wireframe={isSelected} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 2.5, 1.8]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.8} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[1.3, 1, 4]} />
        <meshStandardMaterial color="#8B5CF6" metalness={0.7} roughness={0.3} />
      </mesh>

      <Html position={[0, 1.8, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-purple-500/50 text-[10px] text-purple-800 dark:text-purple-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap animate-pulse flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-purple-500" />
          <span>Structural Core & Cantilever Beam</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * EngineeringTrussModel Component
 * Renders a stress-tested civil engineering bridge or truss frame structure.
 */
function EngineeringTrussModel() {
  const trussRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (trussRef.current) {
      trussRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={trussRef}>
      <mesh position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.2, 0.35, 128, 32]} />
        <MeshDistortMaterial color="#10B981" roughness={0.2} metalness={0.9} distort={0.2} speed={2} />
      </mesh>

      <Html position={[1.5, 1, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-emerald-500/50 text-[10px] text-emerald-800 dark:text-emerald-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-emerald-500" />
          <span>Maximum Load Stress Node (42MPa)</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * HumanAnatomyHeartModel Component
 * Renders an anatomical cardiac heart model with pulsing contraction simulation.
 */
function HumanAnatomyHeartModel() {
  const heartRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (heartRef.current) {
      const beat = Math.sin(state.clock.getElapsedTime() * 5) * 0.08 + 1;
      heartRef.current.scale.set(beat, beat, beat);
      heartRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <group>
      <mesh ref={heartRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.4, 2]} />
        <MeshDistortMaterial color="#EF4444" roughness={0.1} metalness={0.6} distort={0.3} speed={4} />
      </mesh>

      <mesh position={[0.2, 1.4, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
        <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.5} />
      </mesh>

      <Html position={[0.4, 1.6, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-red-500/50 text-[10px] text-red-800 dark:text-red-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <HeartPulse className="w-3 h-3 text-red-500" />
          <span>Aortic Arch (Oxygenated Blood Flow)</span>
        </div>
      </Html>

      <Html position={[-0.8, -0.2, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-red-500/50 text-[10px] text-red-800 dark:text-red-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-red-500" />
          <span>Left Ventricle Chamber</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * MathematicsModel Component
 * Renders an abstract mathematical vector space object (octahedron matrix).
 */
function MathematicsModel() {
  const mathRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (mathRef.current) {
      mathRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      mathRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={mathRef}>
      <mesh>
        <octahedronGeometry args={[1.6, 0]} />
        <MeshDistortMaterial color="#3B82F6" roughness={0.1} metalness={0.8} distort={0.2} speed={3} wireframe={false} />
      </mesh>

      <Html position={[0, 1.8, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-blue-500/50 text-[10px] text-blue-800 dark:text-blue-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <Calculator className="w-3 h-3 text-blue-500" />
          <span>Vector Space Matrix (f(x,y,z))</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * ArtModel Component
 * Renders an expressive generative distortion sculpture.
 */
function ArtModel() {
  const artRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (artRef.current) {
      artRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      artRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={artRef}>
        <dodecahedronGeometry args={[1.4, 0]} />
        <MeshDistortMaterial color="#EC4899" roughness={0.15} metalness={0.5} distort={0.5} speed={5} />
      </mesh>

      <Html position={[0, 1.8, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-pink-500/50 text-[10px] text-pink-800 dark:text-pink-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-pink-500" />
          <span>Generative Form & Color Theory</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * EconomicsModel Component
 * Renders a dynamic financial growth trajectory / stock progression model.
 */
function EconomicsModel() {
  const ecoRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ecoRef.current) {
      ecoRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={ecoRef}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.6, 0.4, 32]} />
        <MeshDistortMaterial color="#F59E0B" roughness={0.3} metalness={0.7} distort={0.1} speed={2} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.8, 1.5, 16]} />
        <meshStandardMaterial color="#10B981" roughness={0.2} metalness={0.8} />
      </mesh>

      <Html position={[0, 2, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md border border-amber-500/50 text-[10px] text-amber-800 dark:text-amber-200 font-mono shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-amber-500" />
          <span>Macroeconomic Yield & Growth Index</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Button-driven camera (replaces OrbitControls so the page can scroll) */
/* ------------------------------------------------------------------ */

type ViewState = { azimuth: number; polar: number; distance: number };

const DEFAULT_VIEW: ViewState = { azimuth: 0, polar: Math.PI / 2, distance: 5.5 };
const MIN_DISTANCE = 2;
const MAX_DISTANCE = 8;
const MIN_POLAR = 0.35;
const MAX_POLAR = Math.PI - 0.35;
const ROTATE_STEP = 0.15; // radians per press / repeat tick
const ZOOM_STEP = 1.12; // multiplicative

/**
 * CameraRig
 * Smoothly eases the camera toward the target view held in `viewRef`.
 * No pointer/wheel listeners are attached, so scrolling over the canvas works normally.
 */
function CameraRig({ viewRef }: { viewRef: React.MutableRefObject<ViewState> }) {
  const camera = useThree((state) => state.camera);
  const current = useRef<ViewState>({ ...DEFAULT_VIEW });

  useFrame((_, delta) => {
    const t = 1 - Math.exp(-8 * delta); // frame-rate independent easing
    const c = current.current;
    const target = viewRef.current;

    c.azimuth += (target.azimuth - c.azimuth) * t;
    c.polar += (target.polar - c.polar) * t;
    c.distance += (target.distance - c.distance) * t;

    camera.position.setFromSphericalCoords(c.distance, c.polar, c.azimuth);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/**
 * ControlButton
 * Tap/click = one step. Press and hold = repeats.
 * Uses aria-disabled instead of `disabled` so pointerup always fires and the repeat timer stops.
 */
function ControlButton({
  label,
  onAction,
  disabled = false,
  children,
}: {
  label: string;
  onAction: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const actionRef = useRef(onAction);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didRepeatRef = useRef(false);

  useEffect(() => {
    actionRef.current = onAction;
  }, [onAction]);

  const stop = useCallback(() => {
    if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
    if (repeatRef.current) clearInterval(repeatRef.current);
    holdDelayRef.current = null;
    repeatRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-disabled={disabled}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        stop();
        didRepeatRef.current = false;
        holdDelayRef.current = setTimeout(() => {
          didRepeatRef.current = true;
          actionRef.current();
          repeatRef.current = setInterval(() => actionRef.current(), 70);
        }, 350);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={() => {
        // A hold already applied the action; don't add an extra step on release.
        if (didRepeatRef.current) {
          didRepeatRef.current = false;
          return;
        }
        actionRef.current();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all touch-manipulation select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
        disabled
          ? "bg-gray-100/60 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed"
          : "bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 active:scale-90 cursor-pointer shadow-sm"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

type ModuleKey = "anatomy" | "engineering" | "architecture" | "mathematics" | "art" | "economics";

const MODULES_LIST: ModuleKey[] = ["anatomy", "engineering", "architecture", "mathematics", "art", "economics"];

const MODULE_DATA: Record<ModuleKey, { title: string; badge: string; desc: string; tags: string[] }> = {
  anatomy: {
    title: "Interactive Human Anatomy & Physiology",
    badge: "Medical Science Studio",
    desc: "Explore real-time biomechanical organ systems. Inspect chamber contractions, trace blood flow pathways, and toggle clinical layer notes directly in browser WebGL.",
    tags: ["Cardiovascular System", "Systole Simulation", "Clinical Annotations"],
  },
  engineering: {
    title: "Civil & Structural Engineering Stress Testing",
    badge: "Mechanical & Structural CAD",
    desc: "Analyze load distribution, tension nodes, and material resilience under simulated environmental stress parameters before physical prototyping.",
    tags: ["Finite Element Analysis", "Truss Load Vectors", "Material Yield Limits"],
  },
  architecture: {
    title: "Architectural Massing & BIM Visualization",
    badge: "Spatial Design & BIM",
    desc: "Inspect complex multi-story spatial configurations, structural wireframes, and environmental sun-path shadows with millimeter-level precision.",
    tags: ["BIM Integration", "Spatial Massing", "Structural Wireframe"],
  },
  mathematics: {
    title: "Advanced Mathematics & Vector Matrices",
    badge: "STEM & Abstract Logic",
    desc: "Visualize multi-dimensional equations, matrix transformations, and topological geometries interactively in 3D coordinate space.",
    tags: ["Vector Calculus", "Topological Mapping", "Matrix Equations"],
  },
  art: {
    title: "Generative Art & Computational Design",
    badge: "Digital Media & Aesthetics",
    desc: "Examine algorithmic vertex distortions, color theory models, and real-time procedural aesthetics crafted through code.",
    tags: ["Algorithmic Shaders", "Procedural Geometry", "Color Harmonics"],
  },
  economics: {
    title: "Macroeconomic Modeling & Yield Growth",
    badge: "Financial Engineering",
    desc: "Simulate market equilibria, capital allocation trajectories, and risk-adjusted growth matrices across dynamic parameters.",
    tags: ["Market Equilibria", "Yield Curves", "Capital Asset Pricing"],
  },
};

/**
 * InvestorShowcaseEngine Component
 * Fully adaptive light & dark mode 3D interactive showcase supporting 6 core subjects with 2-second idle auto-rotation.
 * The 3D view is controlled only by on-screen buttons (and keyboard when focused), never by drag or wheel,
 * so it doesn't hijack page scrolling.
 */
export default function InvestorShowcaseEngine() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("anatomy");
  const [isPaused, setIsPaused] = useState(false);
  const [distance, setDistance] = useState(DEFAULT_VIEW.distance);

  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewRef = useRef<ViewState>({ ...DEFAULT_VIEW });

  // Autonomous cycling effect every 2 seconds when user is idle
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveModule((prev) => MODULES_LIST[(MODULES_LIST.indexOf(prev) + 1) % MODULES_LIST.length]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };
  }, []);

  const handleUserInteraction = useCallback(() => {
    setIsPaused(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  }, []);

  const handlePrev = () => {
    handleUserInteraction();
    setActiveModule((prev) => MODULES_LIST[(MODULES_LIST.indexOf(prev) - 1 + MODULES_LIST.length) % MODULES_LIST.length]);
  };

  const handleNext = () => {
    handleUserInteraction();
    setActiveModule((prev) => MODULES_LIST[(MODULES_LIST.indexOf(prev) + 1) % MODULES_LIST.length]);
  };

  // --- View controls -------------------------------------------------
  // Directions are model-centric: "right" spins the model to the right (camera orbits left).
  const rotate = useCallback(
    (dAzimuth: number, dPolar: number) => {
      handleUserInteraction();
      const v = viewRef.current;
      v.azimuth += dAzimuth;
      v.polar = THREE.MathUtils.clamp(v.polar + dPolar, MIN_POLAR, MAX_POLAR);
    },
    [handleUserInteraction]
  );

  const zoom = useCallback(
    (direction: "in" | "out") => {
      handleUserInteraction();
      const v = viewRef.current;
      const next = direction === "in" ? v.distance / ZOOM_STEP : v.distance * ZOOM_STEP;
      v.distance = THREE.MathUtils.clamp(next, MIN_DISTANCE, MAX_DISTANCE);
      setDistance(v.distance);
    },
    [handleUserInteraction]
  );

  const resetView = useCallback(() => {
    handleUserInteraction();
    const v = viewRef.current;
    // Snap to the nearest full turn so reset doesn't spin through several revolutions.
    v.azimuth = Math.round(v.azimuth / (Math.PI * 2)) * Math.PI * 2;
    v.polar = DEFAULT_VIEW.polar;
    v.distance = DEFAULT_VIEW.distance;
    setDistance(v.distance);
  }, [handleUserInteraction]);

  const rotateLeft = useCallback(() => rotate(ROTATE_STEP, 0), [rotate]);
  const rotateRight = useCallback(() => rotate(-ROTATE_STEP, 0), [rotate]);
  const rotateUp = useCallback(() => rotate(0, ROTATE_STEP), [rotate]);
  const rotateDown = useCallback(() => rotate(0, -ROTATE_STEP), [rotate]);
  const zoomIn = useCallback(() => zoom("in"), [zoom]);
  const zoomOut = useCallback(() => zoom("out"), [zoom]);

  // Keyboard shortcuts while the viewport has focus (Tab into it).
  const handleViewportKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: rotateLeft,
      ArrowRight: rotateRight,
      ArrowUp: rotateUp,
      ArrowDown: rotateDown,
      "+": zoomIn,
      "=": zoomIn,
      "-": zoomOut,
      "0": resetView,
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  const zoomPercent = Math.round((DEFAULT_VIEW.distance / distance) * 100);
  const atMaxZoom = distance <= MIN_DISTANCE + 0.001;
  const atMinZoom = distance >= MAX_DISTANCE - 0.001;

  const moduleData = MODULE_DATA[activeModule];

  return (
    <section className="py-24 bg-white dark:bg-dark-bg text-gray-950 dark:text-[#F3F4F6] relative overflow-hidden border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left Side: Context, Manual Controls & Editorial Copy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold">
              <span>{moduleData.badge}</span>
            </div>
            {/* Manual Navigation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Previous Module"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Next Module"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            {moduleData.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {moduleData.desc}
          </p>

          {/* Discipline Selector Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Simulation Suite:</p>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isPaused ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                {isPaused ? "Paused (User Active)" : "Auto-cycling..."}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MODULES_LIST.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => {
                    handleUserInteraction();
                    setActiveModule(mod);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeModule === mod
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-950 font-bold shadow-lg"
                      : "bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white"
                  }`}
                >
                  {mod === "anatomy" && <HeartPulse className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                  {mod === "engineering" && <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  {mod === "architecture" && <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                  {mod === "mathematics" && <Calculator className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  {mod === "art" && <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                  {mod === "economics" && <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  <span className="capitalize truncate">{mod}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Tag pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {moduleData.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-[11px] text-gray-700 dark:text-gray-300 font-mono flex items-center gap-1.5">
                <Check className="w-3 h-3 text-brand-green" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: The Enterprise 3D Viewport Canvas */}
        <div
          tabIndex={0}
          role="group"
          aria-label="3D model viewer. Use arrow keys to rotate, plus and minus to zoom, 0 to reset."
          onKeyDown={handleViewportKeyDown}
          className="lg:col-span-7 h-[480px] bg-gray-50 dark:bg-dark-card/50 rounded-3xl border border-gray-200 dark:border-dark-border relative overflow-hidden shadow-2xl transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
        >
          {/* Telemetry Status HUD */}
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200 dark:border-white/10 text-[11px] font-mono text-gray-700 dark:text-gray-300 flex items-center gap-2 shadow-xl">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-400 animate-ping'}`} />
            <span>WebGL Engine 60 FPS</span>
          </div>

          {/* touch-action: pan-y lets finger swipes over the canvas scroll the page */}
          <Canvas camera={{ position: [0, 0, DEFAULT_VIEW.distance], fov: 45 }} style={{ touchAction: "pan-y" }}>
            <ambientLight intensity={1.8} />
            <directionalLight position={[10, 15, 10]} intensity={2.5} />
            <pointLight position={[-10, -10, -5]} color="#3B82F6" intensity={4} />

            {activeModule === "anatomy" && <HumanAnatomyHeartModel />}
            {activeModule === "engineering" && <EngineeringTrussModel />}
            {activeModule === "architecture" && <ArchitecturalModel isSelected={false} />}
            {activeModule === "mathematics" && <MathematicsModel />}
            {activeModule === "art" && <ArtModel />}
            {activeModule === "economics" && <EconomicsModel />}

            <CameraRig viewRef={viewRef} />
          </Canvas>

          {/* View Controls Dock */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 p-2.5 rounded-2xl bg-white/80 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-xl">
            {/* Rotate D-pad */}
            <div className="grid grid-cols-3 gap-1">
              <span />
              <ControlButton label="Rotate up" onAction={rotateUp}>
                <ChevronUp className="w-4 h-4" />
              </ControlButton>
              <span />
              <ControlButton label="Rotate left" onAction={rotateLeft}>
                <ChevronLeft className="w-4 h-4" />
              </ControlButton>
              <ControlButton label="Reset view" onAction={resetView}>
                <RotateCcw className="w-3.5 h-3.5" />
              </ControlButton>
              <ControlButton label="Rotate right" onAction={rotateRight}>
                <ChevronRight className="w-4 h-4" />
              </ControlButton>
              <span />
              <ControlButton label="Rotate down" onAction={rotateDown}>
                <ChevronDown className="w-4 h-4" />
              </ControlButton>
              <span />
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-white/10" />

            {/* Zoom */}
            <div className="flex items-center gap-1">
              <ControlButton label="Zoom out" onAction={zoomOut} disabled={atMinZoom}>
                <ZoomOut className="w-4 h-4" />
              </ControlButton>
              <span className="w-10 text-center text-[10px] font-mono tabular-nums text-gray-600 dark:text-gray-400" aria-live="polite">
                {zoomPercent}%
              </span>
              <ControlButton label="Zoom in" onAction={zoomIn} disabled={atMaxZoom}>
                <ZoomIn className="w-4 h-4" />
              </ControlButton>
            </div>
          </div>

          {/* Interactive Navigation Footer Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 flex items-center justify-between gap-3 text-xs text-gray-700 dark:text-gray-300 shadow-2xl">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span><strong>Tip:</strong> Tap or hold the controls to rotate &amp; zoom.</span>
            </div>
            <span className="hidden sm:inline font-mono text-brand-purple whitespace-nowrap">gleamLearn Enterprise 3D</span>
          </div>
        </div>

      </div>
    </section>
  );
}