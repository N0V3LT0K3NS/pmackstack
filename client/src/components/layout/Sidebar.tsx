import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Store,
  TrendingUp,
  FileBarChart,
  Settings,
  Users,
  BarChart3,
  Calendar,
  FileText,
  LogOut,
  Building2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { user, logout } = useAuth();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard,
      show: true 
    },
    { 
      name: 'Data Entry', 
      href: '/data-entry', 
      icon: FileText,
      show: user?.role !== 'manager' || user?.stores?.some(s => s.includes('anna') || s.includes('char') || s.includes('fell') || s.includes('vabe') || s.includes('will'))
    },
    { 
      name: 'Renoja Dashboard', 
      href: '/renoja', 
      icon: Building2,
      show: user?.role !== 'manager' || user?.stores?.some(s => s.includes('ren'))
    },
    { 
      name: 'Renoja Data Entry', 
      href: '/renoja/data-entry', 
      icon: Store,
      show: user?.role !== 'manager' || user?.stores?.some(s => s.includes('ren'))
    },
  ];

  // Check if user has write permissions
  const hasWritePermission = () => {
    if (user?.role === 'executive' || user?.role === 'bookkeeper') return true;
    
    // For managers, check if they have write permission to any store
    if (user?.role === 'manager') {
      // The renoja user has write permissions, others are read-only
      return user.email === 'renoja';
    }
    
    return false;
  };

  const isReadOnly = !hasWritePermission();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">PMackStack</h2>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.filter(item => item.show).map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
            {isReadOnly && item.name.includes('Data Entry') && (
              <span className="ml-auto text-xs text-gray-400">(Read Only)</span>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 space-y-1">
          <p className="text-sm font-medium text-white">{user?.full_name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-400 capitalize">
            {user?.role}
            {isReadOnly && ' • Read Only'}
          </p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
} 