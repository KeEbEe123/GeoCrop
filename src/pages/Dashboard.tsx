import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCrops } from '@/hooks/useCrops';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import OrderStatusChip from '@/components/OrderStatusChip';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    IndianRupee,
    Package,
    Plus,
    ShoppingCart,
    Sprout,
    Star,
    TrendingUp,
    Users
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Hooks for data
  const { crops, loading: cropsLoading } = useCrops();
  const { orders, loading: ordersLoading } = useOrders(
    user?.id, 
    user?.role === 'farmer' ? 'seller' : user?.role === 'buyer' ? 'buyer' : undefined
  );

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different dashboards based on user role
  switch (user.role) {
    case 'farmer':
      return <FarmerDashboard user={user} crops={crops} orders={orders} loading={cropsLoading || ordersLoading} />;
    case 'buyer':
      return <BuyerDashboard user={user} orders={orders} loading={ordersLoading} />;
    case 'seller':
      return <SellerDashboard user={user} orders={orders} loading={ordersLoading} />;
    default:
      return (
        <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle>Unknown Role</CardTitle>
              <CardDescription>Your account role is not recognized.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
  }
};

// Farmer Dashboard Component
const FarmerDashboard = ({ user, crops, orders, loading }: any) => {
  const navigate = useNavigate();

  const farmerStats = useMemo(() => {
    const farmerCrops = crops.filter((crop: any) => crop.farmerId === user.id);
    const farmerOrders = orders || [];
    
    const totalRevenue = farmerOrders
      .filter((order: any) => order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    
    const totalQuantitySold = farmerOrders
      .filter((order: any) => order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + order.quantity, 0);
    
    const totalQuantityListed = farmerCrops.reduce((sum: number, crop: any) => sum + crop.quantity, 0);
    
    const avgRating = farmerCrops.length > 0 
      ? farmerCrops.reduce((sum: number, crop: any) => sum + crop.averageRating, 0) / farmerCrops.length
      : 0;
    
    const pendingOrders = farmerOrders.filter((order: any) => order.status === 'pending').length;
    const completedOrders = farmerOrders.filter((order: any) => order.status === 'delivered').length;
    const activeListings = farmerCrops.filter((crop: any) => crop.quantity > 0).length;
    
    return {
      totalRevenue,
      totalQuantitySold,
      totalQuantityListed,
      avgRating,
      pendingOrders,
      completedOrders,
      activeListings,
      totalCrops: farmerCrops.length,
      totalOrders: farmerOrders.length
    };
  }, [user.id, crops, orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Farmer Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={() => navigate('/crops')} className="h-16">
            <Plus className="w-5 h-5 mr-2" />
            List New Crop
          </Button>
          <Button onClick={() => navigate('/orders')} variant="outline" className="h-16">
            <Package className="w-5 h-5 mr-2" />
            Manage Orders
          </Button>
          <Button onClick={() => navigate('/prediction')} variant="outline" className="h-16">
            <Sprout className="w-5 h-5 mr-2" />
            Crop Prediction
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{farmerStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From {farmerStats.completedOrders} completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Sprout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmerStats.activeListings}</div>
              <p className="text-xs text-muted-foreground">Out of {farmerStats.totalCrops} total crops</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmerStats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmerStats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Based on crop reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest sales activity</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-4">Start listing your crops to receive orders!</p>
                <Button onClick={() => navigate('/crops')}>
                  <Plus className="w-4 h-4 mr-2" />
                  List Your First Crop
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} units • {order.buyer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                      <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => navigate('/orders')} className="w-full">
                  View All Orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Buyer Dashboard Component
const BuyerDashboard = ({ user, orders, loading }: any) => {
  const navigate = useNavigate();

  const buyerStats = useMemo(() => {
    const buyerOrders = orders || [];
    
    const totalSpent = buyerOrders
      .filter((order: any) => order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    
    const totalOrders = buyerOrders.length;
    const pendingOrders = buyerOrders.filter((order: any) => order.status === 'pending').length;
    const deliveredOrders = buyerOrders.filter((order: any) => order.status === 'delivered').length;
    
    return {
      totalSpent,
      totalOrders,
      pendingOrders,
      deliveredOrders
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buyer Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={() => navigate('/crops')} className="h-16">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Browse Crops
          </Button>
          <Button onClick={() => navigate('/products')} variant="outline" className="h-16">
            <Package className="w-5 h-5 mr-2" />
            Browse Products
          </Button>
          <Button onClick={() => navigate('/orders')} variant="outline" className="h-16">
            <Clock className="w-5 h-5 mr-2" />
            My Orders
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{buyerStats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">On {buyerStats.deliveredOrders} delivered orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buyerStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buyerStats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buyerStats.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Your latest orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-4">Start shopping for fresh crops and products!</p>
                <Button onClick={() => navigate('/crops')}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} units • From {order.seller}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => navigate('/orders')} className="w-full">
                  View All Orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Seller Dashboard Component (for product sellers)
const SellerDashboard = ({ user, orders, loading }: any) => {
  const navigate = useNavigate();

  const sellerStats = useMemo(() => {
    const sellerOrders = orders || [];
    
    const totalRevenue = sellerOrders
      .filter((order: any) => order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    
    const totalOrders = sellerOrders.length;
    const pendingOrders = sellerOrders.filter((order: any) => order.status === 'pending').length;
    const completedOrders = sellerOrders.filter((order: any) => order.status === 'delivered').length;
    
    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={() => navigate('/products')} className="h-16">
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </Button>
          <Button onClick={() => navigate('/orders')} variant="outline" className="h-16">
            <Package className="w-5 h-5 mr-2" />
            Manage Orders
          </Button>
          <Button onClick={() => navigate('/analytics')} variant="outline" className="h-16">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{sellerStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From {sellerStats.completedOrders} completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerStats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerStats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Your latest product sales</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sales Yet</h3>
                <p className="text-muted-foreground mb-4">Start listing your products to receive orders!</p>
                <Button onClick={() => navigate('/products')}>
                  <Plus className="w-4 h-4 mr-2" />
                  List Your First Product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} units • {order.buyer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                      <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => navigate('/orders')} className="w-full">
                  View All Orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;