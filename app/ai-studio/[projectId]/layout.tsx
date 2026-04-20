'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ProjectSidebar } from '@/components/project-sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [project, setProject] = useState<{
    _id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [allProjects, setAllProjects] = useState<Array<{
    _id: string;
    name: string;
    description?: string;
  }>>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchAllProjects();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const response = await fetch('/api/factory/projects');
      if (response.ok) {
        const data = await response.json();
        setAllProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching all projects:', error);
    }
  };

  const handleProjectSelect = (newProjectId: string) => {
    // Сохраняем текущий путь (overview/upload/generate/publish)
    const currentPath = window.location.pathname;
    const currentTab = currentPath.split('/').pop() || '';
    
    if (currentTab && ['upload', 'generate', 'publish'].includes(currentTab)) {
      router.push(`/ai-studio/${newProjectId}/${currentTab}`);
    } else {
      router.push(`/ai-studio/${newProjectId}`);
    }
  };

  const handleProjectNameUpdate = async (newName: string) => {
    try {
      await fetch(`/api/factory/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      
      // Обновляем локальное состояние
      setProject(prev => prev ? { ...prev, name: newName } : null);
    } catch (error) {
      console.error('Error updating project name:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm">секундочку...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <ProjectSidebar 
        project={project}
        allProjects={allProjects}
        onProjectSelect={handleProjectSelect}
        onProjectNameUpdate={handleProjectNameUpdate}
      />
      <SidebarInset className="overflow-auto">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
