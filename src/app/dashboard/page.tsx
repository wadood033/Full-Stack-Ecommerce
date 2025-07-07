'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Loader,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  orderGrowth: number;
  revenueGrowth: number;
  productGrowth: number;
  customerGrowth: number;
  recentOrders: {
    orderId: number;
    userName: string;
    total: number;
    status: string;
    createdAt: string;
    productName: string;
    productImage: string;
  }[];
  salesData: {
    date: string;
    sales: number;
  }[];
  topProducts: {
    id: number;
    name: string;
    image: string;
    salesCount: number;
    revenue: number;
  }[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [ , startTransition] = useTransition();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard-stats?range=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data: DashboardStats = await res.json();
      data.topProducts = data.topProducts.map(p => ({
        ...p,
        image: p.image || '/placeholder.webp',
      }));
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    startTransition(fetchStats);
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats().finally(() => setRefreshing(false));
  };

  const fmt = (num: number) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(num).replace('PKR', 'Rs.');

  const statsCards = [
    { title: 'Total Orders', value: stats?.totalOrders, icon: ShoppingCart, change: stats?.orderGrowth },
    { title: 'Total Revenue', value: stats?.totalRevenue != null ? fmt(stats.totalRevenue) : null, icon: DollarSign, change: stats?.revenueGrowth },
    { title: 'Total Products', value: stats?.totalProducts, icon: Package, change: stats?.productGrowth },
    { title: 'Total Customers', value: stats?.totalCustomers, icon: Users, change: stats?.customerGrowth },
  ];

  const isLoading = loading || !stats;

  return (
    <>
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/60"
          >
            <div className="flex items-center gap-2 text-sm p-3 bg-white dark:bg-zinc-900 rounded shadow">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading dashboard data...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 sm:p-6 space-y-6 relative"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <p className="text-sm text-muted-foreground">Key metrics and performance</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="bg-muted p-1 rounded-lg flex">
                {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(r => (
                  <Button
                    key={r}
                    variant="ghost"
                    size="sm"
                    className={cn('text-xs px-3 py-1', timeRange === r && 'bg-background shadow')}
                    onClick={() => startTransition(() => setTimeRange(r))}
                  >
                    {r === 'all' ? 'All Time' : r.replace('d', ' Days')}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing || loading}>
                <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map(({ title, value, icon: Icon, change }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {change != null && (
                          <div className={cn('text-xs mt-1', change >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                            {change >= 0 ? '+' : ''}{change}% from last
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-primary/10 text-primary rounded">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Chart & Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Sales Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-10" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                      ticks={[0, 10000, 20000, 30000]}
                      tickFormatter={v => `Rs. ${Math.round(v / 1000)}k`}
                    />
                    <Tooltip formatter={v => [fmt(Number(v)), 'Sales']} />
                    <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scrollable Recent Orders */}
            <Card>
              <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
              <CardContent>
                <div className="min-h-[400px] max-h-[500px] overflow-y-auto pr-2 flex flex-col space-y-4">
                  {stats.recentOrders.map(o => (
                    <div key={o.orderId} className="flex items-center gap-4 shrink-0">
                      <Image src={o.productImage || '/placeholder.webp'} alt={o.productName} width={48} height={48} className="rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{o.productName}</p>
                        <p className="text-sm text-muted-foreground">Order #{o.orderId} by {o.userName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{fmt(o.total)}</p>
                        <p className={cn('text-xs', {
                          'text-emerald-500': o.status === 'Delivered',
                          'text-yellow-500': o.status === 'Pending',
                          'text-destructive': o.status === 'Cancelled'
                        })}>
                          {o.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-8 gap-2">
                {stats.topProducts.map(p => (
                  <div key={p.id} className="border rounded-lg w-40 space-y-1">
                    <Image src={p.image} alt={p.name} width={160} height={160} className="rounded w-full h-47 object-cover" />
                    <div className="flex justify-between text-xs p-2">
                      <div>
                        <h3 className="font-medium line-clamp-1">{p.name}</h3>
                        <p className="text-muted-foreground">{p.salesCount} sold</p>
                      </div>
                      <div className="font-bold whitespace-nowrap">{fmt(p.revenue)}</div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, (p.salesCount / (stats.topProducts[0]?.salesCount || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}
