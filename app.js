const request = require("request");
const sensor = require("ds18x20");
const lcd = require("lcd");
const Gpio = require("onoff").Gpio;

/////////////////////////////////////////////////////////////////////////////////////////
// define constants
const CODE = {
  NO_ERRORS: 0,
  SENSOR_ERROR: 1
};
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
// Define helper functions

// 1 - postRequest
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

const postRequest = (code, temp) => {
  request({
    url: API_ENDPOINT,
    method: HTTP_METHOD,
    headers: HEADERS,
    body: `{"query":"mutation {addTempDataPoint(code:${code},temperature:${temp}){temperature}}"}`
  });
};

// 2 - getSensorName
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

// 3 - writeToLcd
const writeToLcd = (the_lcd, code, temp) => {
  my_lcd.clear(() => {
    if (code === CODE.SENSOR_ERROR) {
      the_lcd.setCursor(0, 0);
      the_lcd.print("  Sensor Error  ");
    } else {
      the_lcd.setCursor(0, 0);
      the_lcd.print(`    ${Number(temp).toFixed(2)} C    `);
    }
  });
};

// 4 - turnLcdOn
const turnLcdOn = (lcd_power, state) => {
  lcd_power.write(1);
  const my_lcd = new lcd({
    rs: 25,
    e: 24,
    data: [23, 17, 18, 22],
    cols: 16,
    rows: 2
  });
  my_lcd.on("ready", () => {
    state.lcd_on = true;
  });
  return my_lcd;
};

// 5 - turnLcdOff
const turnLcdOff = (lcd_power, state) => {
  lcd_power.write(0);
  state.lcd_on = false;
};
/////////////////////////////////////////////////////////////////////////////////////////

// create gpio pins
const lcd_power = new Gpio(26, "out");

// create my_lcd
let state = { lcd_on: false };
let my_lcd = turnLcdOn(lcd_power);

// main loop
const DEFAULT_TEMP = 0;
const INTERVAL_MS = 500;
setInterval(() => {
  try {
    sensor.get(getSensorName(), (err, temp) => {
      if (temp) {
        if (temp === DEFAULT_TEMP) {
          postRequest(CODE.SENSOR_ERROR, null);
          if (state.lcd_on) writeToLcd(my_lcd, CODE.SENSOR_ERROR, null);
          console.log(
            `Sensor Error: Sensor value at DEFAULT_TEMP: ${DEFAULT_TEMP}`
          );
        } else if (temp === 85) {
          postRequest(CODE.SENSOR_ERROR, null);
          if (state.lcd_on) writeToLcd(my_lcd, CODE.SENSOR_ERROR, null);
          console.log(`Sensor Error: Sensor value at 85`);
        } else {
          my_lcd = turnLcdOn(lcd_power, state);
          postRequest(CODE.NO_ERRORS, temp);
          if (state.lcd_on) writeToLcd(my_lcd, CODE.NO_ERRORS, temp);
        }
      } else {
        turnLcdOff(lcd_power, state);
        postRequest(CODE.SENSOR_ERROR, null);
        if (state.lcd_on) writeToLcd(my_lcd, CODE.SENSOR_ERROR, null);
        console.log("Sensor Error: Error reading sensor.");
      }
    });
  } catch (e) {
    postRequest(CODE.SENSOR_ERROR, null);
    if (state.lcd_on) writeToLcd(my_lcd, CODE.SENSOR_ERROR, null);
    console.log(error);
  }
}, INTERVAL_MS);

// on ^C
const SIGINT = "SIGINT";
process.on(SIGINT, () => {
  my_lcd.clear(() => {
    my_lcd.close();
    process.exit();
  });
});
