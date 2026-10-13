// src/components/admin/NotConnected.tsx
import React from 'react';
import { PlugZap } from 'lucide-react';

interface NotConnectedProps {
  title: string;
  description: string;
  /** Related backend endpoints (shown for transparency). */
  backendEndpoints?: string[];
  /** Verified reason why the section is not connected (replaces the generic text). */
  reason?: string;
}

/** Clearly labelled placeholder for admin sections without a usable, verified backend integration. */
export function NotConnected({ title, description, backendEndpoints = [], reason }: NotConnectedProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <div
        role="status"
        className="bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-8 flex flex-col items-center text-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <PlugZap className="w-6 h-6 text-gray-500" aria-hidden="true" />
        </div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Not yet connected</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
          {reason ??
            'This section is not connected to the backend yet, so it shows no data and performs no actions. Nothing here is simulated.'}
        </p>
        {backendEndpoints.length > 0 && (
          <div className="text-left w-full max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mt-2 mb-1">Related backend endpoints</p>
            <ul className="text-[11px] font-mono text-gray-500 dark:text-gray-400 space-y-0.5">
              {backendEndpoints.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
