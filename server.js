#!/usr/bin/env node

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('v9cXBZpDnEFeug5f');

var isProduction = (process.env.NODE_ENV === 'production');
var rootDir = isProduction === true ? '/home/deploy/current' : process.cwd();

var http = require('http');
var path = require('path');
var express = require('express');
var stylus = require('stylus');
var app = exports.app = express();

var config = require(rootDir + '/config');
var nodeEnv = config.get('ENVIRONMENT');
var port = nodeEnv === 'production' ? 80 : config.get('PORT');
// console.log(port, nodeEnv);

var socketLayer = require('socket.io');

var server;

require('colors');

console.log('\n\n');
console.log('      ___ ___ ___ ___| |_ ___ _ _'.red);
console.log('     |_ -| . | .\'| . | . | . |_\'_|'.red);
console.log('     |___|___|__,|  _|___|___|_,_|'.red);
console.log('                 |_|'.red);
console.log('\n\n');


var globals = require(rootDir + '/server/services/globals');
// var helpers = require(rootDir + '/server/services/helpers');
var db = require(rootDir + '/server/services/db').init(config.get('MONGO_HOST'));


app.configure(function() {
	app.set('port', port);
	app.set('views', rootDir + '/client/views');
	app.set('view engine', 'jade');
	app.set('globals', globals.getGlobals());
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	// FIXME: (stylus) ???
	app.use(stylus.middleware(rootDir + '/client/static'));
	// app.use(express.static(path.join(rootDir, 'client')));
	app.use(express.static(path.join(rootDir, 'client/static')));
});

app.configure('development', function() {
	app.locals.pretty = true;
	app.use(express.errorHandler());
	process.on('uncaughtException', function(err) { console.log(err); });
});

console.log('Express configured.'.green);

require(rootDir + '/server/routes/appRoutes').setRoutes(app);
require(rootDir + '/server/routes/ajaxRoutes').setRoutes(app);

console.log('Routing setup...'.green);

server = app.listen(port, function(err) {

	var local = server.address();

	if (err) {
		console.error(err);
		process.exit(-1);
	}

	// if run as root, downgrade to the owner of this file
	if (process.getuid() === 0) {
		require('fs').stat(__filename, function(err, stats) {
			if (err) {
				return console.error(err);
			}
			process.setuid(stats.uid);
		});
	}

	console.log('Express server listening @ http://%s:%d/ in '.green + '%s'.green.inverse + ' mode\n'.green, local.address, local.port, app.settings.env);

	// hook up the sockets
	var io = exports.io = socketLayer.listen(server);

	// // making it work with long polling for ??? (might not be needed)
	// io.configure(function() {
	// 	io.set('transports', ['xhr-polling']);
	// 	io.set('polling duration', 10);
	// });

	// when sockets are running, pass the variable along to controllers
	require(rootDir + '/server/services/soapbox').attachSocketLayer(io);

});
