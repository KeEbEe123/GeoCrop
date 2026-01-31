import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { ImagePlus, X, Plus } from 'lucide-react';

interface EditProductFormProps {
  product: Product;
  onProductUpdated: (product: Product) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onProductUpdated, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    price: product.price.toString(),
    stock: product.stock.toString(),
    description: product.description,
    brand: product.brand,
    manufacturingDate: product.manufacturingDate,
    expiryDate: product.expiryDate || '',
    weight: product.weight.toString(),
    unit: product.unit,
    minOrderQuantity: product.minOrderQuantity.toString(),
    isOrganic: product.isOrganic,
    featured: product.featured
  });
  const [imageUrls, setImageUrls] = useState<string[]>(product.images.length > 0 ? product.images : ['']);
  const [specifications, setSpecifications] = useState<Array<{key: string, value: string}>>(
    product.specifications 
      ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
  );
  const [certifications, setCertifications] = useState<string[]>(
    product.certifications.length > 0 ? product.certifications : ['']
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.category || !formData.price || !formData.stock || 
        !formData.description || !formData.brand || !formData.manufacturingDate || 
        !formData.weight || !formData.minOrderQuantity) {
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

    // Process specifications
    const specsObj: Record<string, string> = {};
    specifications.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    // Process certifications
    const validCertifications = certifications.filter(cert => cert.trim() !== '');

    try {
      const updatedProduct: Product = {
        ...product,
        name: formData.name,
        category: formData.category as 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'equipment',
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        images: validImages,
        specifications: Object.keys(specsObj).length > 0 ? specsObj : undefined,
        brand: formData.brand,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate || undefined,
        isOrganic: formData.isOrganic,
        certifications: validCertifications,
        minOrderQuantity: parseInt(formData.minOrderQuantity),
        weight: parseFloat(formData.weight),
        unit: formData.unit,
        featured: formData.featured
      };

      await onProductUpdated(updatedProduct);

      toast({
        title: "Product Updated!",
        description: `Your ${formData.name} has been successfully updated.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const updateImageUrl = (index: number, url: string) => {
    const updated = [...imageUrls];
    let processedUrl = url.trim();
    if (processedUrl && !processedUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
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

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      setSpecifications(specifications.filter((_, i) => i !== index));
    }
  };

  const addCertification = () => {
    setCertifications([...certifications, '']);
  };

  const updateCertification = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index] = value;
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    if (certifications.length > 1) {
      setCertifications(certifications.filter((_, i) => i !== index));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
        <CardDescription>
          Update your product information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hybrid Rice Seeds"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., AgriCorp"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seeds">Seeds</SelectItem>
                  <SelectItem value="fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="pesticides">Pesticides</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 150.00"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="e.g., 100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g., 1.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value: 'kg' | 'gm' | 'liter' | 'piece') => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="gm">Gram (gm)</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturingDate">Manufacturing Date *</Label>
              <Input
                id="manufacturingDate"
                type="date"
                value={formData.manufacturingDate}
                onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrderQuantity">Min Order Quantity *</Label>
              <Input
                id="minOrderQuantity"
                type="number"
                value={formData.minOrderQuantity}
                onChange={(e) => setFormData({ ...formData, minOrderQuantity: e.target.value })}
                placeholder="e.g., 1"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOrganic"
                checked={formData.isOrganic}
                onCheckedChange={(checked) => setFormData({ ...formData, isOrganic: checked as boolean })}
              />
              <Label htmlFor="isOrganic">Organic Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Images *</Label>
            <p className="text-sm text-muted-foreground">Add multiple images for better buyer confidence</p>
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
            <Label>Certifications</Label>
            <p className="text-sm text-muted-foreground">Add any certifications your product has</p>
            {certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={cert}
                  onChange={(e) => updateCertification(index, e.target.value)}
                  placeholder="e.g., ISO 9001, Organic Certified"
                />
                {certifications.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCertification(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addCertification}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Product Specifications</Label>
            <p className="text-sm text-muted-foreground">Add key details about your product</p>
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  placeholder="e.g., Variety"
                  className="flex-1"
                />
                <Input
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  placeholder="e.g., IR64"
                  className="flex-1"
                />
                {specifications.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSpecification(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addSpecification}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Specification
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product, its benefits, usage instructions, etc."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Update Product
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

export default EditProductForm;