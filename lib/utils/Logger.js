import chalk from 'chalk';
import TimeStamp from 'time-stamp';
export default class Logger {
    constructor(foxium, caller) {
        this.timeFormat = chalk.blue(`[${TimeStamp("HH:mm:ss")}]`);
        this.callerFormat = `[%CALLER%]`;
        this.logFormat = chalk.green(`[LOG] `);
        this.warningFormat = chalk.yellow(`[WARNING] `);
        this.errorFormat = chalk.red(`[ERROR] `);
        this.infoFormat = chalk.blue(`[INFO] `);
        this.foxium = foxium;
        this.caller = caller;
    }
    writeLine(str) {
        const time = this.timeFormat;
        const caller = this.callerFormat.replace(/%CALLER%/gi, this.caller);
        process.stdout.write(`${time} ${caller} ${str}\n`);
    }
    log(message) {
        this.writeLine(this.logFormat + message);
    }
    warning(message) {
        this.writeLine(this.warningFormat + message);
    }
    error(message) {
        process.stderr.write(`${this.errorFormat}${message}\n`);
    }
    info(message) {
        this.writeLine(this.infoFormat + message);
    }
}
