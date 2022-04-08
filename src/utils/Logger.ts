import { Foxium } from '../index.js';
import chalk from 'chalk';
import TimeStamp from 'time-stamp';

export default class Logger {
    foxium: Foxium

    timeFormat: string = chalk.blue(`[${TimeStamp("HH:mm:ss")}]`);
    callerFormat: string;
    logFormat: string = chalk.green(`[LOG] `);
    warningFormat: string = chalk.yellow(`[WARNING] `);
    errorFormat: string = chalk.red(`[ERROR] `);
    infoFormat: string = chalk.blue(`[INFO] `);

    constructor(foxium: Foxium, caller: string) {
        this.foxium = foxium;
        this.callerFormat = `[${caller}]`;
    }

    writeLine(str: string) {
        process.stdout.write(`${this.timeFormat} ${this.callerFormat} ${str}\n`);
    }

    log(message: string) {
        this.writeLine(this.logFormat + message);
    }

    warning(message: string) {
        this.writeLine(this.warningFormat + message);
    }

    error(message: string) {
        process.stderr.write(`${this.timeFormat} ${this.callerFormat} ${this.errorFormat} ${message}\n`);
    }

    info(message: string) {
        this.writeLine(this.infoFormat + message);
    }
}