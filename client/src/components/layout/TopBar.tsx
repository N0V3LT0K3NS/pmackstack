import React from 'react';
import { RefreshCw, Calendar, User, LogOut, ChevronDown, BarChart3, Database, FileText, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  onRefresh?: () => void;
}

export function TopBar({ onRefresh }: TopBarProps) {
  const today = new Date();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'executive':
        return 'bg-purple-100 text-purple-800';
      case 'bookkeeper':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, description: 'Performance metrics and analytics' },
    { path: '/data-entry', label: 'Data Entry', icon: Database, description: 'Weekly data input and CSV import' },
  ];

  const getCurrentPageName = () => {
    const currentItem = navigationItems.find(item => location.pathname.startsWith(item.path));
    return currentItem?.label || 'Dashboard';
  };
  
  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        {/* Navigation Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Menu className="h-5 w-5" />
              <span>{getCurrentPageName()}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>Kilwins Executive Dashboard</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <DropdownMenuItem
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`cursor-pointer ${isActive ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Icon className={`h-4 w-4 mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(today)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="max-w-[150px] truncate">{user.full_name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <span className="flex items-center gap-2">
                  Role: 
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
} 