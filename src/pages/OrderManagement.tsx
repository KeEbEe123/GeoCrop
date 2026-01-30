import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';
import OrderStatusChip from '@/components/OrderStatusChip';
import OrderStatusUpdater from '@/components/OrderStatusUpdater';
import OrderRatingModal from '@/components/OrderRatingModal';
import {
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    IndianRupee,
    Package,
    Search,
    Truck,
    User,
    X,
    Edit,
    Star
} from 'lucide-react';
import { useMemo, useState } from 'react';

const OrderManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusUpdater, setShowStatusUpdater] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState<Order | null>(null);

  // Use real orders from Supabase
  const { orders, loading, error, updateOrderStatus, refetch } = useOrders(
    user?.id, 
    user?.role === 'farmer' ? 'seller' : user?.role === 'buyer' ? 'buyer' : undefined
  );

  // Enhanced status update function
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status'], updates?: Partial<Order>) => {
    try {
      await updateOrderStatus(orderId, newStatus, updates);
      toast({
        title: "Order Updated",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
      });
      refetch(); // Refresh the orders list
      setShowStatusUpdater(null); // Close the status updater
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, searchTerm, statusFilter]);

  const getStatusColor = (status: Order['status']) => {
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'returned': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderSummary = () => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(o => o.status === 'pending').length;
    const confirmed = filteredOrders.filter(o => o.status === 'confirmed').length;
    const inTransit = filteredOrders.filter(o => o.status === 'in_transit').length;
    const delivered = filteredOrders.filter(o => o.status === 'delivered').length;
    
    return { total, pending, confirmed, inTransit, delivered };
  };

  const summary = getOrderSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Loading Orders...</CardTitle>
            <CardDescription>Please wait while we fetch your orders.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Error Loading Orders</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your orders</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {user.role === 'farmer' ? 'Sales Management' : 'Order Management'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {user.role === 'farmer' 
              ? 'Track and manage your crop sales'
              : 'Track your purchases and order history'
            }
          </p>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.confirmed}</div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.inTransit}</div>
              <div className="text-sm text-muted-foreground">In Transit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.delivered}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search orders by ID, item name, or tracking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground">
                  {user?.role === 'farmer' 
                    ? "You haven't received any orders yet. List your crops to start selling!"
                    : "You haven't placed any orders yet. Browse the marketplace to start buying!"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-natural transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{order.item}</h3>
                      <OrderStatusChip status={order.status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order #{order.id}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {user.role === 'farmer' ? order.buyer : order.seller}
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {order.quantity} units
                      </div>
                      {order.trackingId && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          {order.trackingId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {user.role === 'farmer' && ['pending', 'confirmed', 'in_transit'].includes(order.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStatusUpdater(order.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRatingModal(order)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Details - #{selectedOrder.id}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Item:</span>
                        <span className="font-medium">{selectedOrder.item}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{selectedOrder.quantity} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unit Price:</span>
                        <span>₹{selectedOrder.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <OrderStatusChip status={selectedOrder.status} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">
                      {user.role === 'farmer' ? 'Buyer Information' : 'Seller Information'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">
                          {user.role === 'farmer' ? selectedOrder.buyer : selectedOrder.seller}
                        </span>
                      </div>
                      {user.role === 'farmer' && selectedOrder.buyerRating !== undefined && selectedOrder.buyerRating > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Buyer Rating:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (selectedOrder.buyerRating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-1 font-medium">
                              {selectedOrder.buyerRating?.toFixed(1)}
                            </span>
                            {selectedOrder.buyerTotalRatings && selectedOrder.buyerTotalRatings > 0 && (
                              <span className="text-muted-foreground">
                                ({selectedOrder.buyerTotalRatings} reviews)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {user.role === 'farmer' && (!selectedOrder.buyerRating || selectedOrder.buyerRating === 0) && (
                        <div className="flex justify-between">
                          <span>Buyer Rating:</span>
                          <span className="text-muted-foreground">No ratings yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Delivery Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <div className="mt-1">
                        {selectedOrder.shippingAddress.address}<br/>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br/>
                        {selectedOrder.shippingAddress.pincode}
                      </div>
                    </div>
                    {selectedOrder.expectedDelivery && (
                      <div className="flex justify-between">
                        <span>Expected Delivery:</span>
                        <span>{new Date(selectedOrder.expectedDelivery).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedOrder.actualDelivery && (
                      <div className="flex justify-between">
                        <span>Delivered On:</span>
                        <span>{new Date(selectedOrder.actualDelivery).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedOrder.trackingId && (
                      <div className="flex justify-between">
                        <span>Tracking ID:</span>
                        <span className="font-mono">{selectedOrder.trackingId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <Badge className={
                        selectedOrder.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : selectedOrder.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                {user.role === 'farmer' && selectedOrder.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      onClick={() => {
                        handleStatusUpdate(selectedOrder.id, 'confirmed');
                        setSelectedOrder(null);
                      }}
                      className="flex-1"
                    >
                      Confirm Order
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedOrder.id, 'cancelled');
                        setSelectedOrder(null);
                      }}
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Updater Modal */}
        {showStatusUpdater && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStatusUpdater(null)}
                  className="bg-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <OrderStatusUpdater
                order={filteredOrders.find(o => o.id === showStatusUpdater)!}
                onStatusUpdate={handleStatusUpdate}
                userRole={user.role}
              />
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <OrderRatingModal
            order={showRatingModal}
            onClose={() => setShowRatingModal(null)}
            onRatingSubmitted={() => {
              refetch();
              setShowRatingModal(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OrderManagement;