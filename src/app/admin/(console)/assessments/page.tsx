// src/app/admin/(console)/assessments/page.tsx
import { NotConnected } from '@/components/admin/NotConnected';
import { RequirePermission } from '@/components/admin/RequirePermission';

export default function AdminAssessmentsPage() {
  return (
    <RequirePermission permission="content.manage">
      <NotConnected
        title="Assessments"
        description="Question bank review for quizzes, tests and exams."
        backendEndpoints={[
          'GET /admin/questions',
          'GET /admin/questions/:id',
          'POST /admin/questions',
          'PATCH /admin/questions/:id',
          'DELETE /admin/questions/:id',
          'PATCH /admin/questions/:id/approve',
          'PATCH /admin/questions/:id/reject',
        ]}
      />
    </RequirePermission>
  );
}
