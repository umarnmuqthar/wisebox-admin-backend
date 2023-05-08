const infoLogger = require('debug')('app:info')
const errorLogger = require('debug')('app:error')
const logLogger = require('debug')('app:log')

class Logger {

    constructor() {
        if (Logger._instance) {
            return Logger._instance
        }
        Logger._instance = this;

        this.infoLogger = infoLogger
        this.errorLogger = errorLogger
        this.logLogger = logLogger

        this.logLogger.log = console.log.bind(console)
        this.errorLogger.log = console.error.bind(console)
        this.logLogger.log = console.info.bind(console)
    }

    async log(data) {
        this.logLogger(data)
    }

    async error(data) {
        this.errorLogger(data)
    }

    async info(data) {
        this.infoLogger(data)
    }
}

module.exports = new Logger()