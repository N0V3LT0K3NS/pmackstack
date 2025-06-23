import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useQueryClient } from '@tanstack/react-query';

export function Layout() {
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onRefresh={handleRefresh} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 