import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, TrendingUp, TrendingDown, Users, Calendar, MessageSquare, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SimpleStoreFilter } from '@/components/filters/SimpleStoreFilter';
import { SimpleDateFilter } from '@/components/filters/SimpleDateFilter';
import { useStores } from '@/hooks/useStores';
import api from '@/lib/api';

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

export function RenojaDashboard() {
  const [selectedStore, setSelectedStore] = React.useState<string>('all');
  const [dateRange, setDateRange] = React.useState({ from: 30, to: 0 });

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
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Failed to load dashboard data
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
      trend: (metrics?.summary.newMembersTotal || 0) > (metrics?.summary.membersLostTotal || 0) ? 'up' : 'down',
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Renoja Dashboard</h1>
        <div className="flex gap-4">
          <SimpleStoreFilter
            stores={stores?.stores || []}
            value={selectedStore}
            onChange={setSelectedStore}
          />
          <SimpleDateFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
                  {kpi.subtext && (
                    <p className="mt-1 text-sm text-gray-500">{kpi.subtext}</p>
                  )}
                  {kpi.change && (
                    <div className="mt-2 flex items-center">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.change}%
                      </span>
                    </div>
                  )}
                </div>
                <Icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Member Trends Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Member Trends</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart component will be implemented next
        </div>
      </Card>

      {/* Engagement Metrics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Actionables</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart for digital posts, reviews, partnerships, events
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Retention Analysis</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Retention rate trend chart
          </div>
        </Card>
      </div>
    </div>
  );
} 