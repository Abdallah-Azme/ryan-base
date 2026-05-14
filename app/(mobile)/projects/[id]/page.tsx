'use client';
export const dynamic = 'force-dynamic';
import React from 'react';
import ProjectDetailsPage from '@/features/projects/components/project-details-page';

export default function Page({ params }: { params?: any }) {
  const { id } = React.use(params as Promise<{ id: string }>);
  return <ProjectDetailsPage id={id} />;
}