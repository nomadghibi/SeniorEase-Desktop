import type { CurrentWeatherResponse } from '@/types/weather';

const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

export const fetchCurrentWeather = async (
  zip: string,
  signal?: AbortSignal
): Promise<CurrentWeatherResponse['weather']> => {
  const response = await fetch(
    `${bridgeBaseUrl}/weather/current?zip=${encodeURIComponent(zip)}`,
    {
      method: 'GET',
      signal
    }
  );

  if (!response.ok) {
    throw new Error(`Weather fetch failed with status ${response.status}`);
  }

  const payload = (await response.json()) as CurrentWeatherResponse;
  return payload.weather;
};
