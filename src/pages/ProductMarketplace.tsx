import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { Product } from '@/types';
import { Search, Store, Package, IndianRupee, Truck, Plus, Edit, Trash2, Calendar, Weight } from 'lucide-react';
import AddProductForm from '@/components/forms/AddProductForm';
import EditProductForm from '@/components/forms/EditProductForm';
import ImageGallery from '@/components/ImageGallery';
import OrderConfirmationDialog from '@/components/OrderConfirmationDialog';

const ProductMarketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { createOrder } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    isOpen: boolean;
    product: Product | null;
    quantity: number;
  }>({ isOpen: false, product: null, quantity: 0 });
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});

  // Filter products based on search and category
  const filteredProducts = React.useMemo(() => {
    let filtered = products;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    return filtered;
  }, [products, searchTerm, categoryFilter]);

  const handleOrder = (product: Product) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place orders.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'farmer') {
      toast({
        title: "Access denied",
        description: "Only farmers can purchase farming inputs.",
        variant: "destructive",
      });
      return;
    }

    const quantity = orderQuantities[product.id] || 1;
    setOrderConfirmation({
      isOpen: true,
      product,
      quantity
    });
  };

  const confirmOrder = async () => {
    if (!orderConfirmation.product || !user) return;

    const { product, quantity } = orderConfirmation;

    try {
      const orderData = {
        buyer: user.name,
        buyerId: user.id,
        seller: product.seller,
        sellerId: product.sellerId,
        item: product.name,
        itemId: product.id,
        quantity: quantity,
        price: product.price,
        totalAmount: product.price * quantity,
        status: 'pending' as const,
        type: 'product' as const,
        paymentMethod: 'cod' as const,
        paymentStatus: 'pending' as const,
        shippingAddress: {
          address: '123 Default Address',
          city: user.location.split(',')[0],
          state: user.location.split(',')[1] || 'Unknown',
          pincode: '000000'
        }
      };

      await createOrder(orderData);

      setOrderConfirmation({ isOpen: false, product: null, quantity: 0 });

      toast({
        title: "Order Placed!",
        description: `Your order for ${product.name} (${quantity} units) has been sent to ${product.seller}. Total: ₹${orderData.totalAmount.toLocaleString()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  };

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

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      await deleteProduct(productId);
      toast({
        title: "Product Removed",
        description: `${productName} has been removed from your listings.`,
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  // Block access for buyers
  if (user?.role === 'buyer') {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Input marketplace is for farmers and sellers only. As a buyer, you can access the Crop Marketplace.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {user?.role === 'seller' ? 'Manage Your Products' : 'Input Marketplace'}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {user?.role === 'seller' 
              ? 'List and manage your farming products inventory'
              : 'Quality seeds, fertilizers, and farming supplies from trusted sellers'
            }
          </p>
          
          {user?.role === 'seller' && (
            <Button onClick={handleAddProduct} className="mb-6">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          )}
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products, sellers, or brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="seeds">Seeds</SelectItem>
                <SelectItem value="fertilizers">Fertilizers</SelectItem>
                <SelectItem value="pesticides">Pesticides</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid or Forms */}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-natural transition-all duration-300">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <ImageGallery images={product.images} title={product.name} />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <Badge className={getCategoryColor(product.category)}>
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="w-4 h-4" />
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <CardDescription className="text-base">
                    {product.description}
                  </CardDescription>
                  {product.specifications && (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium">Key Specifications:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Store className="w-4 h-4 mr-2" />
                      {product.seller}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="w-4 h-4 mr-2" />
                      {product.stock} units in stock
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Weight className="w-4 h-4 mr-2" />
                      {product.weight} {product.unit} per unit
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      Mfg: {formatDate(product.manufacturingDate)}
                    </div>
                    {product.expiryDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Exp: {formatDate(product.expiryDate)}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-accent">
                      <Truck className="w-4 h-4 mr-2" />
                      Free delivery available
                    </div>
                    {product.isOrganic && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        Organic
                      </Badge>
                    )}
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center text-2xl font-bold text-primary">
                        <IndianRupee className="w-6 h-6" />
                        {product.price.toLocaleString()}
                      </div>
                      {user?.role === 'farmer' ? (
                        <div className="flex flex-col gap-2 ml-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`quantity-${product.id}`} className="text-sm">Qty:</Label>
                            <Input
                              id={`quantity-${product.id}`}
                              type="number"
                              min={product.minOrderQuantity}
                              max={product.stock}
                              value={orderQuantities[product.id] || product.minOrderQuantity}
                              onChange={(e) => setOrderQuantities({
                                ...orderQuantities,
                                [product.id]: parseInt(e.target.value) || product.minOrderQuantity
                              })}
                              className="w-20 h-8"
                            />
                          </div>
                          <Button 
                            onClick={() => handleOrder(product)}
                            disabled={product.stock === 0}
                            size="sm"
                          >
                            {product.stock === 0 ? 'Out of Stock' : 'Order Now'}
                          </Button>
                        </div>
                      ) : user?.role === 'seller' && user.id === product.sellerId ? (
                        <div className="flex gap-2 ml-4">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !showAddForm && !editingProduct && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              {user?.role === 'seller' 
                ? "You haven't listed any products yet. Click 'Add New Product' to get started."
                : "No products found matching your criteria."
              }
            </p>
          </div>
        )}

        {/* Order Confirmation Dialog */}
        {orderConfirmation.product && (
          <OrderConfirmationDialog
            isOpen={orderConfirmation.isOpen}
            onClose={() => setOrderConfirmation({ isOpen: false, product: null, quantity: 0 })}
            onConfirm={confirmOrder}
            item={{
              name: orderConfirmation.product.name,
              price: orderConfirmation.product.price,
              quantity: orderConfirmation.quantity,
              seller: orderConfirmation.product.seller
            }}
          />
        )}

        {!user && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Join the Marketplace</CardTitle>
                <CardDescription>
                  Sign up as a farmer to buy supplies or as a seller to offer quality farming products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <a href="/register">Sign Up</a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMarketplace;