import chalk from 'chalk';
import TimeStamp from 'time-stamp';
export default class Logger {
    constructor(foxium, caller) {
        this.timeFormat = chalk.blue(`[${TimeStamp("HH:mm:ss")}]`);
        this.logFormat = chalk.green(`[LOG] `);
        this.warningFormat = chalk.yellow(`[WARNING] `);
        this.errorFormat = chalk.red(`[ERROR] `);
        this.infoFormat = chalk.blue(`[INFO] `);
        this.foxium = foxium;
        this.callerFormat = `[${caller}]`;
    }
    writeLine(str) {
        process.stdout.write(`${this.timeFormat} ${this.callerFormat} ${str}\n`);
    }
    log(message) {
        this.writeLine(this.logFormat + message);
    }
    warning(message) {
        this.writeLine(this.warningFormat + message);
    }
    error(message) {
        process.stderr.write(`${this.timeFormat} ${this.callerFormat} ${this.errorFormat} ${message}\n`);
    }
    info(message) {
        this.writeLine(this.infoFormat + message);
    }
}
