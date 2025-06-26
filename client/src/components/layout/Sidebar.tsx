import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  TrendingUp,
  FileBarChart,
  Settings,
  Users,
  BarChart3,
  Calendar,
  FileInput,
  Activity,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Brand-specific navigation configurations
const brandNavigation = {
  kilwins: [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Data Entry', href: '/kilwins/data-entry', icon: FileInput },
    { name: 'Stores', href: '/stores', icon: Store },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
    { name: 'Labor', href: '/labor', icon: Users },
    { name: 'Forecasts', href: '/forecasts', icon: BarChart3 },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
  ],
  renoja: [
    { name: 'Dashboard', href: '/renoja', icon: LayoutDashboard },
    { name: 'Data Entry', href: '/renoja/data-entry', icon: FileInput },
    { name: 'Members', href: '/renoja/members', icon: UserPlus },
    { name: 'Engagement', href: '/renoja/engagement', icon: Activity },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
  ],
  shared: [
    { name: 'Settings', href: '/settings', icon: Settings },
  ]
};

const brands = [
  { id: 'kilwins', name: 'Kilwins', color: 'bg-purple-600' },
  { id: 'renoja', name: 'Renoja', color: 'bg-green-600' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentBrand, setCurrentBrand] = useState<'kilwins' | 'renoja'>('kilwins');

  // Determine current brand from the URL
  useEffect(() => {
    if (location.pathname.startsWith('/renoja')) {
      setCurrentBrand('renoja');
    } else {
      setCurrentBrand('kilwins');
    }
  }, [location.pathname]);

  const handleBrandSwitch = (brandId: 'kilwins' | 'renoja') => {
    setCurrentBrand(brandId);
    if (brandId === 'renoja') {
      navigate('/renoja');
    } else {
      navigate('/');
    }
  };

  const navigation = [...brandNavigation[currentBrand], ...brandNavigation.shared];
  const currentBrandInfo = brands.find(b => b.id === currentBrand);

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">
            <div className={cn('h-2 w-2 rounded-full', currentBrandInfo?.color)} />
            <h1 className="text-xl font-bold">{currentBrandInfo?.name}</h1>
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {brands.map((brand) => (
              <DropdownMenuItem
                key={brand.id}
                onClick={() => handleBrandSwitch(brand.id as 'kilwins' | 'renoja')}
                className="flex items-center space-x-2"
              >
                <div className={cn('h-2 w-2 rounded-full', brand.color)} />
                <span>{brand.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )
            }
          >
            <item.icon
              className="mr-3 h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 