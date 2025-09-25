import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export function ApiKeyInput({ onApiKeySubmit }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 weather-bg-sunny">
      <Card className="w-full max-w-md glass-card animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Weather Dashboard</CardTitle>
          <CardDescription>
            Enter your OpenWeatherMap API key to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
              Start Weather Dashboard
            </Button>
          </form>
          
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              Don't have an API key?
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://openweathermap.org/api', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Free API Key
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Your API key is stored locally and never shared.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}