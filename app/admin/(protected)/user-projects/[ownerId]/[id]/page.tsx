import AdminUserProjectDetailPage from '@/features/admin-user-projects/components/admin-user-project-detail-page';

interface AdminUserProjectDetailRouteProps {
  params: Promise<{
    ownerId: string;
    id: string;
  }>;
}

export default async function AdminUserProjectDetailRoute({
  params,
}: AdminUserProjectDetailRouteProps) {
  const { ownerId, id } = await params;

  return <AdminUserProjectDetailPage ownerId={ownerId} projectId={id} />;
}
