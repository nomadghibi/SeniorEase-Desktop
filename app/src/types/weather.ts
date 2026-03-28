export type CurrentWeather = {
  zip: string;
  city: string;
  state: string;
  temperatureF: number;
  condition: string;
  fetchedAt: string;
};

export type CurrentWeatherResponse = {
  success: boolean;
  weather: CurrentWeather;
};
