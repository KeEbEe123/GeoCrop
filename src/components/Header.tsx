import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Brain, LogOut, Package, ShoppingCart, Sprout, TrendingUp, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Header = () => {
  const { user, logout, setUser } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const getNavItems = () => {
    const baseItems = [{ path: '/', label: 'Home', icon: Sprout }];
    
    if (!user) {
      return [
        ...baseItems,
        { path: '/prediction', label: 'Crop Prediction', icon: Brain },
      ];
    }

    switch (user.role) {
      case 'farmer':
        return [
          ...baseItems,
          { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/crops', label: 'Sell Crops', icon: ShoppingCart },
          { path: '/products', label: 'Buy Inputs', icon: TrendingUp },
          { path: '/prediction', label: 'Crop Prediction', icon: Brain },
          { path: '/orders', label: 'Sales', icon: Package },
        ];
      case 'buyer':
        return [
          ...baseItems,
          { path: '/crops', label: 'Buy Crops', icon: ShoppingCart },
          { path: '/orders', label: 'My Orders', icon: Package },
        ];
      case 'seller':
        return [
          ...baseItems,
          { path: '/products', label: 'Sell Products', icon: TrendingUp },
          { path: '/orders', label: 'Sales', icon: Package },
        ];
      default:
        return baseItems;
    }
  };

  const handleLoginSuccess = (user: any) => {
    setUser(user);
    setShowLoginModal(false);
  };

  const handleRegisterSuccess = (user: any) => {
    setUser(user);
    setShowRegisterModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const navItems = getNavItems();

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">GeoCrop</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm">
                  <div className="font-medium text-foreground">{user.name}</div>
                  <div className="text-muted-foreground capitalize">{user.role}</div>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button size="sm" onClick={() => setShowRegisterModal(true)}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
      />
    </>
  );
};

export default Header;