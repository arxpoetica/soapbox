#!/usr/bin/env node

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('v9cXBZpDnEFeug5f');

var config = require(rootDir + '/config');
var nodeEnv = config.get('ENVIRONMENT');
var rootDir = nodeEnv === 'production' ? '/home/deploy' : process.cwd();

var http = require('http');
var path = require('path');
var express = require('express');
var stylus = require('stylus');
var app = exports.app = express();

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


var routes = require(rootDir + '/server/routes/express');
var globals = require(rootDir + '/server/services/globals');
// var helpers = require(rootDir + '/server/services/helpers');
// var db = require(rootDir + '/server/services/db');


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

routes.setRoutes(app);

console.log('Express configured.'.green);

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

});
