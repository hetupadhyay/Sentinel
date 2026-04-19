"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const hydrate = useAuthStore(state => state.hydrate);
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      <div className="sticky top-0 z-[100]">
        <TopBar />
      </div>
      <main className="flex-1 w-full max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}

