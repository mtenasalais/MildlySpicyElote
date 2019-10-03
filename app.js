const request = require("request");
const sensor = require("ds18x20");
const lcd = require("lcd");

const API_ENDPOINT = "http://50.83.157.247/api";
const HTTP_METHOD = "POST";
const HEADERS = {
  "Accept-Encoding": "gzip, deflate, br",
  "Content-Type": "application/json",
  Accept: "application/json",
  Connection: "keep-alive",
  DNT: "1",
  Origin: API_ENDPOINT
};

// send data to server
const CODE = {
  NO_ERRORS: 0,
  SENSOR_ERROR: 1
};
const postRequest = (code, temp) => {
  request({
    url: API_ENDPOINT,
    method: HTTP_METHOD,
    headers: HEADERS,
    body: `{"query":"mutation {addTempDataPoint(code:${code},temperature:${temp}){temperature}}"}`
  });
};

// create my_lcd
const my_lcd = new lcd({
  rs: 25,
  e: 24,
  data: [23, 17, 18, 22],
  cols: 16,
  rows: 2
});

const getSensorName = () => {
  if (sensor.isDriverLoaded()) {
    // get device list
    const deviceList = sensor.list();

    // if no devices
    if (!deviceList || deviceList.length === 0) {
      console.log("Sensor Error: No sensors found.");
      return null;
    }

    // get the 28-xxx sensor
    const mainSensorName = deviceList.find(device => /^28*/);
    if (mainSensorName === undefined) {
      console.log("Sensor Error: 28-xxxx device not found.");
    }

    return mainSensorName;
  } else {
    console.log("Sensor Error: No driver found.");
    return null;
  }
};

// main loop
const INTERVAL_MS = 500;
const DEFAULT_TEMP = 0;
my_lcd.on("ready", () => {
  setInterval(() => {
    try {
      sensor.get(getSensorName(), (err, temp) => {
        if (temp === DEFAULT_TEMP) {
          postRequest(CODE.SENSOR_ERROR, null);
          my_lcd.setCursor(0, 0);
          my_lcd.print("  Sensor Error  ");
        } else {
          postRequest(CODE.NO_ERRORS, Number(temp));
          my_lcd.setCursor(0, 0);
          my_lcd.print(`${Number(temp).toFixed(2)} C`);
        }
      });
    } catch (e) {
      console.log(error);
      postRequest(CODE.SENSOR_ERROR, null);
    }
  }, INTERVAL_MS);
});

// on ^C
const SIGINT = "SIGINT";
process.on(SIGINT, () => {
  my_lcd.clear(() => {
    my_lcd.close();
    process.exit();
  });
});
