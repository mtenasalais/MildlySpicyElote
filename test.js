const request = require("request");
const sensor = require('ds18x20');
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


setInterval(() => {
	try {
		
		sensor.get(mainSensor, function (err, temp) {
			if(temp = undefined){
				sendPost(0,temp)
			}
			else{
				sendPost(1,'null')
			}
			
		});
	
	}
	catch(error) {
		sendPost(1,'null')
 
	}
}, 500);
