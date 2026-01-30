import AddCropForm from '@/components/forms/AddCropForm';
import EditCropForm from '@/components/forms/EditCropForm';
import ImageGallery from '@/components/ImageGallery';
import OrderConfirmationDialog from '@/components/OrderConfirmationDialog';
import RatingDisplay from '@/components/RatingDisplay';
import RatingsSection from '@/components/RatingsSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useCrops } from '@/hooks/useCrops';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/supabase';
import { emailServiceClient } from '@/services/emailService';
import { Crop } from '@/types';
import { ChevronDown, Edit, Filter, IndianRupee, Leaf, MapPin, Package, Plus, Search, Star, Trash2, Truck, User, X } from 'lucide-react';
import React, { useState } from 'react';

const CropMarketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { crops, loading, addCrop, updateCrop, deleteCrop, getCropsByFarmer } = useCrops();
  const { createOrder } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [qualityGrade, setQualityGrade] = useState<string>('all');
  const [farmingMethod, setFarmingMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    isOpen: boolean;
    crop: Crop | null;
    quantity: number;
  }>({ isOpen: false, crop: null, quantity: 0 });
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  React.useEffect(() => {
    let filtered = crops;
    
    // Filter based on user role
    if (user?.role === 'farmer') {
      // Farmers see only their own crops for management
      filtered = getCropsByFarmer(user.id);
    } else if (user?.role === 'buyer') {
      // Buyers see all available crops
      filtered = crops;
    } else if (user?.role === 'seller') {
      // Sellers shouldn't access crop marketplace
      filtered = [];
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.cropVariety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(crop => crop.category === categoryFilter);
    }

    // Apply price range filter
    filtered = filtered.filter(crop => 
      crop.price >= priceRange[0] && crop.price <= priceRange[1]
    );

    // Apply organic filter
    if (organicOnly) {
      filtered = filtered.filter(crop => crop.isOrganic);
    }

    // Apply quality grade filter
    if (qualityGrade !== 'all') {
      filtered = filtered.filter(crop => crop.qualityGrade === qualityGrade);
    }

    // Apply farming method filter
    if (farmingMethod !== 'all') {
      filtered = filtered.filter(crop => crop.farmingMethod === farmingMethod);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'newest':
          return new Date(b.harvestDate || '').getTime() - new Date(a.harvestDate || '').getTime();
        case 'quantity':
          return b.quantity - a.quantity;
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
    
    setFilteredCrops(filtered);
  }, [searchTerm, categoryFilter, priceRange, organicOnly, qualityGrade, farmingMethod, sortBy, user, crops, getCropsByFarmer]);

  const handleOrder = (crop: Crop) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place orders.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'buyer') {
      toast({
        title: "Access denied",
        description: "Only buyers can place orders for crops.",
        variant: "destructive",
      });
      return;
    }

    const quantity = orderQuantities[crop.id] || crop.minOrderQuantity;
    setOrderConfirmation({
      isOpen: true,
      crop,
      quantity
    });
  };

  const confirmOrder = async () => {
    if (!orderConfirmation.crop || !user) return;

    const { crop, quantity } = orderConfirmation;

    // Get seller information to get their email
    const sellerUser = await SupabaseService.getUserById(crop.farmerId);
    
    // Create a new order using the hook
    const newOrder = await createOrder({
      buyer: user.name,
      buyerId: user.id,
      buyerEmail: user.email,
      seller: crop.farmer,
      sellerId: crop.farmerId,
      sellerEmail: sellerUser?.email,
      item: crop.name,
      itemId: crop.id,
      quantity: quantity,
      price: crop.price,
      totalAmount: crop.price * quantity,
      status: 'pending' as const,
      type: 'crop' as const,
      expectedDelivery: undefined,
      actualDelivery: undefined,
      paymentMethod: 'cod' as const,
      paymentStatus: 'pending' as const,
      shippingAddress: {
        address: '123 Default Address',
        city: user.location.split(',')[0],
        state: user.location.split(',')[1] || 'Unknown',
        pincode: '000000'
      },
      trackingId: undefined,
      notes: undefined,
      cancellationReason: undefined
    });

    setOrderConfirmation({ isOpen: false, crop: null, quantity: 0 });

    if (newOrder) {
      // Send new order notification email to seller
      if (sellerUser?.email) {
        emailServiceClient.sendNewOrderEmail({
          sellerName: crop.farmer,
          sellerEmail: sellerUser.email,
          orderId: newOrder.id,
          itemName: crop.name,
          quantity: quantity,
          buyerName: user.name,
          buyerLocation: user.location,
          totalAmount: newOrder.totalAmount,
          orderDate: newOrder.orderDate,
          expectedDelivery: undefined,
          shippingAddress: newOrder.shippingAddress,
          paymentMethod: newOrder.paymentMethod,
          paymentStatus: newOrder.paymentStatus
        }).then((result) => {
          if (result.success) {
            console.log('✅ New order email sent to seller');
          } else {
            console.warn('⚠️ Failed to send new order email:', result.message);
          }
        }).catch((error) => {
          console.warn('⚠️ New order email service error:', error);
        });
      }

      toast({
        title: "Order Placed!",
        description: `Your order for ${crop.name} (${quantity} kg) has been sent to ${crop.farmer}. Total: ₹${newOrder.totalAmount.toLocaleString()}`,
      });
    } else {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddCrop = () => {
    setShowAddForm(true);
  };

  const handleCropAdded = async (newCrop: Crop) => {
    const result = await addCrop(newCrop);
    if (result) {
      setShowAddForm(false);
      toast({
        title: "Crop Listed!",
        description: `Your ${newCrop.name} has been successfully listed in the marketplace.`,
      });
    } else {
      toast({
        title: "Failed to List Crop",
        description: "There was an error listing your crop. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setShowEditForm(true);
  };

  const handleCropUpdated = async (cropId: string, updatedData: Partial<Crop>) => {
    const success = await updateCrop(cropId, updatedData);
    if (success) {
      toast({
        title: "Crop Updated",
        description: "Your crop listing has been updated successfully.",
      });
      setShowEditForm(false);
      setEditingCrop(null);
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to update crop. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCrop = async (cropId: string, cropName: string) => {
    const success = await deleteCrop(cropId);
    if (success) {
      toast({
        title: "Crop Removed",
        description: `${cropName} has been removed from your listings.`,
      });
    } else {
      toast({
        title: "Failed to Remove Crop",
        description: "There was an error removing your crop. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Block access for sellers
  if (user?.role === 'seller') {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Crop marketplace is for farmers and buyers only. As a seller, you can access the Input Marketplace.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {user?.role === 'farmer' ? 'Manage Your Crops' : 'Crop Marketplace'}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {user?.role === 'farmer' 
              ? 'List and manage your crop inventory'
              : 'Fresh crops directly from farmers to your doorstep'
            }
          </p>
          
          {user?.role === 'farmer' && (
            <Button onClick={handleAddCrop} className="mb-6">
              <Plus className="w-4 h-4 mr-2" />
              List Your Crop
            </Button>
          )}
          
          {/* Search and Filter */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search crops, varieties, locations, or farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Recently Harvested</SelectItem>
                    <SelectItem value="quantity">Most Available</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Category Filter */}
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="cereals">Cereals</SelectItem>
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="fruits">Fruits</SelectItem>
                            <SelectItem value="pulses">Pulses</SelectItem>
                            <SelectItem value="spices">Spices</SelectItem>
                            <SelectItem value="cash_crops">Cash Crops</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-2">
                        <Label>Price Range (₹/kg)</Label>
                        <div className="px-2">
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>₹{priceRange[0]}</span>
                            <span>₹{priceRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quality Grade */}
                      <div className="space-y-2">
                        <Label>Quality Grade</Label>
                        <Select value={qualityGrade} onValueChange={setQualityGrade}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Grades" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            <SelectItem value="A">Grade A</SelectItem>
                            <SelectItem value="B">Grade B</SelectItem>
                            <SelectItem value="C">Grade C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Farming Method */}
                      <div className="space-y-2">
                        <Label>Farming Method</Label>
                        <Select value={farmingMethod} onValueChange={setFarmingMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Methods" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="organic">Organic</SelectItem>
                            <SelectItem value="conventional">Conventional</SelectItem>
                            <SelectItem value="sustainable">Sustainable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="organic"
                          checked={organicOnly}
                          onCheckedChange={(checked) => setOrganicOnly(checked === true)}
                        />
                        <Label htmlFor="organic" className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-600" />
                          Organic Only
                        </Label>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {filteredCrops.length} crops found
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setCategoryFilter('all');
                          setPriceRange([0, 100]);
                          setOrganicOnly(false);
                          setQualityGrade('all');
                          setFarmingMethod('all');
                          setSortBy('featured');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Crops Grid or Add Form or Edit Form */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl text-muted-foreground">Loading crops...</p>
          </div>
        ) : showAddForm ? (
          <AddCropForm 
            onCropAdded={handleCropAdded}
            onCancel={() => setShowAddForm(false)}
          />
        ) : showEditForm && editingCrop ? (
          <EditCropForm 
            crop={editingCrop}
            onCropUpdated={handleCropUpdated}
            onCancel={() => {
              setShowEditForm(false);
              setEditingCrop(null);
            }}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <Card key={crop.id} className="group hover:shadow-natural transition-all duration-300">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <ImageGallery images={crop.images} title={crop.name} />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-2xl">{crop.name}</CardTitle>
                        {crop.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {crop.category && (
                          <Badge className="bg-green-100 text-green-800">
                            {crop.category}
                          </Badge>
                        )}
                        <Badge className={`${crop.isOrganic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          <Leaf className="w-3 h-3 mr-1" />
                          {crop.isOrganic ? 'Organic' : crop.farmingMethod}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          Grade {crop.qualityGrade}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <RatingDisplay rating={crop.averageRating} size="sm" />
                        <span className="text-sm text-muted-foreground">
                          ({crop.reviews.length} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {crop.description}
                  </CardDescription>
                  <div className="text-sm text-muted-foreground">
                    <strong>Variety:</strong> {crop.cropVariety}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="w-4 h-4 mr-2" />
                      {crop.farmer}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {crop.location}
                    </div>
                    {crop.harvestDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Package className="w-4 h-4 mr-2" />
                        Harvested: {new Date(crop.harvestDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-accent">
                      <Truck className="w-4 h-4 mr-2" />
                      {crop.quantity} kg available (Min: {crop.minOrderQuantity} kg)
                    </div>
                    {crop.certifications.length > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Package className="w-4 h-4 mr-2" />
                        Certified: {crop.certifications.join(', ')}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="w-4 h-4 mr-2" />
                      Storage: {crop.storageType.replace('_', ' ')} | Shelf life: {crop.shelfLife} days
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Package className="w-4 h-4 mr-2" />
                      {crop.totalSold.toLocaleString()} kg sold total
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center text-2xl font-bold text-primary">
                        <IndianRupee className="w-6 h-6" />
                        {crop.price}/kg
                      </div>
                      {user?.role === 'buyer' ? (
                        <div className="flex flex-col gap-2 ml-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`quantity-${crop.id}`} className="text-sm">Qty (kg):</Label>
                            <Input
                              id={`quantity-${crop.id}`}
                              type="number"
                              min={crop.minOrderQuantity}
                              max={crop.quantity}
                              value={orderQuantities[crop.id] || crop.minOrderQuantity}
                              onChange={(e) => setOrderQuantities({
                                ...orderQuantities,
                                [crop.id]: parseInt(e.target.value) || crop.minOrderQuantity
                              })}
                              className="w-20 h-8"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleOrder(crop)}
                              disabled={crop.quantity === 0}
                              size="sm"
                            >
                              {crop.quantity === 0 ? 'Sold Out' : 'Order Now'}
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCrop(crop)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ) : user?.role === 'farmer' && user.name === crop.farmer ? (
                        <div className="flex gap-2 ml-4">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCrop(crop)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCrop(crop.id, crop.name)}
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

        {filteredCrops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
               {user?.role === 'farmer' 
                ? "You haven't listed any crops yet. Click 'List Your Crop' to get started."
                : "No crops found matching your search."
              }
            </p>
          </div>
        )}

        {/* Order Confirmation Dialog */}
        {orderConfirmation.crop && (
          <OrderConfirmationDialog
            isOpen={orderConfirmation.isOpen}
            onClose={() => setOrderConfirmation({ isOpen: false, crop: null, quantity: 0 })}
            onConfirm={confirmOrder}
            item={{
              name: orderConfirmation.crop.name,
              price: orderConfirmation.crop.price,
              quantity: orderConfirmation.quantity,
              seller: orderConfirmation.crop.farmer
            }}
          />
        )}

        {!user && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Join the Marketplace</CardTitle>
                <CardDescription>
                  Sign up as a farmer to sell crops or as a buyer to purchase fresh produce
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

      {/* Detailed Crop View Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedCrop.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCrop(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Crop Images */}
              {selectedCrop.images.length > 0 && (
                <div>
                  <ImageGallery images={selectedCrop.images} />
                </div>
              )}

              {/* Crop Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Crop Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Farmer:</span>
                        <span className="font-medium">{selectedCrop.farmer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{selectedCrop.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span>{selectedCrop.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality Grade:</span>
                        <span>Grade {selectedCrop.qualityGrade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Farming Method:</span>
                        <span className="capitalize">{selectedCrop.farmingMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Type:</span>
                        <span className="capitalize">{selectedCrop.storageType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shelf Life:</span>
                        <span>{selectedCrop.shelfLife} days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pricing & Availability</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Price per kg:</span>
                        <span className="font-medium text-lg">₹{selectedCrop.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Quantity:</span>
                        <span>{selectedCrop.quantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Order:</span>
                        <span>{selectedCrop.minOrderQuantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available From:</span>
                        <span>{new Date(selectedCrop.availableFrom).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available To:</span>
                        <span>{new Date(selectedCrop.availableTo).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedCrop.description}</p>
                  </div>

                  {selectedCrop.certifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCrop.certifications.map((cert, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {user?.role === 'buyer' && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Place Order</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="modal-quantity">Quantity (kg):</Label>
                          <Input
                            id="modal-quantity"
                            type="number"
                            min={selectedCrop.minOrderQuantity}
                            max={selectedCrop.quantity}
                            value={orderQuantities[selectedCrop.id] || selectedCrop.minOrderQuantity}
                            onChange={(e) => setOrderQuantities({
                              ...orderQuantities,
                              [selectedCrop.id]: parseInt(e.target.value) || selectedCrop.minOrderQuantity
                            })}
                            className="w-24"
                          />
                        </div>
                        <div className="text-lg font-semibold">
                          Total: ₹{((orderQuantities[selectedCrop.id] || selectedCrop.minOrderQuantity) * selectedCrop.price).toLocaleString()}
                        </div>
                        <Button 
                          onClick={() => {
                            handleOrder(selectedCrop);
                            setSelectedCrop(null);
                          }}
                          disabled={selectedCrop.quantity === 0}
                          className="w-full"
                        >
                          {selectedCrop.quantity === 0 ? 'Sold Out' : 'Place Order'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ratings Section */}
              <RatingsSection
                entityType="crop"
                entityId={selectedCrop.id}
                entityName={selectedCrop.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropMarketplace;