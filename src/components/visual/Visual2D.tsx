'use client';

import React from 'react';
import { ELEMENT_COLORS, layoutMolecule, samplePath, type Visual } from '@/lib/visual-lesson';

/**
 * 2D renderers (SVG, no WebGL): the native view for graph2d / flow / labeled, and the fallback for every 3D visual
 * (no WebGL, the learner chose 2D, or the 3D scene failed). Every label is rendered as text — never as markup.
 */
const W = 480;
const H = 300;
const svgProps = { viewBox: `0 0 ${W} ${H}`, className: 'w-full h-auto text-gray-700 dark:text-gray-200', role: 'img' as const };

function Graph({ v }: { v: Extract<Visual, { type: 'graph2d' }> }) {
  const pts = samplePath(v);
  const ys = pts.map((p) => p.y).filter((y): y is number => y !== null);
  const pointYs = v.points.map((p) => p.y);
  let yMin = Math.min(...ys, ...pointYs, 0);
  let yMax = Math.max(...ys, ...pointYs, 0);
  if (yMax - yMin < 1e-6) [yMin, yMax] = [yMin - 1, yMax + 1];
  const pad = 28;
  const sx = (x: number) => pad + ((x - v.xMin) / (v.xMax - v.xMin)) * (W - 2 * pad);
  const sy = (y: number) => H - pad - ((y - yMin) / (yMax - yMin)) * (H - 2 * pad);
  let d = '';
  let pen = false;
  for (const p of pts) {
    if (p.y === null) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`;
    pen = true;
  }
  return (
    <svg {...svgProps} aria-label={`Graph of a ${v.family} function from x = ${v.xMin} to ${v.xMax}`}>
      {v.xMin < 0 && v.xMax > 0 && <line x1={sx(0)} x2={sx(0)} y1={pad} y2={H - pad} stroke="currentColor" strokeOpacity={0.3} />}
      {yMin < 0 && yMax > 0 && <line x1={pad} x2={W - pad} y1={sy(0)} y2={sy(0)} stroke="currentColor" strokeOpacity={0.3} />}
      <path d={d} fill="none" stroke="#7c3aed" strokeWidth={2.5} />
      {v.points.map((p, i) => (
        <g key={i}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r={4} fill="#f97316" />
          {p.label && <text x={sx(p.x) + 6} y={sy(p.y) - 6} fontSize={11} fill="currentColor">{p.label}</text>}
        </g>
      ))}
      <text x={W - pad} y={H - 8} fontSize={11} textAnchor="end" fill="currentColor">{v.xLabel || 'x'}</text>
      <text x={8} y={pad - 10} fontSize={11} fill="currentColor">{v.yLabel || 'y'}</text>
      <text x={pad} y={H - 8} fontSize={10} fill="currentColor" opacity={0.6}>{v.xMin}</text>
    </svg>
  );
}

function Flow({ v }: { v: Extract<Visual, { type: 'flow' }> }) {
  const n = v.nodes.length;
  const pos = new Map(
    v.nodes.map((node, i) => {
      if (v.cycle || n > 5) {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
        return [node.id, [W / 2 + Math.cos(a) * 170, H / 2 + Math.sin(a) * 105]] as const;
      }
      return [node.id, [60 + (i * (W - 120)) / Math.max(1, n - 1), H / 2]] as const;
    }),
  );
  return (
    <svg {...svgProps} aria-label={`Diagram with ${n} stages`}>
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#7c3aed" />
        </marker>
      </defs>
      {v.edges.map((e, i) => {
        const [x1, y1] = pos.get(e.from)!;
        const [x2, y2] = pos.get(e.to)!;
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const k = 44 / len;
        return (
          <g key={i}>
            <line x1={x1 + (x2 - x1) * k} y1={y1 + (y2 - y1) * k} x2={x2 - (x2 - x1) * k} y2={y2 - (y2 - y1) * k} stroke="#7c3aed" strokeWidth={2} markerEnd="url(#flow-arrow)" />
            {e.label && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fontSize={10} textAnchor="middle" fill="currentColor">{e.label}</text>}
          </g>
        );
      })}
      {v.nodes.map((node) => {
        const [x, y] = pos.get(node.id)!;
        return (
          <g key={node.id}>
            <rect x={x - 44} y={y - 18} width={88} height={36} rx={10} fill="#ede9fe" stroke="#7c3aed" />
            <text x={x} y={y + 4} fontSize={11} textAnchor="middle" fill="#3b0764">{node.label.length > 16 ? `${node.label.slice(0, 15)}…` : node.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Labeled({ v }: { v: Extract<Visual, { type: 'labeled' }> }) {
  return (
    <div className="space-y-3">
      {v.subject && <p className="text-center text-sm font-extrabold text-gray-900 dark:text-white">{v.subject}</p>}
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {v.parts.map((p, i) => (
          <li key={i} className="flex gap-2 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0" aria-hidden="true">{i + 1}</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-gray-900 dark:text-white break-words">{p.label}</span>
              {p.description && <span className="block text-xs text-gray-600 dark:text-gray-300 break-words">{p.description}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Orthographic front view of the molecule layout. */
function Molecule({ v }: { v: Extract<Visual, { type: 'molecule' }> }) {
  const pos = layoutMolecule(v);
  const xs = Object.values(pos).map((p) => p[0]);
  const ys = Object.values(pos).map((p) => p[1]);
  const span = Math.max(1, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const s = (Math.min(W, H) - 80) / span;
  const px = (id: string) => [W / 2 + pos[id][0] * s, H / 2 - pos[id][1] * s];
  return (
    <svg {...svgProps} aria-label={`Molecule${v.name ? ` ${v.name}` : ''}: ${v.atoms.map((a) => a.element).join(', ')}`}>
      {v.bonds.map((b, i) => {
        const [x1, y1] = px(b.a);
        const [x2, y2] = px(b.b);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={0.5} strokeWidth={b.order * 2.5} />;
      })}
      {v.atoms.map((a) => {
        const [x, y] = px(a.id);
        return (
          <g key={a.id}>
            <circle cx={x} cy={y} r={a.element === 'H' ? 12 : 17} fill={ELEMENT_COLORS[a.element]} stroke="#111827" strokeOpacity={0.3} />
            <text x={x} y={y + 4} fontSize={11} fontWeight={700} textAnchor="middle" fill={['H', 'He', 'Al', 'Zn'].includes(a.element) ? '#111827' : '#fff'}>{a.element}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Vectors({ v }: { v: Extract<Visual, { type: 'vectors' }> }) {
  const all = v.showResultant ? [...v.vectors, { x: v.vectors.reduce((s, a) => s + a.x, 0), y: v.vectors.reduce((s, a) => s + a.y, 0), z: 0, label: 'Resultant' }] : v.vectors;
  const m = Math.max(1, ...all.flatMap((a) => [Math.abs(a.x), Math.abs(a.y)]));
  const s = (Math.min(W, H) / 2 - 30) / m;
  return (
    <svg {...svgProps} aria-label={`${v.vectors.length} vectors${v.showResultant ? ' and their resultant' : ''} (front view)`}>
      <defs>
        <marker id="vec-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
        </marker>
      </defs>
      <line x1={20} x2={W - 20} y1={H / 2} y2={H / 2} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={W / 2} x2={W / 2} y1={10} y2={H - 10} stroke="currentColor" strokeOpacity={0.2} />
      {all.map((a, i) => {
        const last = v.showResultant && i === all.length - 1;
        return (
          <g key={i}>
            <line x1={W / 2} y1={H / 2} x2={W / 2 + a.x * s} y2={H / 2 - a.y * s} stroke={last ? '#f97316' : '#7c3aed'} strokeWidth={last ? 3.5 : 2.5} strokeDasharray={last ? '6 4' : undefined} markerEnd="url(#vec-arrow)" />
            {a.label && <text x={W / 2 + a.x * s + 6} y={H / 2 - a.y * s - 6} fontSize={11} fill="currentColor">{a.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function Orbit({ v }: { v: Extract<Visual, { type: 'orbit' }> }) {
  const max = Math.max(...v.bodies.map((b) => b.radius));
  const s = (Math.min(W, H) / 2 - 24) / max;
  return (
    <svg {...svgProps} aria-label={`${v.bodies.length} bodies orbiting ${v.center}`}>
      <circle cx={W / 2} cy={H / 2} r={18} fill="#f59e0b" />
      <text x={W / 2} y={H / 2 + 34} fontSize={11} textAnchor="middle" fill="currentColor">{v.center}</text>
      {v.bodies.map((b, i) => {
        const a = (i * 2.4) % (2 * Math.PI);
        return (
          <g key={i}>
            <circle cx={W / 2} cy={H / 2} r={b.radius * s} fill="none" stroke="currentColor" strokeOpacity={0.25} />
            <circle cx={W / 2 + Math.cos(a) * b.radius * s} cy={H / 2 + Math.sin(a) * b.radius * s} r={7} fill="#7c3aed" />
            <text x={W / 2 + Math.cos(a) * b.radius * s + 10} y={H / 2 + Math.sin(a) * b.radius * s + 4} fontSize={10} fill="currentColor">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Wave({ v }: { v: Extract<Visual, { type: 'wave' }> }) {
  const amp = (v.amplitude / 5) * (H / 2 - 30);
  const d = Array.from({ length: 241 }, (_, i) => {
    const x = 20 + ((W - 40) * i) / 240;
    const y = H / 2 - amp * Math.sin((2 * Math.PI * v.waves * i) / 240);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join('');
  return (
    <svg {...svgProps} aria-label={`Wave with ${v.waves} cycle(s), amplitude ${v.amplitude}`}>
      <line x1={20} x2={W - 20} y1={H / 2} y2={H / 2} stroke="currentColor" strokeOpacity={0.2} />
      <path d={d} fill="none" stroke="#7c3aed" strokeWidth={2.5} />
      {v.label && <text x={W / 2} y={24} fontSize={12} textAnchor="middle" fill="currentColor">{v.label}</text>}
    </svg>
  );
}

function Shape({ v }: { v: Extract<Visual, { type: 'shape3d' }> }) {
  return (
    <div className="text-center space-y-2 py-6">
      <p className="text-sm font-extrabold text-gray-900 dark:text-white capitalize">{v.shape}</p>
      {Object.keys(v.dimensions).length > 0 && (
        <p className="text-xs text-gray-600 dark:text-gray-300">{Object.entries(v.dimensions).map(([k, n]) => `${k} = ${n}`).join(' · ')}</p>
      )}
      {v.labels.length > 0 && <p className="text-xs text-gray-500">Labels: {v.labels.join(', ')}</p>}
      <p className="text-[11px] text-gray-400">Open the 3D view to rotate this shape.</p>
    </div>
  );
}

export function Visual2D({ visual }: { visual: Visual }) {
  switch (visual.type) {
    case 'graph2d':
      return <Graph v={visual} />;
    case 'flow':
      return <Flow v={visual} />;
    case 'labeled':
      return <Labeled v={visual} />;
    case 'molecule':
      return <Molecule v={visual} />;
    case 'vectors':
      return <Vectors v={visual} />;
    case 'orbit':
      return <Orbit v={visual} />;
    case 'wave':
      return <Wave v={visual} />;
    case 'shape3d':
      return <Shape v={visual} />;
  }
}
