type WeatherCode = number;

type CurrentWeatherResult = {
  zip: string;
  city: string;
  state: string;
  temperatureF: number;
  condition: string;
  fetchedAt: string;
};

type CachedWeather = {
  expiresAt: number;
  value: CurrentWeatherResult;
};

const weatherCache = new Map<string, CachedWeather>();
const cacheTtlMs = 10 * 60 * 1000;

const weatherCodeLabels: Record<WeatherCode, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Cloudy',
  45: 'Fog',
  48: 'Freezing fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Light freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light rain showers',
  81: 'Rain showers',
  82: 'Heavy rain showers',
  85: 'Light snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail'
};

const getWeatherLabel = (code: number): string => {
  return weatherCodeLabels[code] ?? 'Current conditions';
};

const fetchJson = async <T>(url: string, timeoutMs: number): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Weather lookup failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

type GeocodeResult = {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    admin1?: string;
    country_code?: string;
  }>;
};

type ForecastResult = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

const lookupZipCoordinates = async (zip: string): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  state: string;
}> => {
  const geocodeUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}` +
    '&count=10&language=en&format=json&country_code=US';
  const geocode = await fetchJson<GeocodeResult>(geocodeUrl, 6000);
  const result = geocode.results?.find((entry) => entry.country_code === 'US');

  if (!result) {
    throw new Error('Could not find this ZIP code.');
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    city: result.name,
    state: result.admin1 ?? 'US'
  };
};

export const getCurrentWeatherByZip = async (zip: string): Promise<CurrentWeatherResult> => {
  const cached = weatherCache.get(zip);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const location = await lookupZipCoordinates(zip);
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
    `&longitude=${location.longitude}` +
    '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto';
  const forecast = await fetchJson<ForecastResult>(forecastUrl, 6000);

  const temperature = forecast.current?.temperature_2m;
  const weatherCode = forecast.current?.weather_code;

  if (typeof temperature !== 'number' || typeof weatherCode !== 'number') {
    throw new Error('Weather data is currently unavailable.');
  }

  const result: CurrentWeatherResult = {
    zip,
    city: location.city,
    state: location.state,
    temperatureF: Math.round(temperature),
    condition: getWeatherLabel(weatherCode),
    fetchedAt: new Date().toISOString()
  };

  weatherCache.set(zip, {
    value: result,
    expiresAt: now + cacheTtlMs
  });

  return result;
};
