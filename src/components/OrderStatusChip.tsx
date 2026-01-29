import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  X, 
  RotateCcw,
  AlertCircle 
} from 'lucide-react';

interface OrderStatusChipProps {
  status: Order['status'];
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const OrderStatusChip: React.FC<OrderStatusChipProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-3 h-3" />,
          description: 'Order is awaiting confirmation'
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <CheckCircle className="w-3 h-3" />,
          description: 'Order has been confirmed by seller'
        };
      case 'in_transit':
        return {
          label: 'In Transit',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <Truck className="w-3 h-3" />,
          description: 'Order is on the way'
        };
      case 'delivered':
        return {
          label: 'Delivered',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Package className="w-3 h-3" />,
          description: 'Order has been delivered successfully'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <X className="w-3 h-3" />,
          description: 'Order has been cancelled'
        };
      case 'returned':
        return {
          label: 'Returned',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <RotateCcw className="w-3 h-3" />,
          description: 'Order has been returned'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="w-3 h-3" />,
          description: 'Unknown status'
        };
    }
  };

  const config = getStatusConfig(status);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      className={`${config.color} ${sizeClasses[size]} border font-medium inline-flex items-center gap-1.5`}
      title={config.description}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};

export default OrderStatusChip;