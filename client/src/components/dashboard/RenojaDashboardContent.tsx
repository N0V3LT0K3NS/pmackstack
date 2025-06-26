import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, TrendingUp, TrendingDown, Users, Calendar, MessageSquare, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SimpleStoreFilter } from '@/components/filters/SimpleStoreFilter';
import { SimpleDateFilter } from '@/components/filters/SimpleDateFilter';
import { useStores } from '@/hooks/useStores';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface RenojaMetrics {
  summary: {
    newMembersTotal: number;
    totalPayingMembers: number;
    membersLostTotal: number;
    avgMemberRate: number;
    retentionRate: number;
    totalEvents: number;
    totalDigitalPosts: number;
    totalGoogleReviews: number;
    totalPartnerships: number;
  };
  timeSeries: Array<{
    week_ending: string;
    new_members_signed: number;
    total_paying_members: number;
    members_lost: number;
    avg_member_rate: number;
    retention_rate: number;
    digital_posts: number;
    new_google_reviews: number;
    partnerships: number;
    events: number;
  }>;
}

interface RenojaKPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtext?: string;
  change?: string;
  trend?: 'up' | 'down';
}

function RenojaKPICard({ title, value, icon: Icon, color, subtext, change, trend }: RenojaKPICardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-green-50/30 border-green-100 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtext && (
            <p className="mt-1 text-sm text-gray-500">{subtext}</p>
          )}
          {change && trend && (
            <div className="mt-2 flex items-center">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}%
              </span>
            </div>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </Card>
  );
}

export function RenojaDashboardContent() {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: 30, to: 0 });

  const { data: stores } = useStores('RENOJA');

  const { data: metrics, isLoading, error } = useQuery<RenojaMetrics>({
    queryKey: ['renoja-dashboard', selectedStore, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        store: selectedStore,
        daysFrom: dateRange.from.toString(),
        daysTo: dateRange.to.toString(),
      });
      const response = await api.get(`/api/renoja/dashboard?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading Renoja dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Failed to load Renoja dashboard data
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Members',
      value: metrics?.summary.totalPayingMembers || 0,
      icon: Users,
      change: metrics?.summary.newMembersTotal ? 
        ((metrics.summary.newMembersTotal - metrics.summary.membersLostTotal) / metrics.summary.totalPayingMembers * 100).toFixed(1) : '0',
      trend: (metrics?.summary.newMembersTotal || 0) > (metrics?.summary.membersLostTotal || 0) ? 'up' : 'down' as const,
      color: 'text-green-600',
    },
    {
      title: 'New Members',
      value: metrics?.summary.newMembersTotal || 0,
      icon: TrendingUp,
      subtext: `Lost: ${metrics?.summary.membersLostTotal || 0}`,
      color: 'text-blue-600',
    },
    {
      title: 'Retention Rate',
      value: `${(metrics?.summary.retentionRate || 0).toFixed(1)}%`,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Avg Member Rate',
      value: `$${(metrics?.summary.avgMemberRate || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      title: 'Total Events',
      value: metrics?.summary.totalEvents || 0,
      icon: Calendar,
      color: 'text-orange-600',
    },
    {
      title: 'Digital Posts',
      value: metrics?.summary.totalDigitalPosts || 0,
      icon: MessageSquare,
      color: 'text-pink-600',
    },
    {
      title: 'Google Reviews',
      value: metrics?.summary.totalGoogleReviews || 0,
      icon: MessageSquare,
      color: 'text-yellow-600',
    },
    {
      title: 'Partnerships',
      value: metrics?.summary.totalPartnerships || 0,
      icon: Briefcase,
      color: 'text-teal-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-emerald-600/5 to-green-600/5 rounded-2xl" />
        
        <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="space-y-2">
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  Member engagement and growth metrics across all Renoja studios
                </p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <SimpleStoreFilter
                stores={stores?.stores || []}
                value={selectedStore}
                onChange={setSelectedStore}
              />
              <SimpleDateFilter value={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Member & Engagement Metrics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <RenojaKPICard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              subtext={kpi.subtext}
                             change={kpi.change}
               trend={kpi.trend as 'up' | 'down' | undefined}
            />
          ))}
        </div>
      </div>

      {/* Member Trends Chart Placeholder */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Member Growth Trends</h2>
        </div>
        
        <Card className="p-6 bg-gradient-to-br from-white to-green-50/20 border-green-100">
          <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">Member Growth Chart</p>
              <p className="text-sm text-gray-400 mt-1">Chart implementation coming soon</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Engagement Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Weekly Actionables</h2>
          </div>
          
          <Card className="p-6 bg-gradient-to-br from-white to-blue-50/20 border-blue-100">
            <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">Engagement Activities</p>
                <p className="text-sm text-gray-400 mt-1">Posts, Reviews, Partnerships, Events</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Retention Analysis</h2>
          </div>
          
          <Card className="p-6 bg-gradient-to-br from-white to-purple-50/20 border-purple-100">
            <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">Retention Trends</p>
                <p className="text-sm text-gray-400 mt-1">Member retention rate over time</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Performance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-white to-green-50/30 border-green-100">
            <div className="text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {(metrics?.summary.newMembersTotal || 0) - (metrics?.summary.membersLostTotal || 0)}
              </p>
              <p className="text-sm text-gray-600">Net Member Growth</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {(metrics?.summary.totalDigitalPosts || 0) + (metrics?.summary.totalGoogleReviews || 0)}
              </p>
              <p className="text-sm text-gray-600">Digital Engagement</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-white to-purple-50/30 border-purple-100">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {(metrics?.summary.totalEvents || 0) + (metrics?.summary.totalPartnerships || 0)}
              </p>
              <p className="text-sm text-gray-600">Events & Partnerships</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 