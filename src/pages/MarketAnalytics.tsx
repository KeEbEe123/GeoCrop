import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMarketAnalytics } from '@/data/mockData';
import {
    AlertCircle,
    BarChart3,
    Calendar,
    IndianRupee,
    Info,
    MapPin,
    Target,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const MarketAnalytics = () => {
  const [selectedCrop, setSelectedCrop] = useState('Yellow Maize');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeframe, setTimeframe] = useState('6months');

  // Get analytics data for selected crop
  const analyticsData = mockMarketAnalytics.find(data => data.cropName === selectedCrop) || mockMarketAnalytics[0];

  // Generate additional market data for demonstration
  const demandSupplyData = [
    { month: 'Sep', demand: 85, supply: 92 },
    { month: 'Oct', demand: 88, supply: 85 },
    { month: 'Nov', demand: 92, supply: 88 },
    { month: 'Dec', demand: 95, supply: 90 },
    { month: 'Jan', demand: 78, supply: 95 },
    { month: 'Feb', demand: 82, supply: 88 }
  ];

  const regionalPriceData = [
    { region: 'Punjab', price: 28, change: +7.2, volume: 1200 },
    { region: 'Haryana', price: 26, change: +5.8, volume: 980 },
    { region: 'UP', price: 25, change: +4.1, volume: 1450 },
    { region: 'Rajasthan', price: 30, change: +8.9, volume: 760 },
    { region: 'MP', price: 27, change: +6.3, volume: 1100 },
    { region: 'Bihar', price: 24, change: +3.2, volume: 890 }
  ];

  const competitorAnalysis = [
    { name: 'Local Traders', marketShare: 35, avgPrice: 26, rating: 3.8 },
    { name: 'Cooperative Societies', marketShare: 28, avgPrice: 28, rating: 4.2 },
    { name: 'Direct Buyers', marketShare: 22, avgPrice: 30, rating: 4.5 },
    { name: 'Export Companies', marketShare: 15, avgPrice: 32, rating: 4.1 }
  ];

  const priceAlerts = [
    { crop: 'Wheat', currentPrice: 26, targetPrice: 30, trend: 'increasing', likelihood: 'high' },
    { crop: 'Rice', currentPrice: 45, targetPrice: 42, trend: 'decreasing', likelihood: 'medium' },
    { crop: 'Onion', currentPrice: 35, targetPrice: 40, trend: 'volatile', likelihood: 'low' }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Market Analytics</h1>
          <p className="text-xl text-muted-foreground">
            Real-time market insights and price trends for informed decision making
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yellow Maize">Yellow Maize</SelectItem>
              <SelectItem value="Wheat">Wheat</SelectItem>
              <SelectItem value="Rice">Rice</SelectItem>
              <SelectItem value="Onion">Onion</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="north">North India</SelectItem>
              <SelectItem value="south">South India</SelectItem>
              <SelectItem value="west">West India</SelectItem>
              <SelectItem value="east">East India</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">₹{analyticsData.currentPrice}/kg</p>
                  <p className={`text-xs flex items-center mt-1 ${
                    analyticsData.priceChange.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analyticsData.priceChange.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {analyticsData.priceChange.percentage > 0 ? '+' : ''}{analyticsData.priceChange.percentage}% from last month
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Demand Level</p>
                  <p className="text-2xl font-bold capitalize">{analyticsData.demandSupplyRatio > 1.2 ? 'High' : analyticsData.demandSupplyRatio > 0.8 ? 'Medium' : 'Low'}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    Ratio: {analyticsData.demandSupplyRatio.toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Region</p>
                  <p className="text-2xl font-bold">{analyticsData.topProducingRegions[0]?.region}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {analyticsData.topProducingRegions[0]?.marketShare}% market share
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quality Grade A</p>
                  <p className="text-2xl font-bold">{analyticsData.qualityDistribution[0]?.percentage}%</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Info className="w-3 h-3 mr-1" />
                    Premium quality
                  </p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="price-trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="price-trends">Price Trends</TabsTrigger>
            <TabsTrigger value="demand-supply">Demand & Supply</TabsTrigger>
            <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
            <TabsTrigger value="competition">Competition</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="price-trends" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Price History - {selectedCrop}</CardTitle>
                  <CardDescription>Historical price and volume trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={analyticsData.priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="price" orientation="left" />
                      <YAxis yAxisId="volume" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'price' ? `₹${value}` : `${value} kg`,
                          name === 'price' ? 'Price/kg' : 'Volume'
                        ]}
                      />
                      <Line yAxisId="price" type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} />
                      <Line yAxisId="volume" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Pattern</CardTitle>
                  <CardDescription>Average monthly prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.seasonalPattern}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Average Price']} />
                      <Bar dataKey="averagePrice" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
                <CardDescription>Market share by quality grade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.qualityDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                        label={({ grade, percentage }) => `Grade ${grade}: ${percentage}%`}
                      >
                        {analyticsData.qualityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {analyticsData.qualityDistribution.map((item, index) => (
                      <div key={item.grade} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">Grade {item.grade}</span>
                        </div>
                        <span className="text-2xl font-bold">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demand-supply" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demand vs Supply Analysis</CardTitle>
                <CardDescription>Market balance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={demandSupplyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="demand" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="supply" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Demand-Supply Ratio</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{analyticsData.demandSupplyRatio.toFixed(2)}</span>
                      <Badge className={analyticsData.demandSupplyRatio > 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {analyticsData.demandSupplyRatio > 1 ? 'High Demand' : 'Surplus'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Market Volatility</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Inventory Levels</span>
                    <Badge className="bg-blue-100 text-blue-800">Moderate</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Price Predictions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {priceAlerts.map((alert, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{alert.crop}</span>
                        <Badge className={
                          alert.likelihood === 'high' ? 'bg-green-100 text-green-800' :
                          alert.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {alert.likelihood} confidence
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current: ₹{alert.currentPrice} → Target: ₹{alert.targetPrice}
                      </div>
                      <div className="text-sm capitalize">Trend: {alert.trend}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Price Comparison</CardTitle>
                <CardDescription>Current prices across major agricultural regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalPriceData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{region.region}</h3>
                          <p className="text-sm text-muted-foreground">{region.volume} kg traded</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₹{region.price}/kg</div>
                        <div className={`text-sm flex items-center justify-end ${
                          region.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {region.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {region.change > 0 ? '+' : ''}{region.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Centers</CardTitle>
                <CardDescription>Major producing regions and their market share</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topProducingRegions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'production' ? `${value} tons` : `${value}%`,
                      name === 'production' ? 'Production' : 'Market Share'
                    ]} />
                    <Bar dataKey="production" fill="#10b981" />
                    <Bar dataKey="marketShare" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Players Analysis</CardTitle>
                <CardDescription>Competitive landscape and pricing strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitorAnalysis.map((competitor, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{competitor.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Market Share: {competitor.marketShare}%
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Avg Price: ₹{competitor.avgPrice}/kg
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < Math.floor(competitor.rating)
                                  ? 'bg-yellow-400'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm font-medium">{competitor.rating}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full"
                          style={{ width: `${competitor.marketShare}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Forecasts</CardTitle>
                  <CardDescription>Expected price movements for next 3 months</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Bullish Trend Expected</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Prices likely to increase by 8-12% in the next 2 months due to reduced supply and increased export demand.
                    </p>
                  </div>

                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Seasonal Impact</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Harvest season approaching in March may stabilize prices. Plan inventory accordingly.
                    </p>
                  </div>

                  <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800">Risk Factors</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Weather conditions and government policy changes may affect predictions. Monitor closely.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Opportunities</CardTitle>
                  <CardDescription>Emerging trends and opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Organic Demand Rising</h4>
                    <p className="text-sm text-muted-foreground">
                      25% increase in organic crop demand. Consider certification.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Export Opportunities</h4>
                    <p className="text-sm text-muted-foreground">
                      New trade agreements opening markets in Southeast Asia.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Value Addition</h4>
                    <p className="text-sm text-muted-foreground">
                      Processing facilities offering 15-20% premium for quality crops.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Direct Selling</h4>
                    <p className="text-sm text-muted-foreground">
                      Digital platforms enabling 30% higher margins than traditional channels.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketAnalytics;