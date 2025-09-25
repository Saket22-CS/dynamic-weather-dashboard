import { WeatherData, SearchLocation } from '@/types/weather';

const API_KEY = ''; // User will need to provide this
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export class WeatherService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    });
  }

  async searchLocations(query: string): Promise<SearchLocation[]> {
    try {
      const response = await fetch(
        `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data = await response.json();
      return data.map((item: any) => ({
        name: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon,
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      // Get current weather
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();

      // Get 5-day forecast
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }

      const forecastData = await forecastResponse.json();

      // Get air quality data
      let airQualityData = null;
      try {
        const aqResponse = await fetch(
          `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
        );
        if (aqResponse.ok) {
          airQualityData = await aqResponse.json();
        }
      } catch (error) {
        console.warn('Air quality data not available:', error);
      }

      // Transform data to our format
      return this.transformWeatherData(weatherData, forecastData, airQualityData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  private transformWeatherData(
    current: any,
    forecast: any,
    airQuality: any
  ): WeatherData {
    const now = new Date();
    const sunrise = new Date(current.sys.sunrise * 1000);
    const sunset = new Date(current.sys.sunset * 1000);
    const isDay = now >= sunrise && now <= sunset;

    // Group forecast by days
    const dailyForecasts = forecast.list.reduce((acc: any, item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    const forecastDays = Object.entries(dailyForecasts)
      .slice(0, 5)
      .map(([date, items]: [string, any]) => {
        const dayItems = items as any[];
        const temps = dayItems.map((item: any) => item.main.temp);
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);

        // Find the item closest to noon for representative conditions
        const noonItem = dayItems.find((item: any) => {
          const hour = new Date(item.dt * 1000).getHours();
          return hour >= 11 && hour <= 13;
        }) || dayItems[0];

        return {
          date,
          day: {
            maxTemp: Math.round(maxTemp),
            minTemp: Math.round(minTemp),
            condition: noonItem.weather[0].main,
            icon: noonItem.weather[0].icon,
            chanceOfRain: Math.round((noonItem.pop || 0) * 100),
            chanceOfSnow: noonItem.weather[0].main === 'Snow' ? Math.round((noonItem.pop || 0) * 100) : 0,
          },
          hour: dayItems.map((item: any) => ({
            time: new Date(item.dt * 1000).toISOString(),
            temp: Math.round(item.main.temp),
            condition: item.weather[0].main,
            icon: item.weather[0].icon,
            chanceOfRain: Math.round((item.pop || 0) * 100),
          })),
        };
      });

    return {
      location: {
        name: current.name,
        country: current.sys.country,
        lat: current.coord.lat,
        lon: current.coord.lon,
      },
      current: {
        temp: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: current.wind.deg,
        visibility: Math.round((current.visibility || 10000) / 1000), // Convert to km
        uvIndex: 0, // Not available in free tier
        condition: current.weather[0].main,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        isDay,
      },
      airQuality: airQuality ? {
        aqi: airQuality.list[0].main.aqi,
        co: airQuality.list[0].components.co,
        no2: airQuality.list[0].components.no2,
        o3: airQuality.list[0].components.o3,
        pm2_5: airQuality.list[0].components.pm2_5,
        pm10: airQuality.list[0].components.pm10,
      } : undefined,
      astronomy: {
        sunrise: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      forecast: forecastDays,
    };
  }
}

export const getWeatherCondition = (condition: string, isDay: boolean): string => {
  if (!isDay) return 'night';
  
  switch (condition.toLowerCase()) {
    case 'clear':
      return 'sunny';
    case 'clouds':
      return 'cloudy';
    case 'rain':
    case 'drizzle':
      return 'rainy';
    case 'snow':
      return 'snowy';
    case 'thunderstorm':
      return 'stormy';
    default:
      return 'cloudy';
  }
};