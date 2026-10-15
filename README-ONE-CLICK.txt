AGROSMART AI - QUICK START

1. Extract this ZIP completely.
2. Double-click START-AGROSMART.bat.
3. Wait for npm installation to finish and the browser to open.
4. Keep the API and Website terminal windows open.

IMPORTANT
- Internet is needed for installation and live Coimbatore weather.
- For database-backed readings/settings: start MySQL, run backend/schema.sql once in MySQL Workbench, and set your actual MySQL password in backend/.env.
- Seven-day sensor readings are simulated sample data until real hardware is connected.
- Do not use the demo dashboard to control a real pump without testing the hardware's local fail-safe controls.


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
