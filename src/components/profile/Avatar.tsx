'use client';

import React, { useEffect, useState } from 'react';
import { Atom, Bird, BookOpen, Bot, Cat, Compass, Globe, GraduationCap, Leaf, Music, Palette, Rocket, Star, type LucideIcon } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { AVATAR_CHANGED_EVENT, presetOf, sharedAvatar, type Avatar, type AvatarPresetId } from '@/lib/avatar';

const ICONS: Record<AvatarPresetId, LucideIcon> = {
  owl: Bird,
  rocket: Rocket,
  atom: Atom,
  book: BookOpen,
  globe: Globe,
  palette: Palette,
  music: Music,
  leaf: Leaf,
  lion: Cat,
  star: Star,
  robot: Bot,
  compass: Compass,
};

interface AvatarImageProps {
  avatar: Avatar | null | undefined;
  /** px */
  size?: number;
  /** Accessible name, e.g. "Your profile picture". Omit when the avatar is decorative next to the name. */
  label?: string;
  className?: string;
}

/** Renders a preset illustration, an uploaded picture, or the default avatar (also while loading or on error). */
export function AvatarImage({ avatar, size = 40, label, className = '' }: AvatarImageProps) {
  const [broken, setBroken] = useState<string | null>(null);
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  const style = { width: size, height: size };
  const base = `rounded-full shrink-0 overflow-hidden flex items-center justify-center ${className}`;

  if (avatar?.kind === 'upload' && broken !== avatar.imageUrl) {
    return (
      <span className={base} style={style} data-avatar="upload" {...a11y}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a signed, expiring private link; not optimisable by next/image */}
        <img src={avatar.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setBroken(avatar.imageUrl)} />
      </span>
    );
  }
  const preset = avatar?.kind === 'preset' ? presetOf(avatar.presetId) : null;
  const Icon = preset ? ICONS[preset.id] : GraduationCap;
  const [from, to] = preset ? preset.colors : ['#2563eb', '#7c3aed'];
  return (
    <span className={base} style={{ ...style, background: `linear-gradient(135deg, ${from}, ${to})` }} data-avatar={preset ? `preset:${preset.id}` : 'default'} {...a11y}>
      <Icon className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} aria-hidden="true" />
    </span>
  );
}

/** The signed-in learner's avatar, kept up to date after changes (AVATAR_CHANGED_EVENT). */
export function MyAvatar(props: Omit<AvatarImageProps, 'avatar'>) {
  const avatar = useApiQuery(() => sharedAvatar(), []);
  const { retry } = avatar;
  useEffect(() => {
    window.addEventListener(AVATAR_CHANGED_EVENT, retry);
    return () => window.removeEventListener(AVATAR_CHANGED_EVENT, retry);
  }, [retry]);
  // Default avatar while loading, on error or when the feature is unavailable (501): never a broken image
  return <AvatarImage avatar={avatar.data ?? null} {...props} />;
}
