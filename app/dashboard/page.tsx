'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Truck, Warehouse, TrendingUp, ArrowLeftRight, PackageX, TrendingDown, Clock, AlertCircle, CheckCircle2, Activity, BarChart3, Thermometer, Droplets, Wind, CloudRain, Sun, CloudSun, Moon, CloudMoon, Cloud } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface WarehouseActivity {
  date: string;
  productName: string;
  warehouseName: string;
  quantity: number;
  type: string;
}

interface DashboardStats {
  products: {
    total: number;
    daily: Array<{ date: string; count: number }>;
    trend: number;
    addedToday: number;
    addedYesterday: number;
    addedThisWeek: number;
  };
  deliveries: {
    total: number;
    byStatus: Record<string, number>;
    daily: Array<{ date: string; count: number }>;
  };
  couriers: {
    total: number;
    active: number;
    daily: Array<{ date: string; count: number }>;
    byStatus: Record<string, number>;
    totalDeliveries: number;
    averageCapacity: number;
  };
  warehouse: {
    total: number;
    byStatus: Record<string, number>;
    utilization: Array<{ name: string; utilization: number }>;
    totalWarehouses: number;
    totalStocks: number;
    stocksByWarehouse: Array<{ name: string; quantity: number }>;
    warehouseGrowth: Array<{ date: string; count: number }>;
    recentActivities: WarehouseActivity[];
    movementStats: {
      totalAssignments: number;
      totalTransfers: number;
      totalRemovals: number;
    };
  };
}

// Add these helper functions before the DashboardPage component
const calculateTotalStocks = (warehouses: any[]) => {
  return warehouses.reduce((total, warehouse) => {
    const warehouseStocks = warehouse.stocks || [];
    const stocksTotal = warehouseStocks.reduce((sum: number, stock: any) => {
      return sum + (stock.quantity || 0);
    }, 0);
    return total + stocksTotal;
  }, 0);
};

const processStocksByWarehouse = (warehouses: any[]) => {
  return warehouses.map(warehouse => ({
    name: warehouse.name,
    quantity: (warehouse.stocks || []).reduce((sum: number, stock: any) => 
      sum + (stock.quantity || 0), 0
    )
  }));
};

// Fix warehouse utilization calculation
const processWarehouseUtilization = (warehouses: any[]) => {
  return warehouses.map(warehouse => {
    const totalStock = (warehouse.stocks || []).reduce((sum: number, stock: any) => 
      sum + (stock.quantity || 0), 0
    );
    const capacity = warehouse.capacity || 100;
    const utilization = (totalStock / capacity) * 100;
    return {
      name: warehouse.name,
      utilization: Math.min(utilization, 100) // Cap at 100%
    };
  });
};

