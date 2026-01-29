import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Crop } from '@/types';
import { ImagePlus, X } from 'lucide-react';

interface EditCropFormProps {
  crop: Crop;
  onCropUpdated: (cropId: string, updatedData: Partial<Crop>) => void;
  onCancel: () => void;
}

const EditCropForm: React.FC<EditCropFormProps> = ({ crop, onCropUpdated, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: crop.name,
    quantity: crop.quantity.toString(),
    price: crop.price.toString(),
    description: crop.description,
    category: crop.category || '',
    harvestDate: crop.harvestDate || ''
  });
  const [imageUrls, setImageUrls] = useState<string[]>(crop.images.length > 0 ? crop.images : ['']);

  const handleSubmit = (e: React.FormEvent) => {
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

    // Filter out empty image URLs
    const validImages = imageUrls.filter(url => url.trim() !== '');
    if (validImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please add at least one image of your crop.",
        variant: "destructive"
      });
      return;
    }

    const updatedCropData: Partial<Crop> = {
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      harvestDate: formData.harvestDate,
      images: validImages,
      isOrganic: crop.isOrganic, // Keep existing organic status
      certifications: crop.certifications, // Keep existing certifications
      storageType: crop.storageType, // Keep existing storage type
      shelfLife: crop.shelfLife, // Keep existing shelf life
      minOrderQuantity: crop.minOrderQuantity, // Keep existing min order
      availableFrom: crop.availableFrom, // Keep existing availability
      availableTo: crop.availableTo, // Keep existing availability
      cropVariety: crop.cropVariety, // Keep existing variety
      farmingMethod: crop.farmingMethod, // Keep existing farming method
      qualityGrade: crop.qualityGrade, // Keep existing quality grade
      moistureContent: crop.moistureContent, // Keep existing moisture content
    };

    onCropUpdated(crop.id, updatedCropData);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Crop Listing</CardTitle>
        <CardDescription>
          Update your crop information and pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Organic Tomatoes"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="pulses">Pulses</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="herbs">Herbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (kg) *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 100"
                min="1"
                required
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
                placeholder="e.g., 50.00"
                min="0.01"
                required
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your crop quality, farming methods, etc."
              rows={4}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Crop Images *</Label>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1"
                />
                {imageUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImageUrl(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addImageUrl}
              className="w-full"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Add Another Image
            </Button>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Update Crop
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditCropForm;