import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/supabase';
import { emailServiceClient } from '@/services/emailService';
import { hashPassword, validateEmail, validatePassword } from '@/utils/auth';
import { User } from '@/types';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    location: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!formData.role) {
        throw new Error('Please select a role');
      }

      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }

      // Check if user already exists
      const existingUser = await SupabaseService.getUserByEmail(formData.email);
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(formData.password);

      // Create user
      const newUser = await SupabaseService.createUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        role: formData.role as 'farmer' | 'buyer' | 'seller',
        location: formData.location.trim(),
        phone: formData.phone.trim() || undefined,
        avatar: undefined,
        verified: false,
        rating: 0,
        coordinates: undefined,
        passwordHash
      });

      if (!newUser) {
        throw new Error('Failed to create account. Please try again.');
      }

      // Send welcome email (don't await to prevent blocking registration)
      console.log('🚀 Attempting to send welcome email for new user:', newUser.email);
      emailServiceClient.sendWelcomeEmail({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location
      }).then((result) => {
        if (result.success) {
          console.log('✅ Welcome email sent successfully');
          toast({
            title: "Welcome Email Sent!",
            description: "Check your email for a welcome message with getting started tips.",
          });
        } else {
          console.warn('⚠️ Welcome email failed to send:', result.message);
        }
      }).catch((error) => {
        console.warn('⚠️ Welcome email service error:', error);
      });

      toast({
        title: "Account Created!",
        description: `Welcome to GeoCrop, ${newUser.name}! You can now start using the platform.`,
      });

      onSuccess(newUser);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        location: '',
        phone: ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Join GeoCrop to connect with farmers, buyers, and sellers in the agricultural marketplace.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email address"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                disabled={loading}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters with uppercase and lowercase letters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                disabled={loading}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Farmer - Sell crops and produce</SelectItem>
                <SelectItem value="buyer">Buyer - Purchase crops and produce</SelectItem>
                <SelectItem value="seller">Seller - Sell farming supplies and equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91-9876543210"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 order-1 sm:order-2">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;