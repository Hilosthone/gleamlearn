import { redirect } from 'next/navigation';

/**
 * Generated lessons and notes are listed in Library → Lessons & study material, each with its own page.
 * The route is kept so old links and bookmarks still land somewhere useful.
 */
export default function GeneratedClassPage() {
  redirect('/library?tab=lessons');
}