// Add this function after the imports
const inspectDatabase = async (supabase: any) => {
  console.log('🔍 Starting Database Inspection');

  try {
    // Check Couriers Table First
    const { data: couriersInfo, error: couriersError } = await supabase
      .from('courier')  // Try 'courier' table
      .select('*')
      .limit(1);

    if (couriersError || !couriersInfo) {
      // If 'courier' fails, try 'couriers'
      const { data: couriersInfo2, error: couriersError2 } = await supabase
        .from('couriers')
        .select('*')
        .limit(1);
      
      console.log('🚚 Couriers Table Structure:', 
        couriersInfo2 ? Object.keys(couriersInfo2[0] || {}) : 'No data',
        'Error:', couriersError2,
        'Raw Data:', couriersInfo2
      );
    } else {
      console.log('🚚 Couriers Table Structure:', 
        Object.keys(couriersInfo[0] || {}),
        'Raw Data:', couriersInfo
      );
    }

    // Check Warehouses Table
    const { data: warehousesInfo, error: warehousesError } = await supabase
      .from('warehouses')
      .select('*')
      .limit(1);
    console.log('📦 Warehouses Table Structure:', 
      warehousesInfo ? Object.keys(warehousesInfo[0] || {}) : 'No data',
      'Error:', warehousesError
    );

    // Check Warehouse Inventory Table
    const { data: inventoryInfo, error: inventoryError } = await supabase
      .from('warehouse_inventory')
      .select('*')
      .limit(1);
    console.log('📋 Warehouse Inventory Table Structure:', 
      inventoryInfo ? Object.keys(inventoryInfo[0] || {}) : 'No data',
      'Error:', inventoryError
    );

    // Check Stock/Inventory Movements Table
    const { data: movementsInfo, error: movementsError } = await supabase
      .from('inventory_movements')
      .select('*')
      .limit(1);
    console.log('🔄 Movements Table Structure:', 
      movementsInfo ? Object.keys(movementsInfo[0] || {}) : 'No data',
      'Error:', movementsError
    );

    // Check Products Table
    const { data: productsInfo, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    console.log('📦 Products Table Structure:', 
      productsInfo ? Object.keys(productsInfo[0] || {}) : 'No data',
      'Error:', productsError
    );

    // Check Clients Table
    const { data: clientsInfo, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    console.log('👥 Clients Table Structure:', 
      clientsInfo ? Object.keys(clientsInfo[0] || {}) : 'No data',
      'Error:', clientsError
    );

    // Try alternative table names
    const alternativeTables = [
      'warehouse_stocks',
      'stock_movements',
      'stock_inventory',
      'warehouses_inventory',
      'movements'
    ];

    for (const table of alternativeTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      if (data) {
        console.log(`✅ Found alternative table ${table}:`, Object.keys(data[0] || {}));
      }
    }

  } catch (error) {
    console.error('❌ Database inspection error:', error);
  }
};

// Update AnimatedBackground for a more sophisticated AI look
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute -z-10 h-full w-full bg-gradient-to-br from-gray-50 to-white">
      {/* Neural network pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute h-full w-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>
      
      {/* Primary gradient blobs with advanced animations */}
      <div 
        className="absolute top-0 left-0 -z-10 h-[800px] w-[800px] rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/10 blur-[120px] animate-pulse-slow" 
        style={{ animationDuration: '25s' }} 
      />
      <div 
        className="absolute bottom-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-violet-500/15 to-purple-500/10 blur-[100px] animate-pulse-slow" 
        style={{ animationDuration: '30s', animationDelay: '2s' }} 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[900px] w-[900px] rounded-full bg-gradient-to-b from-cyan-500/10 to-blue-400/5 blur-[130px] animate-pulse-slow" 
        style={{ animationDuration: '35s', animationDelay: '4s' }} 
      />
      
      {/* Digital circuit pattern overlay */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-[0.03] mix-blend-overlay"></div>
      
      {/* Floating data particles */}
      <div className="absolute inset-0 -z-5 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} 
            className="absolute h-1 w-1 rounded-full bg-blue-600 animate-float-slow" 
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 5}s`
            }} 
          />
        ))}
      </div>
      
      {/* AI scanning beam effect */}
      <div className="absolute inset-x-0 top-0 h-[500px] overflow-hidden opacity-20">
        <div className="h-[50px] w-full bg-gradient-to-b from-blue-500/50 via-blue-500/0 to-transparent translate-y-full animate-scan" style={{ animationDuration: '10s', animationIterationCount: 'infinite' }}></div>
      </div>
      
      {/* Advanced glass effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-white/90 to-transparent backdrop-blur-[1px]"></div>
    </div>
  </div>
);

// Update the WeatherData interface to include daily forecast data
interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
    is_day: number;
  };
  current_units: {
    temperature_2m: string;
    precipitation: string;
    wind_speed_10m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
}

// Add a new location object at the top of locations array for current location
const weatherLocations = [
  { name: "Current Location", lat: null, long: null },
  { name: "Berlin", lat: 52.52, long: 13.41 },
  { name: "London", lat: 51.51, long: -0.13 },
  { name: "New York", lat: 40.71, long: -74.01 },
  { name: "Tokyo", lat: 35.68, long: 139.69 },
  { name: "Sydney", lat: -33.87, long: 151.21 }
];

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(weatherLocations[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'forecast'>('current');
  const [userCoordinates, setUserCoordinates] = useState<{lat: number | null, long: number | null}>({ lat: null, long: null });
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'granted' | 'denied' | 'unavailable'>('detecting');

  // Get user's geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLong = position.coords.longitude;
          setUserCoordinates({ lat: userLat, long: userLong });
          
          // Update the Current Location in weatherLocations array
          const updatedLocation = { ...selectedLocation, lat: userLat, long: userLong };
          setSelectedLocation(updatedLocation);
          setLocationStatus('granted');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus('denied');
          // If geolocation fails, default to first predefined location
          setSelectedLocation(weatherLocations[1]);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      setLocationStatus('unavailable');
      // If geolocation not supported, default to first predefined location
      setSelectedLocation(weatherLocations[1]);
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Don't fetch if coordinates are not available yet (for Current Location)
        if (selectedLocation.name === "Current Location" && 
            (userCoordinates.lat === null || userCoordinates.long === null)) {
          // Still waiting for coordinates, don't fetch yet
          return;
        }
        
        setLoading(true);
        setError(null);
        
        // Use either selected location coordinates or user coordinates for Current Location
        const latitude = selectedLocation.name === "Current Location" 
          ? userCoordinates.lat 
          : selectedLocation.lat;
        
        const longitude = selectedLocation.name === "Current Location" 
          ? userCoordinates.long 
          : selectedLocation.long;
        
        console.log('Fetching weather for:', selectedLocation.name, 
          'at coordinates:', latitude, longitude);
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,precipitation_probability&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        setWeather(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    // Fetch weather when coordinates are ready or location changes
    if (selectedLocation.name !== "Current Location" || 
        (userCoordinates.lat !== null && userCoordinates.long !== null)) {
      fetchWeather();
    }
  }, [selectedLocation, userCoordinates]);

  const handleLocationChange = (location: typeof weatherLocations[0]) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
  };

  // Add back the getWeatherIcon function that was removed
  const getWeatherIcon = (code: number, isDay: number) => {
    // WMO Weather interpretation codes (WW)
    // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    if (code === 0) { // Clear sky
      return isDay ? <Sun className="h-8 w-8 text-yellow-500" /> : <Moon className="h-8 w-8 text-blue-300" />;
    } else if (code <= 3) { // Partly cloudy
      return isDay ? <CloudSun className="h-8 w-8 text-yellow-500" /> : <CloudMoon className="h-8 w-8 text-blue-300" />;
    } else if (code <= 49) { // Foggy/cloudy
      return <Cloud className="h-8 w-8 text-gray-400" />;
    } else if (code <= 69) { // Drizzle/rain
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (code <= 79) { // Snow
      return <CloudRain className="h-8 w-8 text-blue-200" />;
    } else { // Thunderstorm/heavy weather
      return <CloudRain className="h-8 w-8 text-purple-500" />;
    }
  };

  // Get the next 3 days forecast from hourly data
  const getNextDaysForecast = () => {
    if (!weather?.hourly || !weather.hourly.time || !weather.hourly.temperature_2m || !weather.hourly.weather_code) {
      return [];
    }
    
    const forecast = [];
    const now = new Date();
    const currentDay = now.getDate();
    
    // Get data for next 3 days
    for (let day = 1; day <= 3; day++) {
      const forecastDate = new Date();
      forecastDate.setDate(currentDay + day);
      const dateString = forecastDate.toISOString().split('T')[0];
      
      // Find noon time index for this date (around 12:00)
      const noonTimeIndex = weather.hourly.time.findIndex(time => 
        time.startsWith(dateString) && time.includes('T12:00')
      );
      
      if (noonTimeIndex !== -1 && noonTimeIndex < weather.hourly.temperature_2m.length) {
        forecast.push({
          date: forecastDate,
          temp: weather.hourly.temperature_2m[noonTimeIndex] || 0,
          weatherCode: weather.hourly.weather_code[noonTimeIndex] || 0,
          // Use optional chaining and nullish coalescing to handle potential undefined values
          precipProb: weather.hourly.precipitation_probability?.[noonTimeIndex] ?? 0
        });
      }
    }
    
    return forecast;
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  // Simplified weather card when API fails
  const renderFallbackWeatherCard = () => {
    const locationDisplay = selectedLocation.name === "Current Location" && locationStatus === 'granted'
      ? "Current Location"
      : selectedLocation.name;
      
    return (
      <div className="p-4 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CloudSun className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold">--°C</h3>
              <p className="text-sm text-gray-500">Weather unavailable</p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {locationDisplay}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg py-1 z-20 min-w-[150px]">
                {weatherLocations.map((location) => (
                  <button
                    key={location.name}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedLocation.name === location.name ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                    onClick={() => handleLocationChange(location)}
                    disabled={location.name === "Current Location" && locationStatus === 'denied'}
                  >
                    {location.name}
                    {location.name === "Current Location" && locationStatus === 'denied' && 
                      " (unavailable)"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            onClick={() => {
              setLoading(true);
              if (selectedLocation.name === "Current Location") {
                // Re-request geolocation
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserCoordinates({ 
                      lat: position.coords.latitude, 
                      long: position.coords.longitude 
                    });
                    setLocationStatus('granted');
                  },
                  (error) => {
                    console.error("Geolocation error:", error);
                    setLocationStatus('denied');
                    setLoading(false);
                  }
                );
              }
            }}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  };

  // Show location detecting state
  if (selectedLocation.name === "Current Location" && locationStatus === 'detecting') {
    return (
      <div className="flex items-center justify-center p-4 h-full min-h-[160px]">
        <div className="text-center">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Detecting location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Weather widget error:', error);
    return renderFallbackWeatherCard();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 h-full min-h-[160px]">
        <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!weather || !weather.current) {
    console.error('Weather data missing or invalid:', weather);
    return renderFallbackWeatherCard();
  }

  // Display location name - for current location, show "Current Location"
  const locationDisplay = selectedLocation.name === "Current Location" 
    ? "Current Location" 
    : selectedLocation.name;

  const forecast = getNextDaysForecast();

  return (
    <div className="p-4 flex flex-col h-full justify-between">
      {/* Header with location and tabs */}
      <div className="flex items-center justify-between mb-2">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {locationDisplay}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg py-1 z-20 min-w-[150px]">
              {weatherLocations.map((location) => (
                <button
                  key={location.name}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    selectedLocation.name === location.name ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => handleLocationChange(location)}
                  disabled={location.name === "Current Location" && locationStatus === 'denied'}
                >
                  {location.name}
                  {location.name === "Current Location" && locationStatus === 'denied' && 
                    " (unavailable)"}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button 
            className={`px-3 py-1 text-xs font-medium ${viewMode === 'current' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
            onClick={() => setViewMode('current')}
          >
            Current
          </button>
          <button 
            className={`px-3 py-1 text-xs font-medium ${viewMode === 'forecast' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
            onClick={() => setViewMode('forecast')}
          >
            Forecast
          </button>
        </div>
      </div>

      {viewMode === 'current' ? (
        <>
          {/* Current weather display */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              {getWeatherIcon(weather.current.weather_code, weather.current.is_day)}
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{weather.current.temperature_2m}°{weather.current_units.temperature_2m}</h3>
                <p className="text-sm text-gray-500">Feels like {weather.current.apparent_temperature}°</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Current</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm">{weather.current.relative_humidity_2m}% Humidity</span>
            </div>
            <div className="flex items-center">
              <Wind className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm">{weather.current.wind_speed_10m} {weather.current_units.wind_speed_10m}</span>
            </div>
            {weather.current.precipitation > 0 && (
              <div className="flex items-center">
                <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">{weather.current.precipitation} {weather.current_units.precipitation}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 3-day forecast display */}
          <div className="flex justify-between mt-3">
            {forecast.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-xs font-medium text-gray-600 mb-1">{formatDay(day.date)}</span>
                <div className="mb-1">
                  {getWeatherIcon(day.weatherCode, 1)}
                </div>
                <span className="text-sm font-bold">{Math.round(day.temp)}°</span>
                <div className="flex items-center mt-1">
                  <Droplets className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs">{day.precipProb}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">3-Day Forecast</p>
          </div>
        </>
      )}
    </div>
  );
};

// Enhance LiveClock component with a more advanced design
const LiveClock = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  
  useEffect(() => {
    // Set initial time
    updateTime();
    
    // Update time every second
    const interval = setInterval(() => {
      updateTime();
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);
  
  const updateTime = () => {
    const now = new Date();
    
    // Format time: HH:MM:SS AM/PM
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Format date: Day of Week, Month Day, Year
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    setTime(timeString);
    setDate(dateString);
  };
  
  return (
    <div className="flex flex-col items-end">
      <div className="text-2xl font-bold relative overflow-hidden bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        <span className="relative z-10">{time}</span>
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/50 to-indigo-500/50 animate-pulse-slow"></span>
      </div>
      <div className="text-sm text-gray-600 italic">
        {date}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    products: { 
      total: 0, 
      daily: [], 
      trend: 0, 
      addedToday: 0, 
      addedYesterday: 0, 
      addedThisWeek: 0 
    },
    deliveries: { 
      total: 0, 
      byStatus: {}, 
      daily: [] 
    },
    couriers: {
      total: 0,
      active: 0,
      daily: [],
      byStatus: {},
      totalDeliveries: 0,
      averageCapacity: 0
    },
    warehouse: {
      total: 0,
      byStatus: {},
      utilization: [],
      totalWarehouses: 0,
      totalStocks: 0,
      stocksByWarehouse: [],
      warehouseGrowth: [],
      recentActivities: [],
      movementStats: {
        totalAssignments: 0,
        totalTransfers: 0,
        totalRemovals: 0
      }
    }
  });
  const supabase = createClientComponentClient();

  // Enhanced client authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      try {
        const userData = JSON.parse(currentUser);
        if (!userData.id) {
          router.push('/auth/login');
          return;
        }

        // Verify client exists in database
        const { data: clientCheck, error } = await supabase
          .from('clients')
          .select('id, company')
          .eq('id', userData.id)
          .single();

        if (error || !clientCheck) {
          console.error('Client verification failed:', error);
          localStorage.removeItem('currentUser');
          router.push('/auth/login');
          return;
        }

        setClientData(userData);
        
        // Load cached dashboard data if available
        const cachedStats = localStorage.getItem(`dashboard_stats_${userData.id}`);
        if (cachedStats) {
          try {
            const parsedStats = JSON.parse(cachedStats);
            setStats(parsedStats);
          } catch (e) {
            console.error('Error parsing cached stats:', e);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, supabase]);

  // Update the useEffect to call inspectDatabase
  useEffect(() => {
    if (clientData?.id) {
      console.log('🔑 Client ID:', clientData.id);
      inspectDatabase(supabase).then(() => {
        fetchDashboardData();
      });
    }
  }, [clientData?.id]);

  const fetchDashboardData = async () => {
    if (!clientData?.id) return;
    setLoading(true);

    try {
      // First verify the client exists and log current user
      const currentUser = localStorage.getItem('currentUser');
      const userData = JSON.parse(currentUser || '{}');
      console.log('🔍 Current User Data:', userData);
      console.log('🔑 Fetching data for client ID:', clientData.id);

      // Get couriers with detailed logging
      console.log('🔍 Attempting to fetch couriers for client:', clientData.id);
      const { data: couriersData, error: couriersError } = await supabase
        .from('couriers')  // Changed from 'courier' to 'couriers'
        .select('*')
        .eq('client_id', clientData.id);

      // Log raw courier data for debugging
      console.log('📊 Raw Couriers Data:', couriersData);

      if (couriersError) {
        console.error('❌ Couriers fetch error:', couriersError);
        toast.error('Error fetching couriers: ' + couriersError.message);
        throw couriersError;
      }

      // Ensure we have the couriers array and log the count
      const clientCouriers = couriersData || [];
      console.log(`📊 Found ${clientCouriers.length} couriers for client ${clientData.id}`);
      
      // Calculate courier statistics
      const courierStats = {
        total: clientCouriers.length,
        active: clientCouriers.filter(c => c.status === 'active').length,
        daily: processDaily(clientCouriers, 'created_at'),
        byStatus: clientCouriers.reduce((acc: Record<string, number>, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {}),
        totalDeliveries: clientCouriers.reduce((sum, c) => sum + (Number(c.deliveries_completed) || 0), 0),
        averageCapacity: Math.round(clientCouriers.reduce((sum, c) => sum + (Number(c.max_capacity) || 0), 0) / clientCouriers.length) || 0
      };

      // Log processed courier stats
      console.log('📈 Processed Courier Stats:', {
        totalCouriers: courierStats.total,
        activeCouriers: courierStats.active,
        deliveriesCompleted: courierStats.totalDeliveries,
        avgCapacity: courierStats.averageCapacity,
        statusBreakdown: courierStats.byStatus
      });

      // Get warehouses with their inventory movements
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select(`
          *,
          inventory_movements (*)
        `)
        .eq('client_id', clientData.id);

      if (warehousesError) {
        console.error('Warehouse fetch error:', warehousesError);
        throw warehousesError;
      }

      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('client_id', clientData.id);

      if (productsError) {
        console.error('Products fetch error:', productsError);
        throw productsError;
      }

      // Get deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('client_id', clientData.id);

      if (deliveriesError) {
        console.error('Deliveries fetch error:', deliveriesError);
        throw deliveriesError;
      }

      // Ensure we have arrays even if data is null
      const warehouses = warehousesData || [];
      const products = productsData || [];
      const deliveries = deliveriesData || [];
      const couriers = clientCouriers;

      // Log courier data for debugging
      console.log('Raw courier data:', {
        total: couriers.length,
        data: couriers,
        statuses: Array.from(new Set(couriers.map(c => c.status))),
        activeCount: couriers.filter(c => c.status === 'active').length
      });

      // Calculate daily stats for products with proper aggregation
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

      // Process courier daily stats
      const courierDaily = processDaily(couriers, 'created_at');
      console.log('Processed courier daily stats:', courierDaily);

      // Create new stats object with aggregated data
      const newStats: DashboardStats = {
        products: {
          total: products.length,
          daily: processDaily(products, 'created_at'),
          trend: calculateTrend(
            products.filter(p => p.created_at?.startsWith(today)).length,
            products.filter(p => p.created_at?.startsWith(yesterday)).length
          ),
          addedToday: products.filter(p => p.created_at?.startsWith(today)).length,
          addedYesterday: products.filter(p => p.created_at?.startsWith(yesterday)).length,
          addedThisWeek: products.filter(p => {
            const date = new Date(p.created_at);
            return date >= new Date(weekAgo);
          }).length
        },
        deliveries: {
          total: deliveries.length,
          byStatus: deliveries.reduce((acc: Record<string, number>, d) => {
            acc[d.status] = (acc[d.status] || 0) + 1;
            return acc;
          }, {}),
          daily: processDaily(deliveries, 'created_at')
        },
        couriers: {
          total: couriers.length,
          active: couriers.filter(c => c.status === 'active').length,
          daily: courierDaily,
          byStatus: courierStats.byStatus,
          totalDeliveries: courierStats.totalDeliveries,
          averageCapacity: courierStats.averageCapacity
        },
        warehouse: {
          total: warehouses.length,
          byStatus: warehouses.reduce((acc: Record<string, number>, w) => {
            acc[w.status] = (acc[w.status] || 0) + 1;
            return acc;
          }, {}),
          utilization: warehouses.map(w => ({
            name: w.name,
            utilization: (w.products / w.capacity) * 100
          })),
          totalWarehouses: warehouses.length,
          totalStocks: warehouses.reduce((sum, w) => sum + (w.products || 0), 0),
          stocksByWarehouse: warehouses.map(w => ({
            name: w.name,
            quantity: w.products || 0
          })),
          warehouseGrowth: processDaily(warehouses, 'created_at'),
          recentActivities: warehouses
            .flatMap(w => (w.inventory_movements || [])
              .map((m: any) => ({
                date: new Date(m.timestamp).toLocaleDateString(),
                productName: products.find(p => p.id === m.product_id)?.name || 'Unknown Product',
                warehouseName: w.name,
                quantity: m.quantity,
                type: m.movement_type
              })))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10),
          movementStats: {
            totalAssignments: warehouses.reduce((sum, w) => 
              sum + (w.inventory_movements || []).filter((m: any) => m.movement_type === 'in').length, 0),
            totalTransfers: warehouses.reduce((sum, w) => 
              sum + (w.inventory_movements || []).filter((m: any) => m.movement_type === 'transfer').length, 0),
            totalRemovals: warehouses.reduce((sum, w) => 
              sum + (w.inventory_movements || []).filter((m: any) => m.movement_type === 'out').length, 0)
          }
        }
      };

      console.log('Final courier stats:', newStats.couriers);

      setStats(newStats);
      setLoading(false);

      // Cache the dashboard data
      localStorage.setItem(`dashboard_stats_${clientData.id}`, JSON.stringify(newStats));

    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Helper function to calculate trend
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Helper function to process daily data - updated to aggregate counts by date
  const processDaily = (data: any[], dateField: string) => {
    if (!data || data.length === 0) return [];

    // Get the latest date from the data
    const latestDate = new Date(Math.max(...data.map(item => new Date(item[dateField]).getTime())));
    
    // Generate last 7 days relative to the latest date
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    // Aggregate counts by day
    const countsByDay = data.reduce((acc: Record<string, number>, item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Map to the required format with aggregated counts
    return last7Days.map(date => ({
      date,
      count: countsByDay[date] || 0
    }));
  };

  // Setup real-time subscriptions with enhanced error handling
  useEffect(() => {
    if (!clientData?.id) return;

    let retryCount = 0;
    const maxRetries = 3;
    
    const setupSubscription = () => {
      try {
        const channel = supabase.channel(`client-${clientData.id}-dashboard`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'deliveries',
              filter: `client_id=eq.${clientData.id}`
            },
            () => fetchDashboardData()
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'warehouses',
              filter: `client_id=eq.${clientData.id}`
            },
            () => fetchDashboardData()
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'products',
              filter: `client_id=eq.${clientData.id}`
            },
            () => fetchDashboardData()
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'stock_movements',
              filter: `client_id=eq.${clientData.id}`
            },
            () => fetchDashboardData()
          )
          .subscribe((status) => {
            console.log(`Subscription status for client ${clientData.id}:`, status);
            if (status === 'SUBSCRIBED') {
              fetchDashboardData();
            }
          });

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('Subscription error:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(setupSubscription, 1000 * retryCount);
        }
      }
    };

    return setupSubscription();
  }, [clientData?.id]);

  // Show loading or authentication states
  if (!clientData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
          <Button onClick={() => router.push('/auth/login')}>Log In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const groupByDay = (data: any[]) => {
    return data.reduce((acc: any, item) => {
      const date = new Date(item.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  };

  const countByStatus = (data: any[]) => {
    return data.reduce((acc: any, item) => {
      const status = item.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  };

  const processWarehouseGrowth = (data: any[]) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const warehousesByDay = data.reduce((acc: any, warehouse) => {
      const date = new Date(warehouse.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return last7Days.map(date => ({
      date,
      count: warehousesByDay[date] || 0
    }));
  };

  const calculateTrends = (data: any[], field: string) => {
    if (!data || data.length < 2) return 0;
    const latest = data[0][field];
    const previous = data[1][field];
    return previous ? ((latest - previous) / previous) * 100 : 0;
  };

  const getActivityStatus = (activity: WarehouseActivity) => {
    switch(activity.type) {
      case 'in': return { color: 'bg-green-500', label: 'Assignment' };
      case 'out': return { color: 'bg-red-500', label: 'Removal' };
      case 'transfer': return { color: 'bg-blue-500', label: 'Transfer' };
      default: return { color: 'bg-gray-500', label: 'Unknown' };
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50/30 relative overflow-hidden pb-12">
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Dashboard Header */}
      <header className="w-full backdrop-blur-md bg-white/60 sticky top-0 z-50 border-b border-white/20 mb-8 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative">
              Dashboard Overview
              <span className="absolute bottom-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-blue-600 to-transparent"></span>
            </h1>
            <p className="text-gray-600 mt-1 flex items-center">
              <Activity className="h-3 w-3 text-blue-500 mr-2 animate-pulse" />
              Monitor your logistics operations in real-time
            </p>
          </div>
          <div className="flex items-center gap-6">
            <LiveClock />
            <Button 
              onClick={() => fetchDashboardData()}
              className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center gap-2 relative z-10">
                <Activity className="h-4 w-4" />
                <span>Refresh Data</span>
              </div>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* AI Insights Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800">AI-Powered Insights</h3>
              <p className="text-sm text-blue-600">Your logistics network is operating at 87% efficiency. Warehouse #3 could be optimized to improve capacity.</p>
            </div>
          </div>
        </div>
        
        {/* Main Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden group">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">Total Deliveries</CardTitle>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
                  <Package className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900 flex items-baseline">
                  {stats.deliveries.total}
                  <span className="ml-2 text-xs font-normal px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md">+5%</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Completed: {stats.deliveries.byStatus.completed || 0}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">On-Time Rate</span>
                    <span className="text-green-600 font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      95%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative overflow-hidden group">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">Warehouse Capacity</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white shadow-lg shadow-purple-500/20">
                  <Warehouse className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900 flex items-baseline">
                  {stats.warehouse.totalWarehouses} Units
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center">
                  <Package className="h-3 w-3 mr-1 text-purple-500" />
                  {stats.warehouse.totalStocks} Items Stored
                </div>
                <div className="mt-4">
                  <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 relative overflow-hidden" 
                      style={{ width: `${Math.round(stats.warehouse.utilization[0]?.utilization || 0)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">Utilization</span>
                    <span className="text-purple-700 font-medium flex items-center">
                      <span className="mr-1">{Math.round(stats.warehouse.utilization[0]?.utilization || 0)}%</span>
                      {Math.round(stats.warehouse.utilization[0]?.utilization || 0) < 50 ? 
                        <TrendingDown className="h-3 w-3 text-yellow-500" /> : 
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative overflow-hidden group">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700">Products</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg text-white shadow-lg shadow-green-500/20">
                  <Package className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900 flex items-baseline">
                  {stats.products.total}
                  <span className="ml-2 text-xs font-normal px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md">+{stats.products.addedToday}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-green-500" />
                  Added this week: {stats.products.addedThisWeek}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stock Health</span>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-green-600 font-medium">Good</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weather Widget */}
          <div className="relative overflow-hidden group">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">Weather</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
                  <CloudSun className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <WeatherWidget />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Section with enhanced styling */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          {/* Delivery Trends */}
          <div className="relative overflow-hidden group">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Delivery Performance
                      <span className="ml-2 flex items-center text-xs font-normal px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                        AI Enhanced
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      Track delivery efficiency with predictive trends
                    </CardDescription>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.deliveries.daily}>
                      <defs>
                        <linearGradient id="deliveryGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="deliveryPredictedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        stroke="#6B7280"
                        axisLine={{ stroke: '#E5E7EB' }}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        axisLine={{ stroke: '#E5E7EB' }}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`${value} deliveries`, 'Volume']}
                        labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString(undefined, { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric' 
                        })}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#4F46E5" 
                        strokeWidth={2}
                        dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4, strokeDasharray: '' }}
                        activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2, filter: 'url(#glow)' }}
                        name="Actual"
                        fill="url(#deliveryGradient)"
                      />
                      
                      {/* AI Predicted trend line */}
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#22C55E" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                        connectNulls={true}
                        name="AI Prediction"
                        // Shift data points for prediction line
                        data={[
                          ...stats.deliveries.daily.slice(-4), 
                          { date: '2023-04-14', count: Math.round(stats.deliveries.daily.slice(-1)[0]?.count * 1.15) },
                          { date: '2023-04-15', count: Math.round(stats.deliveries.daily.slice(-1)[0]?.count * 1.25) },
                          { date: '2023-04-16', count: Math.round(stats.deliveries.daily.slice(-1)[0]?.count * 1.35) }
                        ]}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ color: value === 'Actual' ? '#4F46E5' : '#22C55E', fontSize: '12px' }}>{value}</span>
                        )}
                      />
                      
                      {/* Reference line for targets */}
                      <ReferenceLine 
                        y={2} 
                        stroke="#F59E0B" 
                        strokeDasharray="3 3" 
                        label={{ 
                          value: 'Target', 
                          position: 'right',
                          fill: '#F59E0B',
                          fontSize: 10
                        }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* AI Analytics Insights */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></div>
                      <span className="text-xs text-gray-600">AI Analysis:</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">15% growth predicted next week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warehouse Activity */}
          <div className="relative overflow-hidden group">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                      Warehouse Activity
                      <span className="ml-2 flex items-center text-xs font-normal px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                        AI Enhanced
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-purple-500" />
                      Real-time utilization with anomaly detection
                    </CardDescription>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-50">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.warehouse.warehouseGrowth}>
                      <defs>
                        <linearGradient id="warehouseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                          <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" 
                            style={{ stroke: '#EC4899', strokeWidth: 1, opacity: 0.5 }} />
                        </pattern>
                        <filter id="warehouseGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        stroke="#6B7280"
                        axisLine={{ stroke: '#E5E7EB' }}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        axisLine={{ stroke: '#E5E7EB' }}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`${value} activities`, 'Volume']}
                        labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString(undefined, { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric' 
                        })}`}
                      />
                      <Bar 
                        dataKey="count" 
                        name="Activity"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      >
                        {stats.warehouse.warehouseGrowth.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === stats.warehouse.warehouseGrowth.length - 1 ? 'url(#warehouseGradient)' : 'url(#warehouseGradient)'} 
                            filter={index === stats.warehouse.warehouseGrowth.length - 1 ? 'url(#warehouseGlow)' : undefined}
                          />
                        ))}
                      </Bar>
                      
                      {/* AI Anomaly Detection Point */}
                      <Bar 
                        dataKey="anomaly" 
                        fill="url(#diagonalHatch)" 
                        radius={[4, 4, 0, 0]} 
                        name="Anomaly Detected"
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ color: value === 'Activity' ? '#8B5CF6' : '#EC4899', fontSize: '12px' }}>{value}</span>
                        )}
                      />
                      
                      {/* Capacity threshold line */}
                      <ReferenceLine 
                        y={1.5} 
                        stroke="#EC4899" 
                        strokeDasharray="3 3" 
                        label={{ 
                          value: 'Capacity', 
                          position: 'right',
                          fill: '#EC4899',
                          fontSize: 10
                        }} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* AI Analytics Insights */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-600 mr-2 animate-pulse"></div>
                      <span className="text-xs text-gray-600">AI Insight:</span>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">Anomaly detected on Apr 9th</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Distribution Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {/* Delivery Status - Enhanced with AI-driven analytics */}
          <div className="relative overflow-hidden group">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Delivery Status
                      <span className="ml-2 flex items-center text-xs font-normal px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                        AI Enhanced
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-blue-500" />
                      Current delivery status distribution with trend analysis
                    </CardDescription>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50 relative">
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6}/>
                        </linearGradient>
                        <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6}/>
                        </linearGradient>
                        <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22C55E" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#22C55E" stopOpacity={0.6}/>
                        </linearGradient>
                        <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6}/>
                        </linearGradient>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
                        </filter>
                      </defs>
                      <Pie
                        data={[
                          { name: 'Pending', value: stats.deliveries.byStatus.pending || 0, status: 'pending' },
                          { name: 'In Progress', value: stats.deliveries.byStatus.in_progress || 0, status: 'in_progress' },
                          { name: 'Completed', value: stats.deliveries.byStatus.completed || 0, status: 'completed' },
                          { name: 'Failed', value: stats.deliveries.byStatus.failed || 0, status: 'failed' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={0}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats.deliveries.byStatus && Object.keys(stats.deliveries.byStatus).map((entry, index) => {
                          let fill;
                          switch(entry) {
                            case 'pending': fill = "url(#pendingGradient)"; break;
                            case 'in_progress': fill = "url(#inProgressGradient)"; break;
                            case 'completed': fill = "url(#completedGradient)"; break;
                            case 'failed': fill = "url(#failedGradient)"; break;
                            default: fill = COLORS[index % COLORS.length];
                          }
                          return <Cell key={`cell-${index}`} fill={fill} filter="url(#shadow)" />;
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          `${value} deliveries (${(Number(value) / (stats.deliveries.total || 1) * 100).toFixed(1)}%)`, 
                          name
                        ]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* AI Analytics Insights */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></div>
                      <span className="text-xs text-gray-600">AI Insight:</span>
                    </div>
                    <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Completion rates improved by 12% this week
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity - Enhanced with AI-driven analysis */}
          <div className="relative overflow-hidden group lg:col-span-2">
            <Card className="border-0 glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-600" />
                      Recent Activity
                      <span className="ml-2 flex items-center text-xs font-normal px-1.5 py-0.5 bg-green-50 text-green-600 rounded">
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                        AI Monitored
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 flex items-center">
                      <ArrowLeftRight className="h-3 w-3 mr-1 text-green-500" />
                      Latest logistics operations with intelligent pattern detection
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                      <ArrowLeftRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                      <PackageX className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {/* Fix the Recent Activity layout with a completely restructured layout to prevent overlapping */}
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats.warehouse.recentActivities.slice(0, 5).map((activity, index) => {
                    const status = getActivityStatus(activity);
                    const isNew = index === 0;
                    const isAnomaly = index === 2; // Mark one as anomaly for demonstration
                    return (
                      <div key={index} className={`p-4 rounded-xl transition-all duration-200 ${isNew ? 'bg-gradient-to-r from-green-50/50 to-transparent border border-green-100' : 'bg-gray-50/80 hover:bg-gray-50'}`}>
                        <div className="flex items-center mb-2">
                          <div className={`w-2 h-8 rounded-full ${status.color} mr-3`}>
                            {isNew && (
                              <span className="absolute -mt-1 -ml-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <p className="text-base font-medium text-gray-800 truncate mr-2">
                                {activity.productName}
                              </p>
                              {isNew && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  New
                                </Badge>
                              )}
                              {isAnomaly && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Unusual pattern
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-2 shrink-0">
                            <div className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 flex items-center whitespace-nowrap">
                              <Package className="h-3 w-3 mr-1" />
                              {activity.quantity} units
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-5 text-sm text-gray-600">
                          <span className="font-medium mr-2">{status.label}</span>
                          <span>at {activity.warehouseName}</span>
                          <div className="ml-auto flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* AI Activity Analysis */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-600 mr-2 animate-pulse"></div>
                      <span className="text-xs text-gray-600">AI Observation:</span>
                    </div>
                    <span className="text-xs font-medium bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      Product "bbq" has high movement frequency
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 