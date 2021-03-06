import * as readline from 'readline';
import { Foxium } from '../index.js';

export default class Command {
    commands = {};
    foxium: Foxium;
    rl: readline.ReadLine;

    constructor(foxium: Foxium) {
        this.foxium = foxium;

        this.addDefaultCommands();

        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        this.rl.on('line', input => this.doCommandline(input));
    }

    addDefaultCommands() {
        this.addCommand({
            slug: 'help',
            description: 'вывести список команд',
            handler: () => {
                this.foxium.logger.log('Список доступных команд:');
                Object.values(this.commands).forEach(({ slug, usage, description }) => {
                    this.foxium.log(`-> ${slug}${usage ? ` ${usage}` : ''} - ${description}`);
                });
            }
        });

        this.addCommand({
            slug: 'stop',
            description: 'остановить бота',
            handler: () => {
                process.kill(process.pid, 'SIGINT');
            }
        });
    }

    question(str) {
        return new Promise(resolve => this.rl.question(str, resolve));
    }

    async questionYN(str) {
        const response = await this.question(`${str}? [y/n] `);
        return response === 'y';
    }

    doCommandline(input) {
        const args = input.trim().split(' ');
        if (!args[0]) {
            return;
        }

        const command = this.commands[args[0]];
        if (!command) {
            this.foxium.logger.log(`Команда '${args[0]}' не найдена.`);
            this.foxium.logger.log('Введите \'help\' для просмотра списка команд.');
            return;
        }

        return command.handler(args);
    }

    addCommand(command) {
        this.commands[command.slug] = command;
    }
}