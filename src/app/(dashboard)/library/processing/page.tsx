import { redirect } from 'next/navigation';

/**
 * Processing status is shown on each uploaded material (Library → Uploaded materials).
 * The route is kept so old links and bookmarks still land somewhere useful.
 */
export default function DocumentProcessingPage() {
  redirect('/library?tab=uploads');
}
