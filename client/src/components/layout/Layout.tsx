import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useQueryClient } from '@tanstack/react-query';

export function Layout() {
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar onRefresh={handleRefresh} />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
} 