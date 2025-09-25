import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Moon,
  CloudDrizzle,
  Cloudy,
  Sunrise,
  Sunset,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherIconProps {
  condition: string;
  isDay?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export function WeatherIcon({ 
  condition, 
  isDay = true, 
  size = 'md', 
  animated = true,
  className 
}: WeatherIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const getIcon = () => {
    if (!isDay) {
      return <Moon className={cn(sizeClasses[size], animated && "animate-float", className)} />;
    }

    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className={cn(sizeClasses[size], animated && "animate-float", "text-yellow-500", className)} />;
      case 'clouds':
      case 'partly cloudy':
        return <Cloud className={cn(sizeClasses[size], animated && "animate-float", "text-gray-500", className)} />;
      case 'overcast':
        return <Cloudy className={cn(sizeClasses[size], animated && "animate-float", "text-gray-600", className)} />;
      case 'rain':
        return <CloudRain className={cn(sizeClasses[size], animated && "animate-float", "text-blue-500", className)} />;
      case 'drizzle':
        return <CloudDrizzle className={cn(sizeClasses[size], animated && "animate-float", "text-blue-400", className)} />;
      case 'snow':
        return <CloudSnow className={cn(sizeClasses[size], animated && "animate-float", "text-blue-200", className)} />;
      case 'thunderstorm':
        return <CloudLightning className={cn(sizeClasses[size], animated && "animate-float", "text-purple-500", className)} />;
      default:
        return <Sun className={cn(sizeClasses[size], animated && "animate-float", className)} />;
    }
  };

  return getIcon();
}

export function UtilityIcon({ type, size = 'sm', className }: { 
  type: 'sunrise' | 'sunset' | 'wind' | 'temperature' | 'humidity' | 'visibility' | 'pressure';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  switch (type) {
    case 'sunrise':
      return <Sunrise className={cn(sizeClasses[size], "text-orange-500", className)} />;
    case 'sunset':
      return <Sunset className={cn(sizeClasses[size], "text-orange-600", className)} />;
    case 'wind':
      return <Wind className={cn(sizeClasses[size], "text-blue-500", className)} />;
    case 'temperature':
      return <Thermometer className={cn(sizeClasses[size], "text-red-500", className)} />;
    case 'humidity':
      return <Droplets className={cn(sizeClasses[size], "text-blue-400", className)} />;
    case 'visibility':
      return <Eye className={cn(sizeClasses[size], "text-green-500", className)} />;
    case 'pressure':
      return <Gauge className={cn(sizeClasses[size], "text-purple-500", className)} />;
    default:
      return null;
  }
}