'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { AvatarImage } from '@/components/profile/Avatar';
import {
  AVATAR_ACCEPT,
  AVATAR_PRESETS,
  checkAvatarFile,
  choosePreset,
  resetAvatar,
  sharedAvatar,
  uploadAvatar,
  type Avatar,
  type AvatarPresetId,
} from '@/lib/avatar';

/** Settings → Profile picture: pick an illustrated avatar, upload your own picture, or go back to the default. */
export function AvatarPicker() {
  const current = useApiQuery(() => sharedAvatar(), []);
  const [selected, setSelected] = useState<AvatarPresetId | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileProblem, setFileProblem] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // the preview of a chosen file is a local object URL, released when it changes
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const t = setTimeout(() => setPreview(url), 0);
    return () => {
      clearTimeout(t);
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [file]);

  const afterSave = (message: string) => {
    setSaved(message);
    current.retry();
  };
  const savePreset = useAsyncAction(async (_signal: AbortSignal, id: AvatarPresetId) => {
    const res = await choosePreset(id);
    setSelected(null);
    afterSave('Your avatar was saved.');
    return res;
  });
  const upload = useAsyncAction(async (_signal: AbortSignal, f: File) => {
    controller.current = new AbortController();
    setProgress(0);
    const res = await uploadAvatar(f, { onProgress: setProgress, signal: controller.current.signal });
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
    afterSave('Your picture was uploaded.');
    return res;
  });
  const reset = useAsyncAction(async () => {
    const res = await resetAvatar();
    afterSave('You are using the default avatar.');
    return res;
  });
  const busy = savePreset.isPending || upload.isPending || reset.isPending;

  if (current.isLoading) return <LoadingState layout="detail" label="Loading your picture…" />;
  if (current.error?.kind === 'not_implemented') {
    return <FeatureUnavailable title="Profile pictures aren't available yet" description="Avatars and uploaded pictures can't be saved on this server yet." />;
  }
  if (current.error && !current.data) return <ErrorState error={current.error} onRetry={current.retry} />;

  const now: Avatar = current.data ?? { kind: 'default' };
  const previewAvatar: Avatar = selected ? { kind: 'preset', presetId: selected } : now;
  const actionError = savePreset.error ?? (upload.error?.kind === 'aborted' ? null : upload.error) ?? reset.error;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
          <img src={preview} alt="Preview of the picture you chose" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <AvatarImage avatar={previewAvatar} size={96} label={selected ? 'Preview of the selected avatar' : 'Your current picture'} />
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{selected ? 'Preview' : 'Your current picture'}</h3>
          <p className="text-xs text-gray-500">
            {now.kind === 'default' ? 'You are using the default avatar.' : now.kind === 'preset' ? 'An illustrated avatar.' : 'Your uploaded picture.'}
          </p>
          {now.kind !== 'default' && (
            <Button type="button" variant="outline" size="sm" disabled={busy} isLoading={reset.isPending} onClick={() => void reset.run()}>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Use the default avatar
            </Button>
          )}
        </div>
      </div>

      {saved && !busy && <Alert variant="success">{saved}</Alert>}
      {actionError && <ErrorState error={actionError} compact />}

      <fieldset className="space-y-3">
        <legend className="text-sm font-bold text-gray-900 dark:text-white">Choose an avatar</legend>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {AVATAR_PRESETS.map((p) => {
            const checked = (selected ?? (now.kind === 'preset' ? now.presetId : null)) === p.id;
            return (
              <label key={p.id} className="cursor-pointer flex flex-col items-center gap-1">
                <input
                  type="radio"
                  name="avatar-preset"
                  value={p.id}
                  checked={checked}
                  onChange={() => {
                    setSaved(null);
                    setSelected(p.id);
                  }}
                  className="sr-only peer"
                />
                <span className="rounded-full p-1 ring-2 ring-transparent peer-checked:ring-[var(--color-brand-blue)] peer-focus-visible:ring-[var(--color-brand-blue)] peer-focus-visible:ring-offset-2">
                  <AvatarImage avatar={{ kind: 'preset', presetId: p.id }} size={52} />
                </span>
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{p.label}</span>
              </label>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={!selected || busy} isLoading={savePreset.isPending} onClick={() => selected && void savePreset.run(selected)}>
            Save avatar
          </Button>
          {selected && (
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setSelected(null)}>
              Cancel
            </Button>
          )}
        </div>
      </fieldset>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Or upload your own picture</h3>
        <p className="text-xs text-gray-500">PNG, JPEG or WebP, up to 2 MB. Only you can see your uploaded picture.</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 focus-within:ring-2 focus-within:ring-[var(--color-brand-blue)]">
          <ImagePlus className="w-4 h-4" aria-hidden="true" /> Choose a picture
          <input
            ref={inputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setSaved(null);
              upload.reset();
              const problem = f ? checkAvatarFile(f) : null;
              setFileProblem(problem);
              setFile(problem ? null : f);
            }}
          />
        </label>
        {fileProblem && <Alert variant="error">{fileProblem}</Alert>}
        {file && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-300">{file.name}</p>
            {upload.isPending && (
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
                <div className="h-full bg-[var(--color-brand-blue)] transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" size="sm" isLoading={upload.isPending} disabled={busy} onClick={() => void upload.run(file)}>
                {upload.error && upload.error.kind !== 'aborted' ? 'Try again' : 'Upload picture'}
              </Button>
              {upload.isPending ? (
                <Button type="button" size="sm" variant="outline" onClick={() => controller.current?.abort()}>
                  <X className="w-3.5 h-3.5" aria-hidden="true" /> Cancel upload
                </Button>
              ) : (
                <Button type="button" size="sm" variant="outline" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }}>
                  Remove
                </Button>
              )}
            </div>
            {upload.error?.kind === 'aborted' && <p className="text-xs text-gray-500">Upload cancelled. Nothing was saved.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
