/*
 AGROSMART AI ESP32 HTTP integration example.
 Replace Wi-Fi details, API URL, key, and calibration for your hardware.
 This example reports moisture only; implement and test pump safety locally.
 Install ArduinoJson from Arduino IDE Library Manager.
*/
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "http://192.168.1.10:5000/api/readings"; // Laptop IPv4, not localhost
const char* DEVICE_API_KEY = "replace_with_a_long_random_key";
const int MOISTURE_PIN = 34;
const int DRY_RAW = 3200; // Calibrate for your sensor
const int WET_RAW = 1400; // Calibrate for your sensor

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(400); Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    delay(1500);
  }
  int raw = analogRead(MOISTURE_PIN);
  float moisture = constrain(map(raw, DRY_RAW, WET_RAW, 0, 100), 0, 100);
  Serial.printf("Moisture estimate: %.1f%%\n", moisture);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", DEVICE_API_KEY);
    StaticJsonDocument<256> doc;
    doc["device_id"] = "ESP32-01";
    doc["moisture"] = moisture;
    doc["temperature"] = nullptr;
    doc["humidity"] = nullptr;
    doc["pump_on"] = false; // Replace with verified local pump state
    doc["water_used_liters"] = 0.0;
    doc["source"] = "hardware";
    String body;
    serializeJson(doc, body);
    int code = http.POST(body);
    Serial.printf("API response: %d\n", code);
    if (code > 0) Serial.println(http.getString());
    http.end();
  }
  delay(5000);
}
