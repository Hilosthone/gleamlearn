// src/app/admin/(console)/moderation/page.tsx
import { NotConnected } from '@/components/admin/NotConnected';
import { RequirePermission } from '@/components/admin/RequirePermission';

export default function AdminModerationPage() {
  return (
    <RequirePermission permission="moderation.manage">
      <NotConnected
        title="Reports & moderation"
        description="User reports and AI-generated content review."
        backendEndpoints={[
          'GET /admin/reports',
          'GET /admin/reports/:id',
          'PATCH /admin/reports/:id/resolve',
          'PATCH /admin/reports/:id/reject',
          'GET /admin/ai/generated-content',
          'PATCH /admin/ai/generated-content/:id/approve',
          'PATCH /admin/ai/generated-content/:id/reject',
          'DELETE /admin/ai/generated-content/:id',
        ]}
      />
    </RequirePermission>
  );
}
