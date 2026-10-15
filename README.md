# AGROSMART AI — Full-Stack IoT Irrigation Dashboard

## Modules
- Overview: latest metrics, chart, events and shortcuts
- Live Monitor: sensor telemetry and readings table
- Irrigation: threshold-based moisture insights
- Sensor History: saved records and demo data generator
- Weather Insight: live Coimbatore weather plus seven-day daily weather history from Open-Meteo
- Settings: irrigation settings saved to MySQL

## Stack
React + Vite + React Router + Recharts, Node.js + Express REST API, MySQL, and an ESP32 HTTP integration example.

## 1. Database setup
1. Start MySQL Server.
2. Open `backend/schema.sql` in MySQL Workbench and execute it.
3. Copy `backend/.env.example` to `backend/.env`.
4. Edit `backend/.env` with your MySQL password and a private `DEVICE_API_KEY`.

## 2. Start backend
Open VS Code terminal in the project root:
```powershell
cd backend
npm install
npm run dev
```
Health check: `http://localhost:5000/api/health`

## 3. Start frontend
Open a second terminal in the project root:
```powershell
cd frontend
npm install
npm run dev
```
Open the local address Vite prints, usually `http://localhost:5180`. Keep both terminals and MySQL running.

## Weather API and seven-day sample history
- Weather Insight calls the Open-Meteo Forecast API for Coimbatore, Tamil Nadu (latitude 11.0168, longitude 76.9558). It displays current conditions and recent daily weather data. Internet access is required; no API key is required for normal non-commercial use.
- Open **Sensor History** and click **Create 7-day sample** to insert seven clearly labelled simulated sensor records across the last seven days. These values are only for UI/testing and are not real soil readings or hardware telemetry.
- Click **Add demo reading** to add one extra simulated record. To see genuine soil moisture, temperature/humidity sensor readings, and pump state, connect and configure the ESP32 hardware.

## ESP32 integration
1. Find the laptop IPv4 address using `ipconfig`.
2. Edit `hardware/agrosmart_esp32_example.ino`: Wi-Fi details, API URL, device key, and moisture calibration.
3. Use `http://YOUR_LAPTOP_IPV4:5000/api/readings` as API URL, not `localhost`.
4. Ensure the sketch's device key matches `DEVICE_API_KEY` in `backend/.env`.
5. Install ArduinoJson in Arduino IDE Library Manager, upload the sketch, and inspect Serial Monitor.

## API endpoints
- `GET /api/health`
- `GET /api/status`
- `GET /api/readings?limit=80`
- `POST /api/readings` (ESP32; uses `x-device-key` if configured)
- `GET /api/events`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/demo/generate`

Example payload:
```json
{
  "device_id": "ESP32-01",
  "moisture": 28.5,
  "temperature": null,
  "humidity": null,
  "pump_on": false,
  "water_used_liters": 0,
  "source": "hardware"
}
```

## Safety and scope
- Settings are stored in MySQL, but this starter does not remotely switch the pump. Implement thresholds, maximum runtime and fail-safe pump-off logic on the ESP32 itself.
- Calibrate moisture values for your actual sensor and soil.
- Weather Insight uses the live Open-Meteo API for Coimbatore and shows current conditions plus daily weather history. Weather data needs an internet connection; sensor data still requires your ESP32 or clearly labelled demo records.
- Restrict CORS and strengthen device security before exposing the API publicly.
- Never power a pump directly from an ESP32 GPIO; use a correctly rated driver and suitable external supply.


COIMBATORE WEATHER DATA UPDATE
The Weather Insight page requests current and recent daily weather from the Open-Meteo API for Coimbatore (11.0168, 76.9558). It tries the forecast API first and historical archive API if needed. An internet connection is required. The app does not fabricate weather readings. Execute backend/schema.sql in MySQL Workbench to initialize the database and sample/demo sensor history; these sensor values are explicitly simulated and are not weather data or real hardware readings.


WHITE THEME + PRELOADED DATA UPDATE
The frontend opens with seven days of clearly labelled sample sensor records and sample irrigation events, even if the backend/MySQL is not running. When a configured backend returns real database rows, those replace the local demo display. The Weather Insight page attempts to fetch Coimbatore weather from Open-Meteo. White/light theme is enabled. Sample sensor values are simulated and are not actual ESP32 measurements.


IMPORTANT: This fixed package runs the frontend on port 5180 so it does not accidentally open an older AGROSMART window/server still running on port 5173. Open http://localhost:5180.


## VS Code + white UI (updated)
1. Extract the ZIP to a normal folder (not inside the ZIP preview).
2. Open the extracted `AGROSMART-AI` folder in VS Code using File > Open Folder. Optionally double-click `OPEN-IN-VSCODE.bat` if the `code` command is installed.
3. Double-click `START-AGROSMART.bat` to install dependencies and open the site at http://localhost:5180.
4. The dashboard displays preloaded demo sensor data when the API/database is unavailable. The white theme is applied in `frontend/src/styles.css`.
5. Coimbatore weather is fetched from Open-Meteo when internet is available. Demo soil readings are simulated and are not actual ESP32 readings.


USER-PROVIDED SOIL SENSOR DATA
The frontend includes the 11 soil sensor samples supplied by the user. Fields: raw sensor value, estimated moisture percentage, threshold 40%, irrigation status. Moisture below 40% is labelled Watering Required; moisture at or above 40% is labelled Soil Moisture OK, matching the supplied table. These are provided test samples, not live ESP32 measurements. Sensor History displays these fields. The white theme remains enabled. Open this extracted folder in VS Code and run START-AGROSMART.bat.
