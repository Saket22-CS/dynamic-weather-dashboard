export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    description: string;
    icon: string;
    isDay: boolean;
  };
  airQuality?: {
    aqi: number;
    co: number;
    no2: number;
    o3: number;
    pm2_5: number;
    pm10: number;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
  };
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  day: {
    maxTemp: number;
    minTemp: number;
    condition: string;
    icon: string;
    chanceOfRain: number;
    chanceOfSnow: number;
  };
  hour: HourlyForecast[];
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: string;
  chanceOfRain: number;
}

export interface SearchLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'night';