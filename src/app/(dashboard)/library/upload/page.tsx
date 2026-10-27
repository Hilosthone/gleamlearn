import { redirect } from 'next/navigation';

/**
 * Uploading material now happens on the Learn page (Upload a file → choose what to make from it).
 * The route is kept so old links and bookmarks still land somewhere useful.
 */
export default function UploadMaterialPage() {
  redirect('/learn');
}
