/*
 * CONFIGURATION OF ENVIRONMENT VARIABLES
 */

var isProduction = (process.env.NODE_ENV === 'production');
var rootDir = isProduction === true ? '/home/deploy/current' : process.cwd();
	nconf = require('nconf'),
	fs = require('fs'),
	env = require(rootDir + '/bin/server').app.get('env'),
	configFilename = env !== 'development' ? '/config_' + env + '.json' : '/config.json',
	json = JSON.parse(fs.readFileSync(rootDir + '/package.json', 'utf8'));

nconf.argv().env().file({
	file: process.env.configFile || rootDir + configFilename
});

nconf.set('ENVIRONMENT', env);
nconf.set('VERSION', json.version.replace(/\./g, '_'));

module.exports = nconf;
