import { getWeatherIconUrl } from '../services/weatherService';
import styles from './ComparePanel.module.css';

const METRICS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
  { key: 'feels_like', label: 'Feels Like', unit: '°C', icon: '🤔' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: '💧' },
  { key: 'wind_speed', label: 'Wind Speed', unit: ' m/s', icon: '💨' },
  { key: 'pressure', label: 'Pressure', unit: ' hPa', icon: '📊' },
  { key: 'visibility', label: 'Visibility', unit: ' km', icon: '👁️' },
  { key: 'clouds', label: 'Cloud Cover', unit: '%', icon: '☁️' },
];

function extractMetrics(weatherData) {
  const c = weatherData.current;
  return {
    temperature: Math.round(c.main.temp),
    feels_like: Math.round(c.main.feels_like),
    humidity: c.main.humidity,
    wind_speed: Math.round(c.wind.speed * 10) / 10,
    pressure: c.main.pressure,
    visibility: Math.round((c.visibility / 1000) * 10) / 10,
    clouds: c.clouds?.all ?? 0,
  };
}

function DiffBadge({ val1, val2, unit, betterWhen }) {
  const diff = val1 - val2;
  if (Math.abs(diff) < 0.5) return <span className={styles.tie}>Tied</span>;

  const label = diff > 0 ? `+${Math.abs(diff).toFixed(1)}${unit}` : `-${Math.abs(diff).toFixed(1)}${unit}`;
  return <span className={styles.diff}>{label}</span>;
}

function BarComparison({ val1, val2, max }) {
  const pct1 = Math.min((val1 / max) * 100, 100);
  const pct2 = Math.min((val2 / max) * 100, 100);
  const winner = val1 > val2 ? 1 : val1 < val2 ? 2 : 0;

  return (
    <div className={styles.bars}>
      <div className={styles.barWrap}>
        <div
          className={`${styles.bar} ${styles.bar1} ${winner === 1 ? styles.barWinner : ''}`}
          style={{ width: `${pct1}%` }}
        />
      </div>
      <div className={styles.barWrap}>
        <div
          className={`${styles.bar} ${styles.bar2} ${winner === 2 ? styles.barWinner : ''}`}
          style={{ width: `${pct2}%` }}
        />
      </div>
    </div>
  );
}

const MAX_VALUES = {
  temperature: 50,
  feels_like: 50,
  humidity: 100,
  wind_speed: 30,
  pressure: 1050,
  visibility: 20,
  clouds: 100,
};

export default function ComparePanel({ city1Data, city2Data }) {
  const m1 = extractMetrics(city1Data);
  const m2 = extractMetrics(city2Data);

  const w1 = city1Data.current.weather[0];
  const w2 = city2Data.current.weather[0];

  return (
    <div className={styles.panel}>
      {/* Header row */}
      <div className={styles.header}>
        <p className={styles.sectionLabel}>Weather Comparison</p>
        <div className={styles.cityHeaders}>
          <div className={styles.cityHeaderItem} style={{ borderColor: 'var(--accent)' }}>
            <img src={getWeatherIconUrl(w1.icon)} alt="" width="40" height="40" />
            <div>
              <p className={styles.cityName}>{city1Data.cityName}</p>
              <p className={styles.cityCountry}>{city1Data.country}</p>
            </div>
          </div>
          <div className={styles.vsTag}>VS</div>
          <div className={styles.cityHeaderItem} style={{ borderColor: '#c084fc' }}>
            <img src={getWeatherIconUrl(w2.icon)} alt="" width="40" height="40" />
            <div>
              <p className={styles.cityName}>{city2Data.cityName}</p>
              <p className={styles.cityCountry}>{city2Data.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics rows */}
      <div className={styles.metrics}>
        {METRICS.map((metric, i) => {
          const v1 = m1[metric.key];
          const v2 = m2[metric.key];
          const diff = Math.abs(v1 - v2);
          const winner = v1 > v2 ? 1 : v1 < v2 ? 2 : 0;

          return (
            <div key={metric.key} className={styles.row} style={{ animationDelay: `${i * 50}ms` }}>
              <div className={styles.metricLabel}>
                <span className={styles.metricIcon}>{metric.icon}</span>
                <span>{metric.label}</span>
              </div>

              <div className={styles.comparison}>
                <span className={`${styles.value} ${winner === 1 ? styles.valueWinner : ''}`}>
                  {v1}{metric.unit}
                </span>

                <div className={styles.barArea}>
                  <BarComparison val1={v1} val2={v2} max={MAX_VALUES[metric.key]} />
                  {diff >= 0.5 && (
                    <span className={styles.diffLabel}>
                      Δ {diff.toFixed(1)}{metric.unit}
                    </span>
                  )}
                </div>

                <span className={`${styles.value} ${styles.valueRight} ${winner === 2 ? styles.valueWinner2 : ''}`}>
                  {v2}{metric.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <ComparisonSummary city1Data={city1Data} city2Data={city2Data} m1={m1} m2={m2} />
    </div>
  );
}

function ComparisonSummary({ city1Data, city2Data, m1, m2 }) {
  const tempDiff = m1.temperature - m2.temperature;
  const warmerCity = tempDiff > 0 ? city1Data.cityName : tempDiff < 0 ? city2Data.cityName : null;
  const tempDiffAbs = Math.abs(tempDiff).toFixed(1);

  const humDiff = m1.humidity - m2.humidity;
  const humiderCity = humDiff > 0 ? city1Data.cityName : humDiff < 0 ? city2Data.cityName : null;

  const windDiff = m1.wind_speed - m2.wind_speed;
  const windierCity = windDiff > 0 ? city1Data.cityName : windDiff < 0 ? city2Data.cityName : null;

  return (
    <div className={styles.summary}>
      <p className={styles.summaryTitle}>Quick Summary</p>
      <ul className={styles.summaryList}>
        {warmerCity ? (
          <li>🌡️ <strong>{warmerCity}</strong> is {tempDiffAbs}°C warmer</li>
        ) : (
          <li>🌡️ Both cities have the same temperature</li>
        )}
        {humiderCity && Math.abs(humDiff) >= 5 ? (
          <li>💧 <strong>{humiderCity}</strong> is more humid by {Math.abs(humDiff)}%</li>
        ) : (
          <li>💧 Humidity levels are similar</li>
        )}
        {windierCity && Math.abs(windDiff) >= 1 ? (
          <li>💨 <strong>{windierCity}</strong> has stronger winds</li>
        ) : (
          <li>💨 Wind speeds are similar</li>
        )}
        <li>
          ☁️ {city1Data.cityName}: <em>{city1Data.current.weather[0].description}</em>
          {' '}vs {city2Data.cityName}: <em>{city2Data.current.weather[0].description}</em>
        </li>
      </ul>
    </div>
  );
}
