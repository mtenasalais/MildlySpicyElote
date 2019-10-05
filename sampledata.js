const request = require("request");

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

setInterval(() => {
  postRequest(0, Math.random() * 0.3 + 22);
}, 500);
