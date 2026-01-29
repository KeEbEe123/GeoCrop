import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ui/image-upload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Crop } from '@/types';

interface AddCropFormProps {
  onCropAdded: (crop: Omit<Crop, 'id' | 'reviews' | 'averageRating' | 'totalSold'>) => void;
  onCancel: () => void;
}

const AddCropForm: React.FC<AddCropFormProps> = ({ onCropAdded, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    description: '',
    category: '',
    harvestDate: ''
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate form
    if (!formData.name || !formData.quantity || !formData.price || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Check if images are uploaded
    if (imageUrls.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your crop.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newCrop = {
        name: formData.name,
        farmer: user.name,
        farmerId: user.id,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        location: user.location,
        images: imageUrls,
        description: formData.description,
        category: formData.category,
        harvestDate: formData.harvestDate,
        isOrganic: false,
        certifications: [],
        storageType: 'fresh' as const,
        shelfLife: 7,
        minOrderQuantity: Math.max(1, Math.floor(parseInt(formData.quantity) / 10)),
        availableFrom: formData.harvestDate || new Date().toISOString().split('T')[0],
        availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cropVariety: 'Standard',
        farmingMethod: 'conventional' as const,
        qualityGrade: 'A' as const,
        moistureContent: undefined,
        coordinates: undefined,
        featured: false
      };

      await onCropAdded(newCrop);

      toast({
        title: "Crop Listed Successfully!",
        description: `Your ${formData.name} has been added to the marketplace.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list your crop. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>List Your Crop</CardTitle>
        <CardDescription>
          Add your crop to the marketplace for buyers to discover
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Wheat, Rice, Tomatoes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cereals">Cereals</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="pulses">Pulses</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (kg) *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per kg (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 25.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvestDate">Harvest Date</Label>
            <Input
              id="harvestDate"
              type="date"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Crop Images *</Label>
            <ImageUpload
              onImagesChange={setImageUrls}
              userId={user?.id || ''}
              maxImages={5}
              existingImages={imageUrls}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your crop quality, farming methods, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Listing Crop...' : 'List Crop'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCropForm;