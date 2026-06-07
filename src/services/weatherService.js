// ─── Weather Service ────────────────────────────────────────────────────────
// Uses OpenWeatherMap free API (api.openweathermap.org)
// Sign up at https://openweathermap.org/api to get a free API key
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// ⚠️  Replace with your API key from openweathermap.org (free tier works!)
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_API_KEY_HERE';

/**
 * Fetch current weather + 5-day/3-hour forecast for a city name
 * @param {string} city - city name (e.g. "Chennai", "London")
 * @returns {{ current, forecast, cityName, country, coords }}
 */
export async function fetchWeatherByCity(city) {
  if (!city.trim()) throw new Error('Please enter a city name');

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`),
    fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`),
  ]);

  if (!currentRes.ok) {
    if (currentRes.status === 401) throw new Error('Invalid API key — check your VITE_WEATHER_API_KEY');
    if (currentRes.status === 404) throw new Error(`City "${city}" not found`);
    throw new Error(`API error: ${currentRes.status}`);
  }

  const [current, forecastData] = await Promise.all([
    currentRes.json(),
    forecastRes.json(),
  ]);

  return {
    current,
    forecast: forecastData.list,
    cityName: current.name,
    country: current.sys.country,
    coords: { lat: current.coord.lat, lon: current.coord.lon },
  };
}

/**
 * Fetch weather by coordinates (for geolocation)
 */
export async function fetchWeatherByCoords(lat, lon) {
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
  ]);

  if (!currentRes.ok) {
    if (currentRes.status === 401) throw new Error('Invalid API key');
    throw new Error(`API error: ${currentRes.status}`);
  }

  const [current, forecastData] = await Promise.all([
    currentRes.json(),
    forecastRes.json(),
  ]);

  return {
    current,
    forecast: forecastData.list,
    cityName: current.name,
    country: current.sys.country,
    coords: { lat, lon },
  };
}

/**
 * Get icon URL from OpenWeatherMap icon code
 */
export function getWeatherIconUrl(iconCode, size = '2x') {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}

/**
 * Convert Unix timestamp to readable time string
 */
export function formatTime(unix, timezone = 0) {
  const date = new Date((unix + timezone) * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/**
 * Convert Unix timestamp to weekday
 */
export function formatDay(unix) {
  return new Date(unix * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Group forecast list into daily summaries (take midday reading or first of day)
 */
export function getDailyForecast(forecastList) {
  const days = {};
  forecastList.forEach((item) => {
    const day = new Date(item.dt * 1000).toDateString();
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });

  return Object.entries(days)
    .slice(0, 5)
    .map(([, items]) => {
      const midday = items.find((i) => new Date(i.dt * 1000).getHours() === 12) || items[0];
      return {
        dt: midday.dt,
        temp: midday.main.temp,
        temp_min: Math.min(...items.map((i) => i.main.temp_min)),
        temp_max: Math.max(...items.map((i) => i.main.temp_max)),
        weather: midday.weather[0],
        humidity: midday.main.humidity,
        wind: midday.wind.speed,
      };
    });
}

/**
 * Get wind direction string from degrees
 */
export function getWindDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Get UV index label
 */
export function getUVLabel(uv) {
  if (uv <= 2) return { label: 'Low', color: '#4ade80' };
  if (uv <= 5) return { label: 'Moderate', color: '#fbbf24' };
  if (uv <= 7) return { label: 'High', color: '#fb923c' };
  if (uv <= 10) return { label: 'Very High', color: '#f87171' };
  return { label: 'Extreme', color: '#e879f9' };
}
