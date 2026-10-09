import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Route-level loading UI for dashboard pages.
 * Shown by Next.js only while a route segment is still loading; it renders
 * inside the dashboard layout, so the sidebar and navbar stay interactive.
 * Mirrors the common page shape: header banner, stat cards, two-column body.
 */
export default function DashboardLoading() {
  const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

  return (
    <div role="status" aria-live="polite" className="space-y-8 animate-in fade-in duration-300">
      <span className="sr-only">Loading…</span>

      {/* Header banner */}
      <Skeleton className="h-64 md:h-45 rounded-3xl" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${card} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="w-8 h-8" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-2.5 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main + side column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${card} lg:col-span-2 p-6 space-y-5`}>
          <Skeleton className="h-5 w-48 rounded-lg" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/5 rounded-md" />
                <Skeleton className="h-2.5 w-2/5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className={`${card} p-6 space-y-4`}>
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
