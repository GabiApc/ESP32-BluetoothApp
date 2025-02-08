#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <BluetoothSerial.h>
#include "esp_bt_device.h"
#include "esp_bt_main.h"
#include "esp_gap_bt_api.h"

// Configurare LoRa
#define SS 5
#define RST 14
#define DIO0 26

// Bluetooth Serial
BluetoothSerial SerialBT;

// PIN Bluetooth
#define BT_PIN "1234"

// Variabile pentru WiFi
String receivedSSID = "";
String receivedPassword = "";
bool connected = false;

// Funcție pentru setarea PIN-ului Bluetooth
void btSetPin() {
    esp_bt_pin_code_t pinCode;
    memcpy(pinCode, BT_PIN, 4);
    esp_bt_gap_set_pin(ESP_BT_PIN_TYPE_FIXED, 4, pinCode);
}

void connectToWiFi(String ssid, String password) {
    Serial.println("Conectare la WiFi...");
    WiFi.begin(ssid.c_str(), password.c_str());

    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 20) {
        delay(500);
        Serial.print(".");
        retry++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi Conectat!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
        SerialBT.println("WiFi Conectat: " + WiFi.localIP().toString());
    } else {
        Serial.println("\nEroare WiFi!");
        SerialBT.println("Eroare WiFi! Verifică SSID și parola.");
    }
}

void setup() {
    Serial.begin(115200);

    // Inițializare Bluetooth
    SerialBT.begin("ESP32_BT");
    btSetPin(); // Setează PIN-ul Bluetooth
    Serial.println("Bluetooth activ cu PIN!");

    // Configurare LoRa
    Serial.println("Inițializare LoRa...");
    LoRa.setPins(SS, RST, DIO0);
    if (!LoRa.begin(868E6)) {
        Serial.println("Eroare: Modul LoRa nu a fost detectat.");
        while (1);
    }
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setSyncWord(0xF3);
    Serial.println("LoRa inițializat! Ascultare pachete...");
}

void loop() {
    // Verifică Bluetooth
    if (SerialBT.available()) {
        String receivedData = SerialBT.readStringUntil('\n');
        Serial.println("Date Bluetooth primite: " + receivedData);

        int separatorIndex = receivedData.indexOf(',');
        if (separatorIndex != -1) {
            receivedSSID = receivedData.substring(0, separatorIndex);
            receivedPassword = receivedData.substring(separatorIndex + 1);

            Serial.println("SSID: " + receivedSSID);
            Serial.println("Parolă: " + receivedPassword);

            // Conectare la WiFi
            connectToWiFi(receivedSSID, receivedPassword);
        } else {
            SerialBT.println("Format invalid! Folosește: SSID,PASS");
        }
    }

    // Verifică pachetele LoRa
    int packetSize = LoRa.parsePacket();
    if (packetSize) {
        String receivedData = "";
        while (LoRa.available()) {
            char c = (char)LoRa.read();
            receivedData += c;
        }

        Serial.print("Pachet LoRa primit: ");
        Serial.println(receivedData);

        if (receivedData.startsWith("7E") && receivedData.endsWith("7E")) {
            String trimmedData = receivedData.substring(2, receivedData.length() - 2);
            String msgType = trimmedData.substring(0, 4);

            if (msgType == "5200") {
                handleLogin(trimmedData);
            } else if (msgType == "0205") {
                handleData(trimmedData);
            }
        } else {
            Serial.println("Mesaj invalid sau zgomot ignorat.");
        }
    }
}

void handleLogin(String receivedData) {
    String deviceID = receivedData.substring(4, 13);
    String msgNumber = receivedData.substring(13, 17);
    String authKey = receivedData.substring(17);

    Serial.println("LOGIN primit:");
    Serial.println("Device ID: " + deviceID);
    Serial.println("msgNumber: " + msgNumber);
    Serial.println("AuthKey: " + authKey);

    sendAck(msgNumber);
}

void handleData(String receivedData) {
    String deviceID = receivedData.substring(4, 14);
    String msgNumber = receivedData.substring(14, 18);
    String data = receivedData.substring(18);

    Serial.println("DATA primit:");
    Serial.println("Device ID: " + deviceID);
    Serial.println("msgNumber: " + msgNumber);
    Serial.println("Data: " + data);

    sendAck(msgNumber);
}

void sendAck(String msgNumber) {
    String ackMessage = "ACK:" + msgNumber;
    LoRa.beginPacket();
    LoRa.print(ackMessage);
    LoRa.endPacket();
    Serial.println("ACK trimis: " + ackMessage);
}
