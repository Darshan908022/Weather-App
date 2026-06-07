import { getDailyForecast, formatDay, getWeatherIconUrl } from '../services/weatherService';
import styles from './ForecastStrip.module.css';

export default function ForecastStrip({ forecast, accentColor = 'var(--accent)' }) {
  const days = getDailyForecast(forecast);

  return (
    <div className={styles.strip}>
      <p className={styles.label}>5-Day Forecast</p>
      <div className={styles.days}>
        {days.map((day, i) => (
          <div key={day.dt} className={styles.day} style={{ animationDelay: `${i * 60}ms` }}>
            <p className={styles.dayName}>{i === 0 ? 'Today' : formatDay(day.dt)}</p>
            <img
              src={getWeatherIconUrl(day.weather.icon, '2x')}
              alt={day.weather.description}
              className={styles.icon}
            />
            <p className={styles.desc}>{day.weather.main}</p>
            <div className={styles.temps}>
              <span className={styles.high}>{Math.round(day.temp_max)}°</span>
              <span className={styles.low}>{Math.round(day.temp_min)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
