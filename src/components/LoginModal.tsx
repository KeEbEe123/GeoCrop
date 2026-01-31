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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/supabase';
import { hashPassword, validateEmail } from '@/utils/auth';
import { User } from '@/types';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!formData.password) {
        throw new Error('Password is required');
      }

      // Check if user exists
      const existingUser = await SupabaseService.getUserByEmail(formData.email.toLowerCase().trim());
      if (!existingUser) {
        throw new Error('No account found with this email address');
      }

      // Hash password and authenticate
      const passwordHash = await hashPassword(formData.password);
      const authenticatedUser = await SupabaseService.authenticateUser(formData.email.toLowerCase().trim(), passwordHash);

      if (!authenticatedUser) {
        throw new Error('Invalid password. Please check your credentials and try again.');
      }

      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${authenticatedUser.name}`,
      });

      onSuccess(authenticatedUser);
      onClose();
      
      // Reset form
      setFormData({
        email: '',
        password: ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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

  const handleSwitchToRegister = () => {
    if (!loading) {
      setError('');
      onClose();
      onSwitchToRegister();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Welcome back! Please sign in to your GeoCrop account.
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
            <Label htmlFor="email">Email Address</Label>
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
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
          </div>

          <DialogFooter className="flex flex-col gap-3 pt-4 sm:flex-row">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="flex-1 order-2 sm:order-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 order-1 sm:order-2">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </div>
            
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={handleSwitchToRegister}
                  disabled={loading}
                >
                  Create one here
                </Button>
              </p>
            </div>
          </DialogFooter>
        </form>

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Credentials:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span><strong>Farmer:</strong> rajesh.farmer@example.com</span>
              <span className="sm:ml-2">password123</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span><strong>Buyer:</strong> priya.buyer@example.com</span>
              <span className="sm:ml-2">password123</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span><strong>Seller:</strong> amit.seller@example.com</span>
              <span className="sm:ml-2">password123</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;