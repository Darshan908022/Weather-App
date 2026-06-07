import { useState, useCallback } from 'react';
import { fetchWeatherByCity, fetchWeatherByCoords } from './services/weatherService';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ForecastStrip from './components/ForecastStrip';
import ComparePanel from './components/ComparePanel';
import styles from './App.module.css';

const TABS = [
  { id: 'single', label: 'Weather' },
  { id: 'compare', label: 'Compare' },
];

const SUGGESTED_CITIES = ['Chennai', 'Mumbai', 'London', 'New York', 'Tokyo', 'Dubai', 'Sydney'];

export default function App() {
  const [activeTab, setActiveTab] = useState('single');

  // Single city state
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compare state
  const [city1, setCity1] = useState(null);
  const [city2, setCity2] = useState(null);
  const [loadingC1, setLoadingC1] = useState(false);
  const [loadingC2, setLoadingC2] = useState(false);
  const [errorC1, setErrorC1] = useState('');
  const [errorC2, setErrorC2] = useState('');

  // ── Single city search ──────────────────────────────────────────────────────
  const handleSearch = useCallback(async (city) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherByCity(city);
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied.');
        setLoading(false);
      }
    );
  };

  // ── Compare city search ─────────────────────────────────────────────────────
  const handleSearchC1 = useCallback(async (city) => {
    setLoadingC1(true);
    setErrorC1('');
    try {
      const data = await fetchWeatherByCity(city);
      setCity1(data);
    } catch (err) {
      setErrorC1(err.message);
    } finally {
      setLoadingC1(false);
    }
  }, []);

  const handleSearchC2 = useCallback(async (city) => {
    setLoadingC2(true);
    setErrorC2('');
    try {
      const data = await fetchWeatherByCity(city);
      setCity2(data);
    } catch (err) {
      setErrorC2(err.message);
    } finally {
      setLoadingC2(false);
    }
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🌤</span>
          <span className={styles.brandName}>WeatherScope</span>
        </div>
        <nav className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        {/* ── SINGLE CITY TAB ───────────────────────────────────────── */}
        {activeTab === 'single' && (
          <div className={styles.singleView}>
            <div className={styles.searchRow}>
              <SearchBar onSearch={handleSearch} loading={loading} placeholder="Enter a city name..." />
              <button className={styles.geoBtn} onClick={handleGeolocate} title="Use my location" disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="8" strokeOpacity=".3" />
                </svg>
              </button>
            </div>

            {error && <p className={styles.error}>⚠️ {error}</p>}

            {!weather && !loading && !error && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🌍</div>
                <p className={styles.emptyTitle}>Search any city worldwide</p>
                <p className={styles.emptySubtitle}>Get real-time weather, forecasts & more</p>
                <div className={styles.suggestions}>
                  {SUGGESTED_CITIES.map((c) => (
                    <button key={c} className={styles.suggestion} onClick={() => handleSearch(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && <div className={styles.loadingBar} />}

            {weather && !loading && (
              <div className={styles.weatherLayout}>
                <WeatherCard data={weather} accentColor="var(--accent)" />
                <ForecastStrip forecast={weather.forecast} />
              </div>
            )}
          </div>
        )}

        {/* ── COMPARE TAB ───────────────────────────────────────────── */}
        {activeTab === 'compare' && (
          <div className={styles.compareView}>
            <div className={styles.compareInputs}>
              <div className={styles.compareInputGroup}>
                <p className={styles.compareLabel} style={{ color: 'var(--accent)' }}>City 1</p>
                <SearchBar onSearch={handleSearchC1} loading={loadingC1} placeholder="First city..." />
                {errorC1 && <p className={styles.errorSmall}>⚠️ {errorC1}</p>}
                {city1 && <MiniCard data={city1} color="var(--accent)" />}
              </div>

              <div className={styles.compareVsDivider}>
                <span>VS</span>
              </div>

              <div className={styles.compareInputGroup}>
                <p className={styles.compareLabel} style={{ color: '#c084fc' }}>City 2</p>
                <SearchBar onSearch={handleSearchC2} loading={loadingC2} placeholder="Second city..." />
                {errorC2 && <p className={styles.errorSmall}>⚠️ {errorC2}</p>}
                {city2 && <MiniCard data={city2} color="#c084fc" />}
              </div>
            </div>

            {!city1 && !city2 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⚖️</div>
                <p className={styles.emptyTitle}>Compare any two cities</p>
                <p className={styles.emptySubtitle}>Temperature, humidity, wind, and more — side by side</p>
              </div>
            )}

            {city1 && city2 && (
              <ComparePanel city1Data={city1} city2Data={city2} />
            )}

            {((city1 && !city2) || (!city1 && city2)) && (
              <p className={styles.compareHint}>
                ← Search the {city1 ? 'second' : 'first'} city to see comparison
              </p>
            )}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Powered by <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a> · Built by Darshan S</p>
      </footer>
    </div>
  );
}

// Mini card shown in compare view after a city is searched
function MiniCard({ data, color }) {
  const w = data.current.weather[0];
  return (
    <div className={styles.miniCard} style={{ borderColor: color }}>
      <span style={{ fontSize: 22 }}>
        <img
          src={`https://openweathermap.org/img/wn/${w.icon}.png`}
          alt={w.description}
          width={32}
          height={32}
          style={{ verticalAlign: 'middle' }}
        />
      </span>
      <div>
        <p className={styles.miniCity}>{data.cityName}, {data.country}</p>
        <p className={styles.miniDesc}>{Math.round(data.current.main.temp)}°C · {w.description}</p>
      </div>
    </div>
  );
}
