const request = require("request");
const sensor = require('ds18x20');

const Lcd = require('lcd');
const lcd = new Lcd( {rs: 12, e: 21, data: [5,6,17,18], cols: 16, rows: 2});

var isLoaded = sensor.isDriverLoaded();
console.log(isLoaded);

if (isLoaded) {
  //get sensors
  var listOfDeviceIds = sensor.list();
  console.log('Devices found: ' + listOfDeviceIds);
  
  if(listOfDeviceIds.length==0){
    console.log('No Devices found, exiting...');
    process.exit();
  }
  
  //read the first sensor
  var mainSensor = listOfDeviceIds[0];
  sensor.get(mainSensor, function (err, temp) {
    console.log('Temp: ' + temp);
  });


} else {
  console.log('Driver not loaded!!');
}

function sendPost(code, temp) {
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
  console.log(temp+' '+code);
}


lcd.on('ready', _ => {
	setInterval(() => {
		try {
			
			sensor.get(mainSensor, function (err, temp) {
				if(temp == undefined){
					//sendPost(0,temp)
					console.log(12);
					lcd.setCursor(0,0);
					lcd.print(new Date().toString().substring(16,24), err => {
						if(err) {
							throw err;
						}
					});
	
				}
				else{
					//sendPost(0,40)
					console.log(12);
					lcd.setCursor(0,0);
					lcd.print(new Date().toString().substring(16,24), err => {
						if(err) {
							throw err;
						}
					});
				}
				
			});
		
		}
		catch(error) {
			sendPost(1,'null')
 	
		}
	}, 500);
});

process.on('SIGINT', _ => {
	lcd.close();
	process.exit();
});