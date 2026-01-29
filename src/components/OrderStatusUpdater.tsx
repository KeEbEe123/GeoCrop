import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';
import OrderStatusChip from './OrderStatusChip';
import { 
  CheckCircle, 
  Truck, 
  Package, 
  X, 
  RotateCcw,
  Save,
  Calendar
} from 'lucide-react';

interface OrderStatusUpdaterProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: Order['status'], updates?: Partial<Order>) => Promise<void>;
  userRole: 'farmer' | 'buyer' | 'seller';
}

const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({ 
  order, 
  onStatusUpdate, 
  userRole 
}) => {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<Order['status']>(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [notes, setNotes] = useState(order.notes || '');
  const [expectedDelivery, setExpectedDelivery] = useState(
    order.expectedDelivery ? order.expectedDelivery.split('T')[0] : ''
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Define which statuses can be set by farmers/sellers
  const getAvailableStatuses = (): { value: Order['status']; label: string; icon: React.ReactNode; description: string }[] => {
    const baseStatuses = [
      {
        value: 'pending' as const,
        label: 'Pending',
        icon: <CheckCircle className="w-4 h-4" />,
        description: 'Order is awaiting confirmation'
      },
      {
        value: 'confirmed' as const,
        label: 'Confirmed',
        icon: <CheckCircle className="w-4 h-4" />,
        description: 'Order has been confirmed and is being prepared'
      },
      {
        value: 'in_transit' as const,
        label: 'In Transit',
        icon: <Truck className="w-4 h-4" />,
        description: 'Order is on the way to the buyer'
      },
      {
        value: 'delivered' as const,
        label: 'Delivered',
        icon: <Package className="w-4 h-4" />,
        description: 'Order has been delivered successfully'
      },
      {
        value: 'cancelled' as const,
        label: 'Cancelled',
        icon: <X className="w-4 h-4" />,
        description: 'Order has been cancelled'
      }
    ];

    // Filter based on current status and user role
    if (userRole === 'farmer' || userRole === 'seller') {
      switch (order.status) {
        case 'pending':
          return baseStatuses.filter(s => ['confirmed', 'cancelled'].includes(s.value));
        case 'confirmed':
          return baseStatuses.filter(s => ['in_transit', 'cancelled'].includes(s.value));
        case 'in_transit':
          return baseStatuses.filter(s => ['delivered'].includes(s.value));
        case 'delivered':
          return []; // No further updates allowed
        case 'cancelled':
          return []; // No further updates allowed
        default:
          return baseStatuses;
      }
    }

    return []; // Buyers can't update status
  };

  const availableStatuses = getAvailableStatuses();

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status && !trackingId && !notes && !expectedDelivery) {
      toast({
        title: "No Changes",
        description: "No changes were made to update.",
        variant: "default"
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updates: Partial<Order> = {};
      
      if (trackingId !== order.trackingId) {
        updates.trackingId = trackingId;
      }
      
      if (notes !== order.notes) {
        updates.notes = notes;
      }
      
      if (expectedDelivery && expectedDelivery !== order.expectedDelivery?.split('T')[0]) {
        updates.expectedDelivery = expectedDelivery;
      }

      // If status is being set to delivered, set actual delivery date
      if (selectedStatus === 'delivered' && order.status !== 'delivered') {
        updates.actualDelivery = new Date().toISOString();
      }

      await onStatusUpdate(order.id, selectedStatus, updates);

      toast({
        title: "Order Updated",
        description: `Order status updated to ${selectedStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // If user can't update status, show read-only view
  if (availableStatuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Status
          </CardTitle>
          <CardDescription>
            Current order status and tracking information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Status</Label>
            <div className="mt-1">
              <OrderStatusChip status={order.status} size="lg" />
            </div>
          </div>
          
          {order.trackingId && (
            <div>
              <Label>Tracking ID</Label>
              <div className="mt-1 font-mono text-sm bg-muted p-2 rounded">
                {order.trackingId}
              </div>
            </div>
          )}
          
          {order.expectedDelivery && (
            <div>
              <Label>Expected Delivery</Label>
              <div className="mt-1 text-sm">
                {new Date(order.expectedDelivery).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {order.actualDelivery && (
            <div>
              <Label>Delivered On</Label>
              <div className="mt-1 text-sm text-green-600 font-medium">
                {new Date(order.actualDelivery).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {order.notes && (
            <div>
              <Label>Notes</Label>
              <div className="mt-1 text-sm text-muted-foreground">
                {order.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Update Order Status
        </CardTitle>
        <CardDescription>
          Update the order status and provide additional information to the buyer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Current Status</Label>
          <div className="mt-1">
            <OrderStatusChip status={order.status} size="lg" />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Update Status</Label>
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Order['status'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    {status.icon}
                    <div>
                      <div className="font-medium">{status.label}</div>
                      <div className="text-xs text-muted-foreground">{status.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(selectedStatus === 'in_transit' || selectedStatus === 'delivered') && (
          <div>
            <Label htmlFor="trackingId">Tracking ID (Optional)</Label>
            <Input
              id="trackingId"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID for shipment"
            />
          </div>
        )}

        {selectedStatus === 'confirmed' && (
          <div>
            <Label htmlFor="expectedDelivery">Expected Delivery Date (Optional)</Label>
            <Input
              id="expectedDelivery"
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}

        <div>
          <Label htmlFor="notes">Notes for Buyer (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional information for the buyer..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleStatusUpdate} 
          disabled={isUpdating || selectedStatus === order.status}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Updating...' : 'Update Order Status'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderStatusUpdater;