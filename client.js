const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

let moment = require('moment');
const https = require('https');

function _ArrayFlatMap(array, selector) {
    if (array.length == 0) {
      return [];
    } else if (array.length == 1) {
      return selector(array[0]);
    }
    return array.reduce((prev, next) =>
    (/*first*/ selector(prev) || /*all after first*/ prev).concat(selector(next)))
}

function _guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

module.exports = class ElementHomeClient {



  constructor(log) {

    this.client = axios.create({
      baseURL: 'https://us-elements.cloud.sengled.com:443/zigbee/',
      timeout: 2000,
      jar: cookieJar,
      withCredentials: true,
      responseType: 'json'
    });
    this.client.defaults.headers.post['Content-Type'] = 'application/json';
    this.log = log
    this.lastLogin = moment('2000-01-01')
    this.uuid = _guid();
  }

  login(username, password) {
    // If token has been set in last 24 hours, don't log in again
    // if (this.lastLogin.isAfter(moment().subtract(24, 'hours'))) {
    //     return Promise.resolve();
    // }


    return new Promise((fulfill, reject) => {
      if (this.jsessionid != null) {
        this.log("Cookie found, skipping login request.");
        fulfill(this.loginResponse);
      }
      this.client.post('/customer/remoteLogin.json',
      {
        'uuid':this.uuid,
        'isRemote':true,
        'user': username,
        'pwd': password,
        'os_type': 'ios'
      }).then((response) => {
        this.jsessionid = response.data.jsessionid;
        this.lastLogin = moment();
        this.loginResponse = response;
        fulfill(response);
      }).catch(function (error) {
        reject(error);
      });

    });


  }

  getDevices() {

  // Example device response:
  // {
  //     "deviceUuid": "xxxxxxxxxxxxxxxx",
  //     "deviceName": "Bulb 1",
  //     "signalQuality": 1,
  //     "activeTime": "2018-02-08 21:43:27",
  //     "roomId": null,
  //     "roomName": null,
  //     "deviceVersion": "9",
  //     "isOnline": 0,
  //     "onoff": 0,
  //     "productCode": "E11-G14"
  // }
  // Map to device Object
  // {
  //     "id": "xxxxxxxxxxxxxxxx",
  //     "name": "Bulb 1",
  //     "isOnline": false,
  //     "status": false,
  //     "productCode": "E11-G14"
  // }

    return new Promise((fulfill, reject) => {
      this.client.post('/device/getDeviceInfos.json', {})
      .then((response) => {
        if (response.data.ret == 100) {
          reject(response.data);
        } else {
          let gatewayList = response.data.gatewayList
          let deviceList = _ArrayFlatMap(gatewayList, i => i.deviceList);
          let devices = deviceList.map((device) => {
            return {
              id: device.deviceUuid,
              name: device.deviceName,
              status: device.onoff,
              isOnline: device.isOnline,
              signalQuality: device.signalQuality,
			  //this isn't actually returned at all. i have zero idea where the app gets this info.
			  //i had this plugin print the entirety of the response it got back. nothing about brightness.
			  //and yet, i have to tell the plugin something. Bad idea? probably. but if someone does figure
			  //this out, it'll be easy to make getting brightness work. Hate me if you want.
			  //-EthanRDoesMC
			  brightness: device.brightness,
              productCode: device.productCode
            };
          });
          fulfill(devices);
        }
      }).catch(function (error) {
        reject(error);
      });
    });
  }

  userInfo() {
    return new Promise((fulfill, reject) => {
      this.client.post('/customer/getUserInfo.json', {})
      .then((response) => {
        if (response.data.ret == 100) {
          reject(response.data);
        } else {
          fulfill(response);
        }
      }).catch(function (error) {
        reject(error);
      });
    });
  }

  deviceSetOnOff(deviceId, onoff) {
    return new Promise((fulfill, reject) => {
      this.client.post('/device/deviceSetOnOff.json', {"onoff": onoff ? 1 : 0,"deviceUuid": deviceId})
      .then((response) => {
        if (response.data.ret == 100) {
          reject(response.data);
        } else {
          fulfill(response);
        }
      }).catch(function (error) {
        reject(error);
      });
    });
  }


  deviceSetBrightness(deviceId, brightnessValue) {
    return new Promise((fulfill, reject) => {
      this.client.post('/device/deviceSetBrightness.json', {"brightness": brightnessValue * 2.55,"deviceUuid": deviceId})
	  //reportedly it uses 0/255, so math'd it. don't hate me if homebridge already uses 0/255. -ethan
      .then((response) => {
        if (response.data.ret == 100) {
          reject(response.data);
        } else {
          fulfill(response);
        }
      }).catch(function (error) {
        reject(error);
      });
    });
  }
};