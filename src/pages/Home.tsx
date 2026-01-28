import heroImage from '@/assets/hero-agriculture.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, MapPin, ShoppingCart, Sprout, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: ShoppingCart,
      title: 'Crop Marketplace',
      description: 'Buy and sell crops directly from farmers to buyers',
      link: '/crops',
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      title: 'Input Marketplace',
      description: 'Purchase seeds, fertilizers, and farming supplies',
      link: '/products',
      color: 'text-blue-600'
    },
    {
      icon: Sprout,
      title: 'Crop Prediction',
      description: 'AI-powered recommendations for optimal crop selection',
      link: '/prediction',
      color: 'text-yellow-600'
    }
  ];

  const stats = [
    { icon: Users, label: 'Active Farmers', value: '1,200+' },
    { icon: ShoppingCart, label: 'Crops Listed', value: '850+' },
    { icon: BarChart3, label: 'Successful Orders', value: '5,600+' },
    { icon: MapPin, label: 'Locations Covered', value: '120+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Smart Agriculture
            <span className="block text-accent">Marketplace</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Connecting farmers, buyers, and sellers in a modern agricultural ecosystem
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to={user.role === 'seller' ? '/products' : '/crops'}>
                <Button size="lg" className="text-lg px-8 py-6">
                  Explore Marketplace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources for modern agriculture
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-natural transition-all duration-300 cursor-pointer">
                  <Link to={feature.link}>
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-earth rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className={`w-8 h-8 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-2xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-earth">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Welcome Section */}
      {user && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl">Welcome back, {user.name}!</CardTitle>
                <CardDescription className="text-lg">
                  You're logged in as a <span className="capitalize font-semibold text-primary">{user.role}</span> from {user.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user.role === 'farmer' && (
                    <>
                      <Link to="/crops">
                        <Button className="w-full sm:w-auto">Sell Crops</Button>
                      </Link>
                      <Link to="/products">
                        <Button variant="outline" className="w-full sm:w-auto">Buy Inputs</Button>
                      </Link>
                      <Link to="/prediction">
                        <Button variant="outline" className="w-full sm:w-auto">Get Predictions</Button>
                      </Link>
                      <Link to="/orders">
                        <Button variant="outline" className="w-full sm:w-auto">Sales</Button>
                      </Link>
                    </>
                  )}
                  {user.role === 'buyer' && (
                    <>
                      <Link to="/crops">
                        <Button className="w-full sm:w-auto">Buy Crops</Button>
                      </Link>
                      <Link to="/orders">
                        <Button variant="outline" className="w-full sm:w-auto">My Orders</Button>
                      </Link>
                    </>
                  )}
                  {user.role === 'seller' && (
                    <>
                      <Link to="/products">
                        <Button className="w-full sm:w-auto">Sell Products</Button>
                      </Link>
                      <Link to="/orders">
                        <Button variant="outline" className="w-full sm:w-auto">Sales</Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;