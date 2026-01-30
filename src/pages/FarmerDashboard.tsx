import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { mockCrops, mockMarketAnalytics, mockOrders } from '@/data/mockData';
import { useOrders } from '@/hooks/useOrders';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    IndianRupee,
    Package,
    Sprout,
    Star,
    TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Use real orders from Supabase
  const { orders: farmerOrders, loading: ordersLoading } = useOrders(user?.id, 'seller');

  // Calculate farmer statistics
  const farmerStats = useMemo(() => {
    if (!user) return null;

    const farmerCrops = mockCrops.filter(crop => crop.farmerId === user.id);
    const orders = farmerOrders || [];
    
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const totalQuantitySold = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.quantity, 0);
    
    const totalQuantityListed = farmerCrops.reduce((sum, crop) => sum + crop.quantity, 0);
    
    const avgRating = farmerCrops.length > 0 
      ? farmerCrops.reduce((sum, crop) => sum + crop.averageRating, 0) / farmerCrops.length
      : 0;
    
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const activeListings = farmerCrops.filter(crop => crop.quantity > 0).length;
    
    return {
      totalRevenue,
      totalQuantitySold,
      totalQuantityListed,
      avgRating,
      pendingOrders,
      completedOrders,
      activeListings,
      totalCrops: farmerCrops.length,
      totalOrders: orders.length
    };
  }, [user, farmerOrders]);

  // Revenue data for chart - enhanced with more realistic data
  const revenueData = useMemo(() => {
    if (!user) return [];
    
    // Generate revenue data based on actual orders and some historical data
    const farmerOrders = mockOrders.filter(order => order.sellerId === user.id);
    const deliveredOrders = farmerOrders.filter(order => order.status === 'delivered');
    
    // Base historical data with some variation
    const baseData = [
      { month: 'Aug', revenue: 42000, orders: 11 },
      { month: 'Sep', revenue: 38000, orders: 9 },
      { month: 'Oct', revenue: 45000, orders: 12 },
      { month: 'Nov', revenue: 52000, orders: 15 },
      { month: 'Dec', revenue: 48000, orders: 13 },
      { month: 'Jan', revenue: 67000, orders: 18 }
    ];
    
    // Add current month data based on actual orders
    const currentRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
    
    // Update current month if it exists in base data
    const updatedData = baseData.map(item => 
      item.month === currentMonth 
        ? { ...item, revenue: Math.max(item.revenue, currentRevenue), orders: Math.max(item.orders, deliveredOrders.length) }
        : item
    );
    
    return updatedData;
  }, [user]);

  // Crop performance data
  const cropPerformanceData = useMemo(() => {
    if (!user) return [];
    
    const farmerCrops = mockCrops.filter(crop => crop.farmerId === user.id);
    return farmerCrops.map(crop => ({
      name: crop.name,
      revenue: crop.price * crop.totalSold,
      quantity: crop.totalSold,
      rating: crop.averageRating
    }));
  }, [user]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    if (!user) return [];
    
    const farmerOrders = mockOrders.filter(order => order.sellerId === user.id);
    const statusCounts = farmerOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      in_transit: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
      returned: '#6b7280'
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: colors[status as keyof typeof colors] || '#6b7280'
    }));
  }, [user]);

  if (!user || user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This dashboard is only available for farmers.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!farmerStats) return null;

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Farmer Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{farmerStats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold">{farmerStats.activeListings}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Package className="w-3 h-3 mr-1" />
                    {farmerStats.totalQuantityListed} kg total
                  </p>
                </div>
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{farmerStats.avgRating.toFixed(1)}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(farmerStats.avgRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{farmerStats.pendingOrders}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Require attention
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
            <TabsTrigger value="crops">Crop Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Insights */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Monthly Growth</p>
                      <p className="text-2xl font-bold text-green-900">+12%</p>
                      <p className="text-xs text-green-600">vs last month</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Order Completion</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {farmerStats.totalOrders > 0 
                          ? Math.round((farmerStats.completedOrders / farmerStats.totalOrders) * 100)
                          : 0
                        }%
                      </p>
                      <p className="text-xs text-blue-600">success rate</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ₹{farmerStats.completedOrders > 0 
                          ? Math.round(farmerStats.totalRevenue / farmerStats.completedOrders).toLocaleString()
                          : 0
                        }
                      </p>
                      <p className="text-xs text-purple-600">per order</p>
                    </div>
                    <IndianRupee className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Monthly revenue and order count over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Orders</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Order Status Distribution
                  </CardTitle>
                  <CardDescription>Current status breakdown of all your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orderStatusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value, percent }) => 
                              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                            }
                            labelLine={false}
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [value, 'Orders']}
                            contentStyle={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {orderStatusData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm text-muted-foreground capitalize">
                              {entry.name}: {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No orders found</p>
                        <p className="text-sm">Start selling to see order distribution</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Revenue and quantity trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Sold</span>
                      <span className="font-semibold">{farmerStats.totalQuantitySold} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completed Orders</span>
                      <span className="font-semibold">{farmerStats.completedOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Order Value</span>
                      <span className="font-semibold">
                        ₹{farmerStats.completedOrders > 0 
                          ? Math.round(farmerStats.totalRevenue / farmerStats.completedOrders).toLocaleString()
                          : 0
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-semibold text-green-600">
                        {farmerStats.totalOrders > 0 
                          ? Math.round((farmerStats.completedOrders / farmerStats.totalOrders) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Goals Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monthly Revenue Goal</span>
                        <span>₹72,000 / ₹100,000</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Quality Rating Goal</span>
                        <span>{farmerStats.avgRating.toFixed(1)} / 5.0</span>
                      </div>
                      <Progress value={(farmerStats.avgRating / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Customer Satisfaction</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crop Performance Analysis</CardTitle>
                <CardDescription>Revenue and ratings by crop type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cropPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                    <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCrops.filter(crop => crop.farmerId === user.id).map((crop) => (
                <Card key={crop.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{crop.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={crop.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {crop.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(crop.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          {crop.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span>{crop.quantity} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span>₹{crop.price}/kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Sold:</span>
                      <span className="text-green-600">{crop.totalSold} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Revenue:</span>
                      <span className="font-semibold">₹{(crop.price * crop.totalSold).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FarmerDashboard;