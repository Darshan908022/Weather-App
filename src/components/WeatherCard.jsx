import { getWeatherIconUrl, formatTime, getWindDirection } from '../services/weatherService';
import styles from './WeatherCard.module.css';

const StatItem = ({ icon, label, value }) => (
  <div className={styles.stat}>
    <span className={styles.statIcon} aria-hidden="true">{icon}</span>
    <div>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  </div>
);

export default function WeatherCard({ data, accentColor = 'var(--accent)' }) {
  const { current } = data;
  const weather = current.weather[0];
  const isDay = current.dt > current.sys.sunrise && current.dt < current.sys.sunset;

  const feelsLikeDiff = Math.round(current.main.feels_like - current.main.temp);
  const feelsLikeNote = feelsLikeDiff > 2 ? 'warmer' : feelsLikeDiff < -2 ? 'cooler' : 'same';

  return (
    <div className={styles.card} style={{ '--card-accent': accentColor }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.city}>{data.cityName}</h2>
          <p className={styles.country}>{data.country} · {weather.description}</p>
        </div>
        <img
          src={getWeatherIconUrl(weather.icon)}
          alt={weather.description}
          className={styles.weatherIcon}
        />
      </div>

      {/* Temperature */}
      <div className={styles.tempBlock}>
        <span className={styles.temp}>{Math.round(current.main.temp)}°</span>
        <div className={styles.tempMeta}>
          <span className={styles.feelsLike}>
            Feels {Math.round(current.main.feels_like)}° — {feelsLikeNote}
          </span>
          <span className={styles.highLow}>
            H: {Math.round(current.main.temp_max)}° · L: {Math.round(current.main.temp_min)}°
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        <StatItem icon="💧" label="Humidity" value={`${current.main.humidity}%`} />
        <StatItem icon="💨" label="Wind" value={`${Math.round(current.wind.speed)} m/s ${getWindDirection(current.wind.deg || 0)}`} />
        <StatItem icon="🌡️" label="Pressure" value={`${current.main.pressure} hPa`} />
        <StatItem icon="👁️" label="Visibility" value={`${(current.visibility / 1000).toFixed(1)} km`} />
        <StatItem icon="🌅" label="Sunrise" value={formatTime(current.sys.sunrise, current.timezone)} />
        <StatItem icon="🌇" label="Sunset" value={formatTime(current.sys.sunset, current.timezone)} />
      </div>
    </div>
  );
}
