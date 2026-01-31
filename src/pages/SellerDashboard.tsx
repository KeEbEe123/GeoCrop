import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { Product, Order } from '@/types';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  IndianRupee, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Calendar,
  Weight,
  Star
} from 'lucide-react';
import AddProductForm from '@/components/forms/AddProductForm';
import EditProductForm from '@/components/forms/EditProductForm';
import OrderStatusUpdater from '@/components/OrderStatusUpdater';
import RatingDisplay from '@/components/RatingDisplay';
import ImageGallery from '@/components/ImageGallery';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Calculate dashboard stats
  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const lowStockProducts = products.filter(product => product.stock <= 5).length;

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts
    };
  }, [products, orders]);

  const handleAddProduct = () => {
    setShowAddForm(true);
  };

  const handleProductAdded = async (newProductData: Product) => {
    try {
      await addProduct(newProductData);
      setShowAddForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleProductUpdated = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
      setEditingProduct(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: Order['status'], updates?: Partial<Order>) => {
    try {
      await updateOrderStatus(orderId, status, updates);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'seeds': return 'bg-green-100 text-green-800';
      case 'fertilizers': return 'bg-blue-100 text-blue-800';
      case 'pesticides': return 'bg-orange-100 text-orange-800';
      case 'tools': return 'bg-purple-100 text-purple-800';
      case 'equipment': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This dashboard is only available for sellers.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (productsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Welcome back, {user.name}! Manage your products and orders.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {showAddForm ? (
          <AddProductForm 
            onProductAdded={handleProductAdded}
            onCancel={() => setShowAddForm(false)}
          />
        ) : editingProduct ? (
          <EditProductForm
            product={editingProduct}
            onProductUpdated={handleProductUpdated}
            onCancel={() => setEditingProduct(null)}
          />
        ) : (
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Products</h2>
                <Button onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="group hover:shadow-natural transition-all duration-300">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <ImageGallery images={product.images} title={product.name} />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge className={getCategoryColor(product.category)}>
                          {product.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-lg font-bold text-primary">
                            <IndianRupee className="w-5 h-5" />
                            {product.price.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{product.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            <span className={product.stock <= 5 ? 'text-red-600 font-medium' : ''}>
                              {product.stock} units
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Weight className="w-4 h-4 mr-1" />
                            {product.weight} {product.unit}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          Mfg: {formatDate(product.manufacturingDate)}
                        </div>
                        
                        {product.isOrganic && (
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
                            Organic
                          </Badge>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground mb-4">
                    You haven't listed any products yet.
                  </p>
                  <Button onClick={handleAddProduct}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-6">
              <h2 className="text-2xl font-bold">Orders</h2>
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                          <CardDescription>
                            {order.item} × {order.quantity} units
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Buyer:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{order.buyer}</span>
                              {order.buyerRating && order.buyerRating > 0 && (
                                <RatingDisplay 
                                  rating={order.buyerRating} 
                                  totalRatings={order.buyerTotalRatings}
                                  size="sm"
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Order Date:</span>
                            <span className="font-medium">{formatDate(order.orderDate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Amount:</span>
                            <span className="font-bold text-primary">₹{order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Payment:</span>
                            <Badge variant="outline">{order.paymentMethod.toUpperCase()}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Payment Status:</span>
                            <Badge variant="outline">{order.paymentStatus}</Badge>
                          </div>
                          {order.trackingId && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Tracking ID:</span>
                              <span className="font-mono text-sm">{order.trackingId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <OrderStatusUpdater
                          order={order}
                          onStatusUpdate={handleOrderStatusUpdate}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">
                    No orders yet. Start by listing some products!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;