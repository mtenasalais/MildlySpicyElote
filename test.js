const request = require("request");
const sensor = require('ds18x20');

const Lcd = require('lcd');
const lcd = new Lcd({ rs: 25, e: 24, data: [23, 17, 18, 22], cols: 16, rows: 2 });

let isLoaded = sensor.isDriverLoaded();
let mainSensor;
console.log(isLoaded);

if (isLoaded) {
  //get sensors
  let listOfDeviceIds = sensor.list();
  console.log('Devices found: ' + listOfDeviceIds);
  
  if(listOfDeviceIds.length==0){
    console.log('No Devices found, exiting...');
    process.exit();
  }
  
  //read the first sensor
  mainSensor = listOfDeviceIds.find(device => /^28*/);
  if (mainSensor === undefined) {
    console.log("28-xxxx device not found!");
  }
  sensor.get(mainSensor, (err, temp) => {
    console.log('Temp: ' + temp);
  }); 

} else {
  console.log('Driver not loaded!!');
}

const sendPost = (code, temp) => {
  request({
    url: "http://50.83.157.247/api",
    method: "POST",
    headers: {
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/json",
      Accept: "application/json",
      Connection: "keep-alive",
      DNT: "1",
      Origin: "http://50.83.157.247/api"
    },
    body: `{"query":"mutation {addTempDataPoint(code:${code},temperature:${temp}){temperature}}"}`
  });
  console.log(`code: ${code}, temp: ${temp}`);
}


lcd.on('ready', () => {
  setInterval(() => {
    try {
      sensor.get(mainSensor, (err, temp) => {
        if (temp === 0) {
          sendPost(1,null);
          lcd.setCursor(0,0);
          lcd.print("  Sensor Error  ");
        } else {
          sendPost(0,Number(temp));
          lcd.setCursor(0,0);
          lcd.print(`${Number(temp).toFixed(2)} C`);
        }
      });
    } catch(error) {
      console.log(error);
      sendPost(1,'null');
    }
  }, 500);
});

process.on('SIGINT', () => {
  lcd.close();
  process.exit();
});
