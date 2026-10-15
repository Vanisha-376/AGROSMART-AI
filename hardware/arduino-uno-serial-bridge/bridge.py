import time
import re
import serial
import requests

COM_PORT = "COM3"
BAUD_RATE = 9600
API_URL = "http://localhost:5000/api/readings"

DRY_RAW = 1000
WET_RAW = 350

DEVICE_API_KEY = "replace_with_a_long_random_key"


def convert_to_moisture(raw):
    percentage = (DRY_RAW - raw) * 100 / (DRY_RAW - WET_RAW)
    return round(max(0, min(100, percentage)), 1)


def main():
    print("Connecting to Arduino on", COM_PORT)

    try:
        board = serial.Serial(COM_PORT, BAUD_RATE, timeout=2)
        time.sleep(2)
        print("Arduino connected!")
    except serial.SerialException as error:
        print("Arduino connection failed:", error)
        return

    try:
        while True:
            line = board.readline().decode(
                "utf-8", errors="ignore"
            ).strip()

            if not line:
                continue

            print("Arduino output:", line)

            # Accept only the actual soil moisture percentage.
            if not line.startswith("Soil Moisture:"):
                continue

            match = re.search(
                r"Soil Moisture:\s*(\d+(?:\.\d+)?)\s*%",
                line
            )

            if not match:
                continue

            moisture = float(match.group(1))
            moisture = max(0, min(100, moisture))

            payload = {
                "device_id": "ARDUINO-UNO-01",
                "moisture": moisture,
                "pump_on": False,
                "water_used_liters": 0,
                "source": "hardware"
            }

            try:
                response = requests.post(
                    API_URL,
                    json=payload,
                    headers={"x-device-key": DEVICE_API_KEY},
                    timeout=5
                )

                print("Moisture sent:", moisture, "%")
                print("Backend response:", response.status_code)

                if not response.ok:
                    print(response.text)

            except requests.RequestException as error:
                print("Backend connection error:", error)

    except KeyboardInterrupt:
        print("\nBridge stopped.")

    finally:
        board.close()


if __name__ == "__main__":
    main()