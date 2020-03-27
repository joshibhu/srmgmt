var appRoot = require('app-root-path');
var winston = require('winston');
const util = require('util');

function transform(info, opts) {
  const args = info[Symbol.for('splat')];
  if (args) { info.message = util.format(info.message, ...args); }
  return info;
}

function utilFormatter() { return {transform}; }

var options = {
    file: {
      level: 'info',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    },
    console: {
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
};


var logger = new winston.createLogger({   
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
        utilFormatter(),     // <-- this is what changed
        //winston.format.colorize(),
        winston.format.printf(({level, message, label, timestamp}) => `${timestamp} ${label || '-'} ${level}: ${message}`),
   
    ),
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;

