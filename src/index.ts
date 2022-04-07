import minimist from 'minimist';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { VK } from 'vk-io';
import Util from './utils/Util';
import VkWorker from './vk/vkWorker';
import Config from './utils/Config';
import FileSystem from './utils/FileSystem';
import FileSystemAsync from './utils/FileSystemAsync';
import Logger from './utils/Logger';
import Command from './command/Command';
import { PluginRepositoryManager } from './plugin/PluginRepository';
import PluginManager from './plugin/PluginManager';
import PluginService from './plugin/PluginsService';

export class Foxium {
    fileSystem = FileSystem;
    fileSystemAsync = FileSystemAsync;
    util = new Util(this);
    config = new Config(this);
    logger = new Logger(this, 'Foxium');
    cmd = new Command(this);
    pluginRepositoryManager = new PluginRepositoryManager(this);
    pluginManager = new PluginManager(this);
    pluginService = new PluginService(this);
    vkWorker = new VkWorker(this);

    botdir = path.resolve('.');
    configDir = `${this.botdir}/config`;
    dataDir = `${this.botdir}/data`;
    pluginDir = `${this.botdir}/plugins`;

    argv = minimist(process.argv.slice(2));
    version: string;
    groupId: number;

    info = (msg: string) => this.logger.info(msg);
    log = (msg: string) => this.logger.log(msg);
    warning = (msg: string) => this.logger.warning(msg);
    error = (msg: string) => this.logger.error(msg);
    shutdownCallbacks = [];
    vk: VK;

    async init() {
        const dirModule = path.dirname(fileURLToPath(import.meta.url));

        if (!this.fileSystem.dirExists(this.configDir)) {
            this.fileSystem.mkdir(this.configDir);
            this.fileSystem.writeFile(
                `${this.configDir}/public.json`,
                this.fileSystem.readFile(`${dirModule}/../default_data/public.json`)
            );
            this.fileSystem.writeFile(
                `${this.configDir}/private.json`,
                this.fileSystem.readFile(`${dirModule}/../default_data/private.json`)
            );
        }

        if (!this.fileSystem.dirExists(this.dataDir)) {
            this.fileSystem.mkdir(this.dataDir);
        }

        if (!this.fileSystem.dirExists(this.pluginDir)) {
            this.fileSystem.mkdir(this.pluginDir);
            this.fileSystem.writeFile(`${this.configDir}/plugins.json`, `[]`);
            this.fileSystem.writeFile(`${this.configDir}/plugins-meta.json`, `[]`);
        }

        const packageData = await this.util.load(`${dirModule}/../package.json`);
        this.version = packageData.version;

        try {
            this.info(`Foxium (HENTA) V${this.version}.`);

            if (this.argv.service) {
                this.warning('Bot started in service mode.');
                return;
            }

            await this.config.init();
            this.vk = await this.vkWorker.init();
            await this.pluginService.init();
            await this.pluginManager.loadPlugins();
            await this.pluginManager.initPlugins();
            process.on('SIGINT', () => this.shutdown());
        } catch (error) {
            this.error(`Bot init: ${error.stack}`);
            await this.shutdown(1);
        }
    }

    async start() {
        try {
            await this.pluginManager.startPlugins();
            await this.vkWorker.start();

            process.on('uncaughtException', error => {
                this.error(`Runtime error: ${error.stack}`);
            });

            this.log('The bot is up and running.');
            await this.pluginService.start();
        } catch (error) {
            this.error(`Bot start: ${error.stack}`);
            await this.shutdown(1);
        }
    }

    async shutdown(code = 0) {
        this.log('Shutting down Foxium...');
        await Promise.all(this.shutdownCallbacks.map(v => v()));
        this.log('Exit.');
        process.exit(code);
    }

    onShutdown(cb) {
        this.shutdownCallbacks.push(cb);
    }
}