import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart3, Brain, LogOut, Menu, Package, ShoppingCart, Sprout, TrendingUp, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Header = () => {
  const { user, logout, setUser } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          { path: '/seller-dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/products', label: 'Manage Products', icon: TrendingUp },
          { path: '/orders', label: 'Orders', icon: Package },
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  const MobileNavItem = ({ item }: { item: { path: string; label: string; icon: any } }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <Link 
        key={item.path} 
        to={item.path} 
        onClick={closeMobileMenu}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'hover:bg-accent hover:text-accent-foreground active:scale-95'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

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

          {/* Desktop Navigation */}
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

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader className="pb-4">
                  <SheetTitle className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold text-primary">GeoCrop</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-1">
                  {/* Mobile Navigation Items */}
                  {navItems.map((item) => (
                    <MobileNavItem key={item.path} item={item} />
                  ))}
                  
                  {/* Mobile Auth Section */}
                  <div className="pt-6 mt-6 border-t space-y-4">
                    {user ? (
                      <>
                        <div className="px-4 py-3 bg-accent/20 rounded-lg border">
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => {
                            logout();
                            closeMobileMenu();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start" 
                          onClick={() => {
                            setShowLoginModal(true);
                            closeMobileMenu();
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            setShowRegisterModal(true);
                            closeMobileMenu();
                          }}
                        >
                          Register
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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