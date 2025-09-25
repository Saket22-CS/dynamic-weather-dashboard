import { useState, useEffect } from 'react';
import { WeatherService, getWeatherCondition } from '@/services/weatherService';
import { WeatherData, SearchLocation } from '@/types/weather';
import { WeatherIcon, UtilityIcon } from './WeatherIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from './theme-provider';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  RefreshCw, 
  Sun, 
  Moon,
  Navigation,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherDashboardProps {
  apiKey: string;
}

export function WeatherDashboard({ apiKey }: WeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [weatherService] = useState(() => new WeatherService(apiKey));
  const [currentCondition, setCurrentCondition] = useState('sunny');
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentLocationWeather();
  }, []);

  useEffect(() => {
    if (weatherData) {
      const condition = getWeatherCondition(
        weatherData.current.condition,
        weatherData.current.isDay
      );
      setCurrentCondition(condition);
      
      // Update body class for background
      document.body.className = document.body.className.replace(
        /weather-bg-\w+/g,
        ''
      );
      document.body.classList.add(`weather-bg-${condition}`);
    }
  }, [weatherData]);

  const loadCurrentLocationWeather = async () => {
    try {
      setLoading(true);
      const location = await weatherService.getCurrentLocation();
      const data = await weatherService.getWeatherData(location.lat, location.lon);
      setWeatherData(data);
      
      // Cache the location
      localStorage.setItem('lastLocation', JSON.stringify(location));
      
      toast({
        title: "Location found!",
        description: `Weather loaded for ${data.location.name}`,
      });
    } catch (error) {
      console.error('Error loading weather:', error);
      
      // Try to load from cache
      const cachedLocation = localStorage.getItem('lastLocation');
      if (cachedLocation) {
        try {
          const location = JSON.parse(cachedLocation);
          const data = await weatherService.getWeatherData(location.lat, location.lon);
          setWeatherData(data);
          
          toast({
            title: "Using cached location",
            description: `Weather loaded for ${data.location.name}`,
          });
        } catch (cacheError) {
          toast({
            title: "Error",
            description: "Unable to load weather data. Please search for a city.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Location access denied",
          description: "Please search for a city to view weather.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await weatherService.searchLocations(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results",
          description: "No cities found matching your search.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search for cities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = async (location: SearchLocation) => {
    try {
      setLoading(true);
      setSearchResults([]);
      setSearchQuery('');
      
      const data = await weatherService.getWeatherData(location.lat, location.lon);
      setWeatherData(data);
      
      // Cache the location
      localStorage.setItem('lastLocation', JSON.stringify({
        lat: location.lat,
        lon: location.lon
      }));
      
      toast({
        title: "Location updated!",
        description: `Weather loaded for ${data.location.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to load weather for this location.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshWeather = async () => {
    if (!weatherData) return;
    
    try {
      setLoading(true);
      const data = await weatherService.getWeatherData(
        weatherData.location.lat,
        weatherData.location.lon
      );
      setWeatherData(data);
      
      toast({
        title: "Weather updated!",
        description: "Latest weather data loaded.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh weather data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAQILevel = (aqi: number) => {
    switch (aqi) {
      case 1: return { label: 'Good', color: 'bg-green-500' };
      case 2: return { label: 'Fair', color: 'bg-yellow-500' };
      case 3: return { label: 'Moderate', color: 'bg-orange-500' };
      case 4: return { label: 'Poor', color: 'bg-red-500' };
      case 5: return { label: 'Very Poor', color: 'bg-purple-500' };
      default: return { label: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg font-medium">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-1000">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <WeatherIcon 
                condition={weatherData?.current.condition || 'clear'} 
                isDay={weatherData?.current.isDay ?? true}
                size="md" 
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Weather Dashboard</h1>
              <p className="text-muted-foreground">Real-time weather information</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="glass-card"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWeather}
              disabled={loading}
              className="glass-card"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </header>

        {/* Search */}
        <Card className="glass-card animate-fade-in">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search for a city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isSearching} variant="secondary">
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => selectLocation(location)}
                      className="w-full text-left p-3 hover:bg-accent transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{location.name}, {location.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {weatherData && (
          <>
            {/* Current Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Weather Card */}
              <Card className="lg:col-span-2 glass-card animate-scale-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {weatherData.location.name}, {weatherData.location.country}
                      </CardTitle>
                      <p className="text-muted-foreground capitalize">
                        {weatherData.current.description}
                      </p>
                    </div>
                    <WeatherIcon 
                      condition={weatherData.current.condition}
                      isDay={weatherData.current.isDay}
                      size="xl"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Temperature Display */}
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">
                        {weatherData.current.temp}°C
                      </div>
                      <p className="text-muted-foreground">
                        Feels like {weatherData.current.feelsLike}°C
                      </p>
                    </div>
                    
                    {/* Weather Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <UtilityIcon type="humidity" className="mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Humidity</p>
                        <p className="font-semibold">{weatherData.current.humidity}%</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <UtilityIcon type="wind" className="mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Wind</p>
                        <p className="font-semibold">{weatherData.current.windSpeed} km/h</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <UtilityIcon type="visibility" className="mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Visibility</p>
                        <p className="font-semibold">{weatherData.current.visibility} km</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <UtilityIcon type="pressure" className="mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Pressure</p>
                        <p className="font-semibold">{weatherData.current.pressure} hPa</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Side Info Cards */}
              <div className="space-y-4">
                {/* Sun Times */}
                <Card className="glass-card animate-slide-in">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Sun Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtilityIcon type="sunrise" />
                        <span className="text-sm">Sunrise</span>
                      </div>
                      <span className="font-semibold">{weatherData.astronomy.sunrise}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtilityIcon type="sunset" />
                        <span className="text-sm">Sunset</span>
                      </div>
                      <span className="font-semibold">{weatherData.astronomy.sunset}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Air Quality */}
                {weatherData.airQuality && (
                  <Card className="glass-card animate-slide-in">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        Air Quality
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AQI Level</span>
                          <Badge 
                            className={cn(
                              "text-white",
                              getAQILevel(weatherData.airQuality.aqi).color
                            )}
                          >
                            {getAQILevel(weatherData.airQuality.aqi).label}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>PM2.5</span>
                            <span>{weatherData.airQuality.pm2_5.toFixed(1)} μg/m³</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PM10</span>
                            <span>{weatherData.airQuality.pm10.toFixed(1)} μg/m³</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* 5-Day Forecast */}
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  5-Day Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {weatherData.forecast.map((day, index) => (
                    <div 
                      key={day.date} 
                      className="text-center p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <p className="text-sm font-medium mb-2">
                        {index === 0 ? 'Today' : formatDate(day.date)}
                      </p>
                      <WeatherIcon 
                        condition={day.day.condition}
                        size="lg"
                        className="mx-auto mb-2"
                      />
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {day.day.maxTemp}° / {day.day.minTemp}°
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {day.day.condition}
                        </p>
                        {day.day.chanceOfRain > 0 && (
                          <div className="flex items-center justify-center gap-1 text-xs text-blue-500">
                            <UtilityIcon type="humidity" />
                            <span>{day.day.chanceOfRain}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}