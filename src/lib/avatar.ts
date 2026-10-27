/**
 * ---------------------------------------------------------------------------
 * lib/avatar.ts — The learner's profile picture (typed wrapper over avatarApi)
 * ---------------------------------------------------------------------------
 * Backend contract (2026-10-27):
 *   GET    /users/me/avatar            → { kind: 'default' } | { kind: 'preset', presetId } | { kind: 'upload', imageUrl, expiresAt }
 *   PUT    /users/me/avatar { presetId }                (presetId from AVATAR_PRESETS; validated by the server)
 *   POST   /users/me/profile-picture   multipart "image": PNG/JPEG/WebP ≤ 2 MB, checked by CONTENT on the server
 *   DELETE /users/me/profile-picture   → back to the default avatar
 * Uploaded pictures are stored privately; imageUrl is a signed link that expires (re-read after that).
 * 501 until the user_avatars table exists (docs/migrations/proposed/2026-10-27_learner_content.sql).
 */

import { avatarApi, resolveApiUrl, type AvatarResponse, type UploadOptions } from './api.ts';

/** Same ids as the backend's AVATAR_PRESETS. Colours are a [from, to] gradient. */
export const AVATAR_PRESETS = [
  { id: 'owl', label: 'Bird', colors: ['#6366f1', '#8b5cf6'] },
  { id: 'rocket', label: 'Rocket', colors: ['#f97316', '#ef4444'] },
  { id: 'atom', label: 'Atom', colors: ['#06b6d4', '#3b82f6'] },
  { id: 'book', label: 'Book', colors: ['#2563eb', '#1d4ed8'] },
  { id: 'globe', label: 'Globe', colors: ['#10b981', '#0ea5e9'] },
  { id: 'palette', label: 'Palette', colors: ['#ec4899', '#f59e0b'] },
  { id: 'music', label: 'Music', colors: ['#a855f7', '#ec4899'] },
  { id: 'leaf', label: 'Leaf', colors: ['#22c55e', '#15803d'] },
  { id: 'lion', label: 'Cat', colors: ['#f59e0b', '#d97706'] },
  { id: 'star', label: 'Star', colors: ['#eab308', '#f97316'] },
  { id: 'robot', label: 'Robot', colors: ['#64748b', '#334155'] },
  { id: 'compass', label: 'Compass', colors: ['#14b8a6', '#0f766e'] },
] as const;
export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]['id'];
export const presetOf = (id: string) => AVATAR_PRESETS.find((p) => p.id === id) ?? null;

export type Avatar = { kind: 'default' } | { kind: 'preset'; presetId: AvatarPresetId } | { kind: 'upload'; imageUrl: string; expiresAt: string };

export function toAvatar(res: unknown): Avatar {
  const r = (res ?? {}) as Partial<AvatarResponse> & Record<string, unknown>;
  if (r.kind === 'preset' && typeof r.presetId === 'string' && presetOf(r.presetId)) return { kind: 'preset', presetId: r.presetId as AvatarPresetId };
  if (r.kind === 'upload' && typeof r.imageUrl === 'string' && r.imageUrl) {
    return { kind: 'upload', imageUrl: resolveApiUrl(r.imageUrl), expiresAt: typeof r.expiresAt === 'string' ? r.expiresAt : '' };
  }
  return { kind: 'default' };
}

export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp';
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Quick checks before uploading (the server checks the real contents). Returns the problem, or null. */
export function checkAvatarFile(file: { name: string; type: string; size: number }): string | null {
  const okType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);
  if (!okType) return 'Choose a PNG, JPEG or WebP image.';
  if (file.size === 0) return 'That file is empty.';
  if (file.size > AVATAR_MAX_BYTES) return 'The image must be 2 MB or smaller.';
  return null;
}

/** Window event fired after the picture changed; every displayed avatar reloads. */
export const AVATAR_CHANGED_EVENT = 'gleamlearn:avatar-changed';

let cache: { at: number; promise: Promise<Avatar> } | null = null;

/** One request shared by the Navbar, Settings and anything else showing the avatar (signed links last an hour). */
export function sharedAvatar(now = Date.now()): Promise<Avatar> {
  if (cache && now - cache.at < 10 * 60_000) return cache.promise;
  const promise = avatarApi.get().then(toAvatar);
  cache = { at: now, promise };
  promise.catch(() => {
    if (cache?.promise === promise) cache = null; // failures are not cached
  });
  return promise;
}

function changed(next: Avatar): Avatar {
  cache = { at: Date.now(), promise: Promise.resolve(next) };
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AVATAR_CHANGED_EVENT));
  return next;
}

export const choosePreset = async (presetId: AvatarPresetId) => changed(toAvatar(await avatarApi.choosePreset(presetId)));
export const uploadAvatar = async (file: File, options?: UploadOptions) => changed(toAvatar(await avatarApi.upload(file, options)));
export const resetAvatar = async () => changed(toAvatar(await avatarApi.reset()));
