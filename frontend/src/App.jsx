import React, { useEffect, useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import {
  Sprout,
  LayoutDashboard,
  Activity,
  Droplets,
  History,
  CloudSun,
  SlidersHorizontal,
  Menu,
  X,
  RefreshCw,
  Wifi,
  ChevronRight,
  Power,
  Thermometer,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Save,
  ShieldCheck,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const PUMP_THRESHOLD = 40;

const nav = [
  ["/", "Overview", LayoutDashboard],
  ["/live", "Live Monitor", Activity],
  ["/irrigation", "Irrigation", Droplets],
  ["/history", "Sensor History", History],
  ["/weather", "Weather Insight", CloudSun],
  ["/settings", "Settings", SlidersHorizontal],
];

const DEMO_READINGS = [
  { id: 1, moisture: 20, pump_on: 1, source: "demo", created_at: "Sample 1" },
  { id: 2, moisture: 28, pump_on: 1, source: "demo", created_at: "Sample 2" },
  { id: 3, moisture: 35, pump_on: 1, source: "demo", created_at: "Sample 3" },
  { id: 4, moisture: 45, pump_on: 0, source: "demo", created_at: "Sample 4" },
  { id: 5, moisture: 60, pump_on: 0, source: "demo", created_at: "Sample 5" },
];

function getPumpStatus(reading) {
  if (!reading || reading.moisture == null) {
    return null;
  }

  return Number(reading.moisture) <= PUMP_THRESHOLD;
}

function useData() {
  const [status, setStatus] = useState({
    latest: null,
    settings: {
      start_threshold: 40,
      stop_threshold: 40,
      auto_mode: true,
      max_pump_seconds: 20,
    },
    events: [],
  });

  const [readings, setReadings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = async () => {
    try {
      const [statusResponse, readingsResponse] =
        await Promise.all([
          fetch(`${API}/api/status`),
          fetch(`${API}/api/readings?limit=80`),
        ]);

      if (!statusResponse.ok || !readingsResponse.ok) {
        throw new Error("Could not load database readings.");
      }

      const statusData = await statusResponse.json();
      const readingsData = await readingsResponse.json();

      const orderedReadings = [...readingsData].reverse();

      setStatus(statusData);
      setReadings(orderedReadings);
      setError("");
      setLastUpdated(new Date());

    } catch (err) {
      setError(
        "Cannot connect to the backend. Check that the API and MySQL are running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    const timer = setInterval(refresh, 3000);

    return () => clearInterval(timer);
  }, []);

  return {
    status,
    readings,
    error,
    loading,
    lastUpdated,
    refresh,
  };
}

function Title({ k, title, desc, action }) {
  return (
    <div className="title">
      <div>
        <small>{k}</small>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}

function Metric({ icon: Icon, label, value, unit, note }) {
  return (
    <div className="metric">
      <div className="metric-icon">
        <Icon size={19} />
      </div>

      <small>{label}</small>

      <h2>
        {value}
        <em>{unit}</em>
      </h2>

      <p>{note}</p>
    </div>
  );
}

function MoisturePie({ moisture }) {
  const value = Math.max(
    0,
    Math.min(100, Number(moisture) || 0)
  );

  const data = [
    { name: "Moisture", value },
    { name: "Remaining", value: 100 - value },
  ];

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>Soil moisture level</h3>
          <p>Latest saved sensor reading</p>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 250,
          position: "relative",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              <Cell fill="#7c5cff" />
              <Cell fill="#e9eaf5" />
            </Pie>

            <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <strong style={{ fontSize: 28 }}>
            {value.toFixed(1)}%
          </strong>
          <small>Moisture</small>
        </div>
      </div>

      <p>
        Pump rule: moisture at or below 40% means ON;
        above 40% means OFF.
      </p>
    </section>
  );
}

function Chart({ readings }) {
  const rows = readings.map((reading, index) => ({
    time: reading.created_at
      ? new Date(
          String(reading.created_at).replace(" ", "T")
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : `Reading ${index + 1}`,

    moisture: Number(reading.moisture),
  }));

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>Soil moisture trend</h3>
          <p>Saved sensor readings</p>
        </div>
      </div>

      <div className="chart">
        {rows.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows}>
              <defs>
                <linearGradient
                  id="moistureFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#a78bfa"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="#a78bfa"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#dfe3f0"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                stroke="#78829f"
                fontSize={10}
              />

              <YAxis
                domain={[0, 100]}
                stroke="#78829f"
                fontSize={10}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="moisture"
                stroke="#8b6cff"
                fill="url(#moistureFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty">
            No saved sensor readings are available.
          </div>
        )}
      </div>
    </section>
  );
}

function Table({ rows }) {
  if (!rows.length) {
    return (
      <div className="empty">
        No database readings are available yet.
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Sample</th>
            <th>Soil moisture</th>
            <th>Threshold</th>
            <th>Pump status</th>
            <th>Source</th>
            <th>Recorded</th>
          </tr>
        </thead>

        <tbody>
          {[...rows].reverse().map((reading, index) => {
            const pumpOn = getPumpStatus(reading);

            return (
              <tr key={reading.id ?? index}>
                <td>{index + 1}</td>

                <td>
                  {Number(reading.moisture).toFixed(1)}%
                </td>

                <td>{PUMP_THRESHOLD}%</td>

                <td>
                  <b className={pumpOn ? "red" : "green"}>
                    {pumpOn ? "ON" : "OFF"}
                  </b>
                </td>

                <td>{reading.source ?? "unknown"}</td>

                <td>{reading.created_at ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWeather = async () => {
    setLoading(true);

    try {
      const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=11.0168" +
        "&longitude=76.9558" +
        "&timezone=Asia%2FKolkata" +
        "&forecast_days=7" +
        "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation" +
        "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Weather service is unavailable.");
      }

      const data = await response.json();

      setWeather(data);
      setError("");

    } catch {
      setWeather(null);
      setError(
        "Live weather is unavailable. Check your internet connection and try Refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();

    const timer = setInterval(loadWeather, 15 * 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const current = weather?.current;
  const daily = weather?.daily;

  return (
    <>
      <Title
        k="FIELD CONDITIONS / WEATHER"
        title="Coimbatore weather insight"
        desc="Weather information from the live weather service."
        action={
          <button className="btn" onClick={loadWeather}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      {loading && (
        <div className="notice">
          Loading live weather data...
        </div>
      )}

      {error && (
        <div className="notice danger">
          {error}
        </div>
      )}

      {current && (
        <section className="panel">
          <CloudSun size={40} />

          <small>LIVE CONDITIONS · COIMBATORE</small>

          <h2>
            {current.temperature_2m}°C
          </h2>

          <p>
            Updated: {current.time?.replace("T", " ")}
          </p>

          <div className="weather-stats">
            <div>
              <b>{current.relative_humidity_2m}%</b>
              <small>Humidity</small>
            </div>

            <div>
              <b>{current.precipitation} mm</b>
              <small>Precipitation</small>
            </div>

            <div>
              <b>{current.wind_speed_10m} km/h</b>
              <small>Wind speed</small>
            </div>
          </div>
        </section>
      )}

      {daily && (
        <section className="panel">
          <h3>Seven-day weather forecast</h3>

          <div className="table-scroll">
            <table style={{ color: "#000000" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Minimum °C</th>
                  <th>Maximum °C</th>
                  <th>Rain mm</th>
                  <th>Rain chance</th>
                </tr>
              </thead>

              <tbody>
                {daily.time.map((date, index) => (
                  <tr key={date}>
                    <td>{date}</td>

                    <td>
                      {daily.temperature_2m_min[index]}°
                    </td>

                    <td>
                      {daily.temperature_2m_max[index]}°
                    </td>

                    <td>
                      {daily.precipitation_sum[index]}
                    </td>

                    <td>
                      {daily.precipitation_probability_max[index] ?? "—"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function App() {
  const data = useData();

  const location = useLocation();

  const [mobile, setMobile] = useState(false);

  const latest = data.status.latest;

  const [form, setForm] = useState({
    start_threshold: 40,
    stop_threshold: 40,
    auto_mode: true,
    max_pump_seconds: 20,
  });

  const [message, setMessage] = useState("");

  const title =
    nav.find((item) => item[0] === location.pathname)?.[1] ||
    "Overview";

  const saveSettings = async (event) => {
    event.preventDefault();

    setMessage(
      "The backend currently requires the start threshold to be lower than the stop threshold. The 40% pump rule is displayed separately."
    );
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Sprout />
          </div>

          <div>
            <b>
              AGROSMART <i>AI</i>
            </b>
            <small>PRECISION AGRICULTURE</small>
          </div>

          <button
            className="close"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>
        </div>

        <div className="farm">
          <span>🌱</span>
          <div>
            <small>ACTIVE FARM</small>
            <b>Demo Field · Plot 01</b>
          </div>
        </div>

        <small className="nav-label">WORKSPACE</small>

        <nav>
          {nav.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                "nav-link " + (isActive ? "active" : "")
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="device">
          <Wifi size={17} />

          <div>
            <b>ARDUINO UNO</b>
            <small>
              {latest?.source === "hardware"
                ? "Hardware data received"
                : "Waiting for sensor data"}
            </small>
          </div>

          <i
            className={
              latest?.source === "hardware"
                ? "connected"
                : ""
            }
          />
        </div>

        <small className="version">
          AGROSMART AI · VERSION 1.0
        </small>
      </aside>

      <div className="main">
        <header>
          <button
            className="hamb"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>

          <span>
            Workspace <ChevronRight size={14} />{" "}
            <b>{title}</b>
          </span>

          <div className="head-right">
            <i
              className={
                data.error ? "red" : "connected"
              }
            />

            {data.error ? "API offline" : "API monitor"}

            <button
              onClick={data.refresh}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Title
                    k="FARM OPERATIONS / OVERVIEW"
                    title="Good day, grower."
                    desc="Your irrigation intelligence, all in one place."
                    action={
                      <button
                        className="btn"
                        onClick={data.refresh}
                      >
                        <RefreshCw size={15} /> Refresh
                      </button>
                    }
                  />

                  {data.error && (
                    <div className="notice danger">
                      {data.error}
                    </div>
                  )}

                  <div className="banner">
                    <span className="banner-icon">
                      <Sprout />
                    </span>

                    <div>
                      <b>
                        {!latest
                          ? "Waiting for sensor data"
                          : Number(latest.moisture) <= 40
                          ? "Soil moisture is at or below 40%"
                          : "Soil moisture is above 40%"}
                      </b>

                      <p>
                        {latest
                          ? `Latest moisture: ${latest.moisture}%. Source: ${latest.source}.`
                          : "Waiting for a saved hardware reading."}
                      </p>
                    </div>

                    <span className="pill">
                      {latest?.source === "hardware"
                        ? "HARDWARE DATA"
                        : "NO HARDWARE DATA"}
                    </span>
                  </div>

                  <div className="metrics">
                    <Metric
                      icon={Droplets}
                      label="SOIL MOISTURE"
                      value={
                        latest
                          ? Number(latest.moisture).toFixed(1)
                          : "--"
                      }
                      unit="%"
                      note="Latest saved reading"
                    />

                    <Metric
                      icon={Power}
                      label="PUMP STATUS"
                      value={
                        getPumpStatus(latest) === null
                          ? "--"
                          : getPumpStatus(latest)
                          ? "ON"
                          : "OFF"
                      }
                      unit=""
                      note="Based on the 40% rule"
                    />

                    <Metric
                      icon={Waves}
                      label="WATER USED"
                      value={
                        latest
                          ? Number(
                              latest.water_used_liters || 0
                            ).toFixed(2)
                          : "--"
                      }
                      unit="L"
                      note="Reported amount"
                    />
                  </div>

                  <div className="two-col">
                    <MoisturePie
                      moisture={latest?.moisture ?? 0}
                    />

                    <Chart readings={data.readings} />
                  </div>

                  <section className="panel quick">
                    <h3>Quick actions</h3>

                    <NavLink to="/live" className="btn">
                      Open live monitor
                      <ChevronRight size={15} />
                    </NavLink>

                    <NavLink to="/irrigation" className="btn">
                      Irrigation insights
                      <ChevronRight size={15} />
                    </NavLink>

                    <NavLink to="/history" className="btn">
                      Sensor history
                      <ChevronRight size={15} />
                    </NavLink>
                  </section>
                </>
              }
            />

            <Route
              path="/live"
              element={
                <>
                  <Title
                    k="TELEMETRY / LIVE MONITOR"
                    title="Live field monitor"
                    desc="Hardware readings refresh every three seconds."
                  />

                  <div className="metrics">
                    <Metric
                      icon={Droplets}
                      label="MOISTURE"
                      value={
                        latest
                          ? Number(latest.moisture).toFixed(1)
                          : "--"
                      }
                      unit="%"
                      note="Saved sensor reading"
                    />

                    <Metric
                      icon={Power}
                      label="PUMP STATUS"
                      value={
                        getPumpStatus(latest) === null
                          ? "--"
                          : getPumpStatus(latest)
                          ? "ON"
                          : "OFF"
                      }
                      unit=""
                      note="Based on the 40% rule"
                    />
                  </div>

                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Telemetry stream</h3>
                        <p>
                          Saved readings from MySQL
                        </p>
                      </div>

                      <button
                        className="btn"
                        onClick={data.refresh}
                      >
                        <RefreshCw size={15} /> Refresh
                      </button>
                    </div>

                    <Table rows={data.readings} />
                  </section>
                </>
              }
            />

            <Route
              path="/irrigation"
              element={
                <>
                  <Title
                    k="WATER INTELLIGENCE / IRRIGATION"
                    title="Irrigation insights"
                    desc="Live soil moisture and pump recommendation."
                    action={
                      <button
                        className="btn"
                        onClick={data.refresh}
                      >
                        <RefreshCw size={15} /> Refresh
                      </button>
                    }
                  />

                  <div className="banner large">
                    <span className="banner-icon">
                      <Droplets />
                    </span>

                    <div>
                      <b>
                        {!latest
                          ? "Waiting for sensor data"
                          : getPumpStatus(latest)
                          ? "Watering required"
                          : "Soil moisture is above 40%"}
                      </b>

                      <p>
                        Pump ON at moisture ≤ 40%.
                        Pump OFF above 40%.
                      </p>

                      <p>
                        {data.lastUpdated
                          ? `Dashboard updated ${data.lastUpdated.toLocaleTimeString()}`
                          : "Waiting for first update"}
                      </p>
                    </div>

                    <strong className="big-value">
                      {latest
                        ? Number(latest.moisture).toFixed(1) + "%"
                        : "--"}
                    </strong>
                  </div>

                  <div className="metrics">
                    <Metric
                      icon={Droplets}
                      label="PUMP ON THRESHOLD"
                      value="40"
                      unit="%"
                      note="ON at or below 40%"
                    />

                    <Metric
                      icon={CheckCircle2}
                      label="PUMP OFF THRESHOLD"
                      value="40"
                      unit="%"
                      note="OFF above 40%"
                    />

                    <Metric
                      icon={Power}
                      label="PUMP STATUS"
                      value={
                        getPumpStatus(latest) === null
                          ? "--"
                          : getPumpStatus(latest)
                          ? "ON"
                          : "OFF"
                      }
                      unit=""
                      note="Based on latest moisture"
                    />

                    <Metric
                      icon={ShieldCheck}
                      label="LATEST READING"
                      value={
                        latest
                          ? Number(latest.moisture).toFixed(1)
                          : "--"
                      }
                      unit="%"
                      note={
                        latest?.created_at
                          ? `Recorded ${latest.created_at}`
                          : "Waiting for hardware"
                      }
                    />
                  </div>

                  <MoisturePie
                    moisture={latest?.moisture ?? 0}
                  />

                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Recent sensor readings</h3>
                        <p>
                          Stored hardware readings
                        </p>
                      </div>
                    </div>

                    <Table rows={data.readings} />
                  </section>

                  <div className="notice">
                    <AlertTriangle size={18} />
                    The website displays the pump recommendation.
                    A relay and controller output are required
                    to switch a physical pump.
                  </div>
                </>
              }
            />

            <Route
              path="/history"
              element={
                <>
                  <Title
                    k="DATA / HISTORY"
                    title="Sensor history"
                    desc="Previously saved readings from MySQL."
                    action={
                      <button
                        className="btn"
                        onClick={data.refresh}
                      >
                        <RefreshCw size={15} /> Refresh
                      </button>
                    }
                  />

                  <Chart readings={data.readings} />

                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Saved readings</h3>
                        <p>
                          {data.readings.length} database records
                        </p>
                      </div>
                    </div>

                    <Table rows={data.readings} />
                  </section>
                </>
              }
            />

            <Route
              path="/weather"
              element={<WeatherPage />}
            />

            <Route
              path="/settings"
              element={
                <>
                  <Title
                    k="CONFIGURATION / SETTINGS"
                    title="Field settings"
                    desc="Pump recommendation uses a fixed 40% threshold."
                  />

                  <section className="panel">
                    <h3>Irrigation rule</h3>

                    <p>
                      Pump ON at or below 40% moisture.
                    </p>

                    <p>
                      Pump OFF above 40% moisture.
                    </p>

                    <p>
                      The website does not directly operate
                      the physical pump.
                    </p>

                    <form onSubmit={saveSettings}>
                      <label>
                        Maximum pump runtime (seconds)

                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={form.max_pump_seconds}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              max_pump_seconds:
                                Number(event.target.value),
                            })
                          }
                        />
                      </label>

                      <button
                        className="btn primary"
                        type="submit"
                      >
                        <Save size={16} />
                        Save
                      </button>
                    </form>

                    {message && (
                      <div className="notice">
                        {message}
                      </div>
                    )}
                  </section>
                </>
              }
            />

            <Route
              path="*"
              element={
                <Title
                  k="WORKSPACE"
                  title="Page not found"
                  desc="Choose a module from the sidebar."
                />
              }
            />
          </Routes>

          <footer>
            © 2026 AGROSMART AI
            <span>
              IoT · DATA · WATER CONSERVATION
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;