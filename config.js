/*
 * CONFIGURATION OF ENVIRONMENT VARIABLES
 */

var rootDir = process.cwd(),
	nconf = require('nconf'),
	fs = require('fs'),
	configFilename = '/config.json',
	json = JSON.parse(fs.readFileSync(rootDir + '/package.json', 'utf8'));

nconf.argv().env().file({
	file: process.env.configFile || rootDir + configFilename
});

module.exports = nconf;