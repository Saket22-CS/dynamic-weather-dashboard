import { useState, useEffect } from 'react';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { WeatherDashboard } from '@/components/WeatherDashboard';

const Index = () => {
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem('openweather_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('openweather_api_key', key);
    setApiKey(key);
  };

  // If no API key, show the input form
  if (!apiKey) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  // Show the weather dashboard
  return <WeatherDashboard apiKey={apiKey} />;
};

export default Index;