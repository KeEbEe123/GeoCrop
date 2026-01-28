import React, { useState } from 'react';
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
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

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
        description: "Please add at least one image URL.",
        variant: "destructive"
      });
      return;
    }

    const newCrop = {
      name: formData.name,
      farmer: user.name,
      farmerId: user.id,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      location: user.location,
      images: validImages,
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

    onCropAdded(newCrop);

    toast({
      title: "Crop Data Prepared!",
      description: `Your ${formData.name} is ready to be listed in the marketplace.`
    });
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const updateImageUrl = (index: number, url: string) => {
    const updated = [...imageUrls];
    // Process image URL to ensure it's treated as jpg/jpeg
    let processedUrl = url.trim();
    if (processedUrl && !processedUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      // If no extension, assume it's a jpg
      processedUrl = processedUrl + '.jpg';
    }
    updated[index] = processedUrl;
    setImageUrls(updated);
  };

  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
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
            <p className="text-sm text-muted-foreground">Add multiple images so buyers can verify quality</p>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  placeholder="Enter image URL"
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
            <Button type="submit" className="flex-1">
              List Crop
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCropForm;