'use strict';

var SkyRemote = require('sky-remote');
var SkyQCheck = require('sky-q');
var Accessory, Service, Characteristic;

module.exports = function(homebridge) {

	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-sky-q", "SkyQ", SkyQAccessory);
};

function SkyQAccessory(log, config, api) {

	this.log = log;
	this.config = config;
	this.name = config.name || 'Sky Q';

	var remoteControl = new SkyRemote(config.ipAddress);
	var boxCheck = new SkyQCheck({ip:config.ipAddress})
	this.skyQ = remoteControl;
	this.box = boxCheck;
}


SkyQAccessory.prototype = {

	setPowerState: function(powerOn, callback) {

		var log = this.log;
		var name = this.name;

		log("Sending on command to '" + name + "'...");

		this.skyQ.press('power', function(error) {

			if (error) {

				log('Failed to turn on ' + name + '. ' + error);
			}

			callback();
		});
	},

	identify: function(callback) {

		this.log("Identify...");

		callback();
	},

	getState: function(callback) {
		this.box.getPowerState().then(isOn=>{
  		if (isOn) {
		    this.log(this.name + " is on :-)")
		  } else {
		    this.log(this.name + " is in standby :-(")
		  }
		  callback(null, isOn);
		}).catch(err=>{
		  this.log("Unable to determine power state")
		  this.log("Perhaps looking at this error will help you figure out why" + err)
		  callback(err || new Error('Error getting state of ' + this.name));
		})
	},

	getServices: function() {

		var switchService = new Service.Switch(this.name);
		

		var characteristic = switchService.getCharacteristic(Characteristic.On).on('set', this.setPowerState.bind(this));

		characteristic.on('get', this.getState.bind(this));

		return [switchService];
	}
};
