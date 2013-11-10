var microtime = require('microtime');
var _defaultTime = 15;
var _currentTime;
var _timer;
var _sessionTime = _defaultTime;
var _callbackToCall;

var self = module.exports = {

	startTimer: function(callback) {
		_callbackToCall = callback;
		_currentTime = microtime.nowDouble();
		_timer = setTimeout(self.endTimer, _sessionTime, _callbackToCall);
	},

	getTime: function() {
		return microtime.nowDouble() - _currentTime;
	},

	addTime: function(timeToAdd) {
		// var timeDiff = microtime.nowDouble() - _currentTime;
		_sessionTime = self.getTime() + timeToAdd;
		clearTimeout(_timer);
		_timer = setTimeout(self.endTimer(), _sessionTime, _callbackToCall);
	},

	endTimer: function(callback) {
		clearTimeout(_timer);
		if (typeof callback === 'function') {
			callback();
		}
	}

};