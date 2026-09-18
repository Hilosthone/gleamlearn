// "use client";

// import React, { useRef } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, Float, MeshDistortMaterial } from "@react-three/drei";
// import * as THREE from "three";

// /**
//  * EducationalModel Component
//  * Renders an interactive 3D educational object (e.g., AI Molecular / DNA Node Concept)
//  * that rotates continuously and responds to user interaction.
//  */
// function EducationalModel() {
//   const meshRef = useRef<THREE.Mesh>(null);

//   // Gentle continuous rotation for a futuristic floating feel
//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
//       meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
//     }
//   });

//   return (
//     <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
//       <mesh ref={meshRef} scale={1.8}>
//         <icosahedronGeometry args={[1, 1]} />
//         <MeshDistortMaterial
//           color="#7C3AED" // AI Purple brand accent
//           roughness={0.2}
//           metalness={0.8}
//           distort={0.4}
//           speed={3}
//         />
//       </mesh>
//       {/* Orbiting satellite node representing interactive learning particles */}
//       <mesh position={[2, 1, 0]}>
//         <sphereGeometry args={[0.3, 32, 32]} />
//         <meshStandardMaterial color="#2563EB" emissive="#2563EB" emissiveIntensity={0.5} />
//       </mesh>
//     </Float>
//   );
// }

// /**
//  * Interactive3DShowcase Component
//  * Combines descriptive editorial copy with a high-performance 3D WebGL viewport canvas.
//  */
// export default function Interactive3DShowcase() {
//   return (
//     <section className="py-24 bg-gray-950 text-white relative overflow-hidden border-t border-gray-800">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
//         {/* Left Side: Context & Explanations */}
//         <div className="lg:col-span-5 space-y-6">
//           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold">
//             <span>Interactive 3D Engine</span>
//           </div>
//           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
//             Explore Complex Concepts in Immersive 3D
//           </h2>
//           <p className="text-gray-400 text-sm leading-relaxed">
//             gleamLearn transforms static diagrams into interactive 3D models. Rotate molecules, inspect anatomical structures, and manipulate physical variables directly in your browser.
//           </p>
//           <div className="flex flex-wrap gap-3 pt-2">
//             <span className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-medium text-brand-blue">Molecular Chemistry</span>
//             <span className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-medium text-brand-green">DNA Strands</span>
//             <span className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-medium text-brand-purple">Solar Mechanics</span>
//           </div>
//         </div>

//         {/* Right Side: The 3D Viewport Canvas */}
//         <div className="lg:col-span-7 h-[420px] bg-gray-900/50 rounded-3xl border border-gray-800 relative overflow-hidden shadow-2xl">
//           <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
//             <ambientLight intensity={1.5} />
//             <directionalLight position={[10, 10, 5]} intensity={2} />
//             <pointLight position={[-10, -10, -5]} color="#2563EB" intensity={5} />
            
//             <EducationalModel />
            
//             {/* Smooth mouse orbit controls restricted for clean UX */}
//             <OrbitControls enableZoom={true} enablePan={false} maxDistance={7} minDistance={2} />
//           </Canvas>
//           <div className="absolute bottom-4 left-4 pointer-events-none px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-gray-300">
//             💡 Click and drag to rotate • Scroll to zoom
//           </div>
//         </div>

//       </div>
//     </section>
//   );
// }


"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { 
  Building2, 
  Zap, 
  HeartPulse, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Lightbulb, 
  Activity,
  Calculator,
  Palette,
  TrendingUp
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

type ModuleKey = "anatomy" | "engineering" | "architecture" | "mathematics" | "art" | "economics";

/**
 * InvestorShowcaseEngine Component
 * Fully adaptive light & dark mode 3D interactive showcase supporting 6 core subjects with 2-second idle auto-rotation.
 */
export default function InvestorShowcaseEngine() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("anatomy");
  const [isPaused, setIsPaused] = useState(false);
  
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modulesList: ModuleKey[] = ["anatomy", "engineering", "architecture", "mathematics", "art", "economics"];

  // Autonomous cycling effect every 2 seconds when user is idle
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveModule((prev) => {
        const currentIndex = modulesList.indexOf(prev);
        const nextIndex = (currentIndex + 1) % modulesList.length;
        return modulesList[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleUserInteraction = () => {
    setIsPaused(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  const handlePrev = () => {
    handleUserInteraction();
    setActiveModule((prev) => {
      const idx = modulesList.indexOf(prev);
      const prevIdx = (idx - 1 + modulesList.length) % modulesList.length;
      return modulesList[prevIdx];
    });
  };

  const handleNext = () => {
    handleUserInteraction();
    setActiveModule((prev) => {
      const idx = modulesList.indexOf(prev);
      const nextIdx = (idx + 1) % modulesList.length;
      return modulesList[nextIdx];
    });
  };

  const moduleData = {
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
  }[activeModule];

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
              {modulesList.map((mod) => (
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
          className="lg:col-span-7 h-[480px] bg-gray-50 dark:bg-dark-card/50 rounded-3xl border border-gray-200 dark:border-dark-border relative overflow-hidden shadow-2xl transition-colors duration-300"
          onPointerDown={handleUserInteraction}
          onWheel={handleUserInteraction}
        >
          {/* Telemetry Status HUD */}
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200 dark:border-white/10 text-[11px] font-mono text-gray-700 dark:text-gray-300 flex items-center gap-2 shadow-xl">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-400 animate-ping'}`} />
            <span>WebGL Engine 60 FPS</span>
          </div>

          <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
            <ambientLight intensity={1.8} />
            <directionalLight position={[10, 15, 10]} intensity={2.5} />
            <pointLight position={[-10, -10, -5]} color="#3B82F6" intensity={4} />

            {activeModule === "anatomy" && <HumanAnatomyHeartModel />}
            {activeModule === "engineering" && <EngineeringTrussModel />}
            {activeModule === "architecture" && <ArchitecturalModel isSelected={false} />}
            {activeModule === "mathematics" && <MathematicsModel />}
            {activeModule === "art" && <ArtModel />}
            {activeModule === "economics" && <EconomicsModel />}

            <OrbitControls enableZoom={true} enablePan={false} maxDistance={8} minDistance={2} />
          </Canvas>

          {/* Interactive Navigation Footer Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 shadow-2xl">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span><strong>Demo Note:</strong> Interacting pauses auto-rotation for 2 seconds.</span>
            </div>
            <span className="font-mono text-brand-purple">gleamLearn Enterprise 3D</span>
          </div>
        </div>

      </div>
    </section>
  );
}